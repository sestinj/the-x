import { gql, useApolloClient, useQuery } from "@apollo/client";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import config from "@project/react-app/src/config/index.json";
import { Pair, Token } from "@project/subgraph/generated/schema";
import { ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ProviderContext, SignerContext } from "../App";
import { Button, TextInput } from "../components";
import { LineChart } from "../components/charts/d3";
import Hr from "../components/Hr";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import PayableButton from "../components/PayableButton";
import Spinner from "../components/Spinner";
import TokenSelect from "../components/TokenSelect";
import {
  DEFAULT_TOKEN,
  Token as TokenListToken,
} from "../components/TokenSelect/compileTokenLists";
import { isAddress } from "../libs"; // TODO There should be a libs package so you aren't importing cross-package like this.
import { getEtherscanUrlTx } from "../libs/etherscan/index";
import useMobileMediaQuery from "../libs/hooks/useMobileMediaQuery";
import { addAlert, Alert } from "../redux/slices/alertSlice";
import { addTx } from "../redux/slices/txsSlice";

const GET_TOKENS = gql`
  query getTokens {
    tokens {
      id
      name
      symbol
      address
    }
  }
`;

const TOKEN_FRAG = gql`
  fragment token on Token {
    id
    name
    symbol
    address
  }
`;

const GET_PRICE_HISTORY = gql`
  query priceHistory($id: ID!) {
    pair(id: $id) {
      id
      dailyStats {
        id
        day
        price
      }
      hourlyStats {
        id
        hour
        price
      }
    }
  }
`;

const PAIR_FRAG = gql`
  fragment PairFrag on Pair {
    id
    address
    price
  }
`;

const GET_PAIRS = gql`
  query getPairs {
    pairs {
      id
      token1 {
        id
        address
        name
        symbol
      }
      token2 {
        id
        address
        name
        symbol
      }
      address
      price
    }
  }
`;
// TODO - when the page first loads, the selected options have no corresponding token value. Only after changing each of them can you set the exchange.

const Exchange = () => {
  const { signer } = useContext(SignerContext);
  const { provider } = useContext(ProviderContext);

  const isMobile = useMobileMediaQuery();

  // STATE MANAGEMENT START***********************************************************
  const apolloClient = useApolloClient();
  const dispatch = useDispatch();

  const { data: tokenData } = useQuery<{ tokens: Token[] }>(GET_TOKENS);
  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);

  const [token1, setToken1] = useState<TokenListToken>(DEFAULT_TOKEN);
  const [token2, setToken2] = useState<TokenListToken>(DEFAULT_TOKEN);
  const [currentPair, setCurrentPair] = useState<Pair | undefined>(undefined); // TODO yuck

  const { data: statsData, loading, error } = useQuery<any>(GET_PRICE_HISTORY, {
    variables: { id: (token1.address + token2.address).toLowerCase() },
  });

  function parsePrice(): number {
    return parseFloat(currentPair?.price.toString() || "0");
  } // TODO - This also should not exist

  useEffect(() => {
    const id = "Pair:" + (token1.address + token2.address).toLowerCase();
    let newPair = apolloClient.readFragment({
      id: id,
      fragment: PAIR_FRAG,
    });
    if (newPair) {
      setCurrentPair(newPair);
    }

    if (!newPair) {
      // There is no pair between these two, do something about it
      console.log("NO EXCHANGE FOR THIS PAIR");
    }

    console.log("EXCHANGE Changed: ", currentPair);
  }, [token1, token2]);

  // Getting balance directly from the contract for now
  const [token1Balance, setToken1Balance] = useState(0);
  const [token2Balance, setToken2Balance] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (!isAddress(token1.address)) {
          return;
        }
        if (!signer) {
          return;
        }
        const tokenContract = new ethers.Contract(
          token1.address,
          ERC20.abi,
          signer
        );
        const signerAddress = await signer.getAddress();
        const tx = await tokenContract.balanceOf(signerAddress);
        setToken1Balance(tx);
      } catch (err) {
        console.error("Unable to getBalance of token: ", err);
      }
    })();
  }, [token1]);

  useEffect(() => {
    (async () => {
      try {
        if (!isAddress(token1.address)) {
          return;
        }
        if (!signer) {
          return;
        }
        const tokenContract = new ethers.Contract(
          token2.address,
          ERC20.abi,
          signer
        );
        const signerAddress = await signer.getAddress();
        const tx = await tokenContract.balanceOf(signerAddress);
        setToken2Balance(tx);
      } catch (err) {
        console.log("Unable to getBalance of token: ", err);
      }
    })();
  }, [token2]);

  // User input state

  const [quantity, setQuantity] = useState(0);

  // STATE MANAGEMENT END*************************************************************

  // Main Exchange Contract
  var mainExchange = new ethers.Contract(
    config.addresses.centralDex,
    CentralDex.abi,
    signer
  );

  useEffect(() => {
    mainExchange = new ethers.Contract(
      config.addresses.centralDex,
      CentralDex.abi,
      signer
    );
  }, [signer]);

  const submitOrder = async () => {
    if (!currentPair) {
      return;
    }
    setModalOpen(true);
  };

  const confirmOrder = async () => {
    console.log("Confirming");
    if (!currentPair) {
      return;
    }
    const pairContract = new ethers.Contract(
      currentPair.address,
      Erc20Dex.abi,
      signer
    );
    const scaledQuantity = ethers.utils.parseUnits(
      quantity.toString(),
      token2.decimals
    );
    // TODO - Everyone submits a bid at the price? They don't set their own? What do you do about this?
    // TODO - run some checks on the quantity

    pairContract.swap(scaledQuantity, true).then((tx: any) => {
      console.log("Submitted Bid: ", tx);

      setModalOpen(false);

      // If the bid went through, create an alert.
      dispatch(
        addAlert({
          title: `Traded ${token1.symbol} for ${quantity} ${token2.symbol}`,
          message: "View the transaction on Etherscan",
          id: "TODO: THE HASH OF the TRANSACTION" + tx.hash,
          actionUrl: getEtherscanUrlTx(tx.hash, config.name),
        } as Alert)
      );
      dispatch(addTx(tx.hash)); // TODO same as just above
    });
  };

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Layout>
        <Modal
          open={modalOpen}
          closeModal={() => {
            setModalOpen(false);
          }}
        >
          <h3>Confirm Trade</h3>
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <p>
              <span style={{ float: "left" }}>
                Balances: <br></br>
                {token1Balance.toString()} {token1.symbol}
                <br></br>
                {token2Balance.toString()} {token2.symbol}
              </span>
              <span style={{ float: "right" }}>
                Current Price: {currentPair?.price.toString()} {token1.symbol}/
                {token2.symbol}
              </span>
              <br></br>
              <span style={{ float: "right" }}>Fees: 0.00</span>

              <br></br>
              <span style={{ float: "right" }}>
                Total:{" "}
                <b>
                  {(currentPair?.price || 0 * quantity).toString()}{" "}
                  {token1.symbol}
                </b>
              </span>
            </p>

            <Spinner style={{ filter: "invert(1)" }}></Spinner>
          </div>
          <div style={{ textAlign: "center" }}>
            <PayableButton
              requirements={[
                {
                  address: token1.address,
                  amount: ethers.utils.parseUnits(
                    (parsePrice() * quantity).toString(),
                    token1.decimals
                  ), // TODO - ew
                },
              ]}
              spender={currentPair?.address || ""}
              onClick={confirmOrder}
            >
              Confirm
            </PayableButton>
          </div>
        </Modal>

        <h1>Exchange</h1>
        <div>
          <div
            style={{
              border: "2px solid white",
              borderRadius: "8px",
              overflow: "clip",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: isMobile ? "" : "50px",
              flexDirection: isMobile ? "column" : "row",
            }}
          >
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <TokenSelect
                onChange={(token: TokenListToken) => {
                  setToken1(token);
                  console.log("New Token 1: ", token1);
                }}
              ></TokenSelect>
              <TextInput
                style={{
                  borderRight: isMobile ? "" : "1px solid white",
                  borderLeft: isMobile ? "" : "1px solid black",
                  order: isMobile ? "-1" : "",
                }}
                placeholder={
                  (currentPair?.price || 0 * quantity).toString() +
                  " " +
                  token1.symbol
                }
                value={
                  (currentPair?.price || 0 * quantity).toString() +
                  " " +
                  token1.symbol
                }
                disabled={true}
              ></TextInput>
            </div>
            <span
              style={{
                width: "0px",
                height: "0px",
                top: "-16px",
                display: "inline-block",
                overflow: "visible",
                position: "relative",
                zIndex: "10",
                left: "-12px",
                fontSize: "24px",
                cursor: "pointer",
              }}
              onClick={() => {
                // Switch places of the two tokens
                let temp = token1;
                setToken1(token2);
                setToken2(temp);
              }}
            >
              {isMobile ? "⬇️" : "➡️"}
            </span>
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <TextInput
                style={{
                  borderLeft: isMobile ? "" : "1px solid white",
                  borderRight: isMobile ? "" : "1px solid black",
                  textAlign: "right",
                }}
                placeholder={"0.00 " + token2.symbol}
                onChange={(ev) => {
                  setQuantity(parseFloat(ev.target.value) || 0);
                }}
              ></TextInput>
              <TokenSelect
                onChange={(token: TokenListToken) => {
                  setToken2(token);
                  console.log("New Token 2: ", token1);
                }}
              ></TokenSelect>
            </div>
            <Button
              style={{
                borderRadius: "0",
                margin: "0",
                height: "100%",
                width: isMobile ? "100%" : "",
              }}
              onClick={
                currentPair
                  ? submitOrder
                  : () => {
                      window.location.href = `./newpair?token1=${token1.address}&token2=${token2.address}`;
                    }
              }
            >
              {currentPair ? "Trade" : "Add Pair"}
            </Button>
          </div>
          <p>
            <span style={{ float: "left" }}>
              Balances: <br></br>
              {parseFloat(
                ethers.utils.formatUnits(
                  token1Balance.toString(),
                  token1.decimals
                )
              ).toFixed(4)}{" "}
              {token1.symbol}
              <br></br>
              {parseFloat(
                ethers.utils.formatUnits(
                  token2Balance.toString(),
                  token2.decimals
                )
              ).toFixed(4)}{" "}
              {token2.symbol}
            </span>
            <span style={{ float: "right" }}>
              Current Price:{" "}
              {parsePrice()
                .toPrecision(4)
                .toString()}{" "}
              {token1.symbol}/{token2.symbol}
            </span>
            <br></br>
            <span style={{ float: "right" }}>Fees: 0.00</span>

            <br></br>
            <span style={{ float: "right" }}>
              Total:{" "}
              <b>
                {(parsePrice() * quantity).toString()} {token1.symbol}
              </b>
            </span>
          </p>
        </div>
        {console.log(
          "ss: ",
          statsData?.pair?.dailyStats.map(
            (dayStats: any, index: number) => index
          ) || [1, 2],
          statsData?.pair?.dailyStats.map((dayStats: any) =>
            parseFloat(dayStats.price)
          ) || [1, 2]
        )}
        <LineChart
          title="Hourly Price"
          labels={["Price History"]}
          width="500px"
          height="300px"
          yLabel={`Price (${token1.symbol}/${token2.symbol})`}
          x={
            statsData?.pair?.hourlyStats.map((dayStats: any, index: number) =>
              new Date(dayStats.hour * 60 * 60 * 1000).getUTCHours()
            ) || [1, 2]
          }
          y={
            statsData?.pair?.hourlyStats.map((dayStats: any) =>
              parseFloat(dayStats.price)
            ) || [1, 1]
          }
        ></LineChart>

        {/* <h5>Available Exchanges</h5> */}
        {/* <Table
          rowData={pairData?.pairs || []}
          rowCell={(data: Pair) => {
            return [
              <>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    margin: "none",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    let newToken1 = apolloClient.readFragment({
                      id: "Token:" + (data.token1 as any).address,
                      fragment: TOKEN_FRAG,
                    });
                    if (newToken1) {
                      setToken1(newToken1);
                    }

                    let newToken2 = apolloClient.readFragment({
                      id: "Token:" + (data.token2 as any).address,
                      fragment: TOKEN_FRAG,
                    });
                    if (newToken2) {
                      setToken2(newToken2);
                    }
                    console.log(
                      "New tokens: ",
                      newToken1,
                      newToken2,
                      token1,
                      token2
                    );
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto auto auto",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        gridColumn: "1",
                        borderRadius: "50%",
                        overflow: "hidden",
                        height: "70px",
                        width: "70px",
                        margin: "20px",
                      }}
                    >
                      {// What's going on here? TODO THE ISSUE is that you're using the Graph autogenerated types, but they don't correspond to what Apollo gives you. Need another source of GraphQL types. I'm sure there's a tool out there so you can autogen still.
                      (data.token1 as any).address && (
                        <SafeImg
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "fill",
                          }}
                          address={(data.token1 as any).address}
                        ></SafeImg>
                      )}
                    </div>
                    <p>
                      {data.price} {(data.token1 as any).symbol} /{" "}
                      {(data.token2 as any).symbol}
                    </p>
                    <div
                      style={{
                        borderRadius: "50%",
                        overflow: "hidden",
                        height: "70px",
                        width: "70px",
                        margin: "20px",
                        float: "right",
                      }}
                    >
                      {(data.token2 as any).address && (
                        <SafeImg
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "fill",
                          }}
                          address={(data.token2 as any).address}
                        ></SafeImg>
                      )}
                    </div>
                  </div>
                </button>
              </>,
            ];
          }}
        ></Table> */}
        {/* <br></br>
        <Link to="/newpair">Add New Pair</Link> */}

        <br></br>

        <div hidden>
          <h4>Want to trade a token you don't see listed?</h4>
          <p>Submit a request here and we'll add it within one day.</p>
          {/* When a new token is listed there probably won't be eiter enough liquidity or contract balance to trade it, but you could recommend to the user that they instead add to the liquidity pool, because low liquidity means higher APY */}
          <div>
            <label htmlFor="suggestionInput">Enter token address:</label>
            <TextInput
              id="suggestionInput"
              placeholder="ex) 0xba2ae424d960c26247dd6c32edc70b295c744c43"
            ></TextInput>
            <Button>Submit</Button>
          </div>
        </div>
        <br></br>
        <Hr></Hr>
        <div
          style={{
            margin: "20px",
          }}
        >
          <h4 style={{ textAlign: "center" }}>Notes to Alpha Users</h4>
          <ul>
            {/* <li>If you are looking to give feedback, first do so however you would on your own. After this, it would be helpful to know everything that gave you pause, wasn't super obvious, bothered your aesthetic sense, or wasn't included that you thought should be.</li> */}
            <li>
              Nothing specific for now, just let me know of ALL details that you
              do not like.
            </li>
          </ul>
        </div>
      </Layout>
    </>
  );
};

export default Exchange;
