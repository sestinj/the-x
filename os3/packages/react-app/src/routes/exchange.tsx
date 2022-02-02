import Layout from "../components/Layout";
import React, { useEffect, useState, useContext } from "react";
import { TextInput, Button, SpecialButton } from "../components";
import Hr from "../components/Hr";
import config from "@project/react-app/src/config/index.json";
import { ethers } from "ethers";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import { ProviderContext, SignerContext } from "../App";

import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Pair, Token } from "@project/subgraph/generated/schema";
import { isAddress } from "../libs"; // TODO There should be a libs package so you aren't importing cross-package like this.
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import TokenSelect from "../components/TokenSelect";
import {
  Token as TokenListToken,
  DEFAULT_TOKEN,
} from "../components/TokenSelect/compileTokenLists";
import { useDispatch } from "react-redux";
import { addTx, Tx } from "../redux/slices/txsSlice";
import { addAlert, Alert } from "../redux/slices/alertSlice";

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

const PAIR_FRAG = gql`
  fragment pair on Pair {
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
  const provider = useContext(ProviderContext);

  // STATE MANAGEMENT START***********************************************************
  const apolloClient = useApolloClient();
  const dispatch = useDispatch();

  const { data: tokenData } = useQuery<{ tokens: Token[] }>(GET_TOKENS);
  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);

  const [token1, setToken1] = useState<TokenListToken>(DEFAULT_TOKEN);
  const [token2, setToken2] = useState<TokenListToken>(DEFAULT_TOKEN);
  const [currentPair, setCurrentPair] = useState<Pair | undefined>(undefined);

  useEffect(() => {
    let newPair = apolloClient.readFragment({
      id: "Pair:" + token1.address + token2.address,
      fragment: PAIR_FRAG,
    });
    if (newPair) {
      setCurrentPair(newPair);
    }

    if (!currentPair) {
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
    console.log("Submitting Order...");
    // First, give allowance for the token
    const tokenContract = new ethers.Contract(
      token1.address,
      ERC20.abi,
      signer
    );

    // Second, submit the bid to pairContract
    const pairContract = new ethers.Contract(
      currentPair.address,
      Erc20Dex.abi,
      signer
    );

    const tx = await tokenContract.approve(pairContract.address, quantity);
    console.log("Waiting for funds to be approved");
    await tx.wait();
    console.log("Approved amount of token1: ", tx);
    // TODO - Everyone submits a bid at the price? They don't set their own? What do you do about this?
    // TODO - run some checks on the quantity
    pairContract.submitBid(currentPair.price, quantity).then((tx: any) => {
      console.log("Submitted Bid: ", tx);

      // If the bid went through, create an alert.
      dispatch(
        addAlert({
          title: `Traded ${token1.symbol} for ${quantity} ${token2.symbol}`,
          message: "View the transaction on Etherscan",
          id: "TODO: THE HASH OF the TRANSACTION" + tx.hash,
        } as Alert)
      );
      dispatch(addTx(tx.hash)); // TODO same as just above
    });
  };

  const [modalOpen, setModalOpen] = useState(true);

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
                Current Price: {currentPair?.price} {token1.symbol}/
                {token2.symbol}
              </span>
              <br></br>
              <span style={{ float: "right" }}>Fees: 0.00</span>

              <br></br>
              <span style={{ float: "right" }}>
                Total:{" "}
                <b>
                  {currentPair?.price} {token1.symbol}
                </b>
              </span>
            </p>

            <Spinner style={{ filter: "invert(1)" }}></Spinner>
          </div>
          <div style={{ textAlign: "center" }}>
            <SpecialButton
              style={{
                width: "75%",
              }}
            >
              Confirm
            </SpecialButton>
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
              height: "50px",
            }}
          >
            <TokenSelect
              onChange={(token: TokenListToken) => {
                setToken1(token);
                console.log("New Token 1: ", token1);
              }}
            ></TokenSelect>
            <TextInput
              style={{
                borderRight: "1px solid white",
                borderLeft: "1px solid black",
                height: "100%",
              }}
              placeholder={
                (currentPair ? currentPair.price * quantity : "0.00") +
                " " +
                token1.symbol
              }
              value={
                (currentPair ? currentPair.price * quantity : "0.00") +
                " " +
                token1.symbol
              }
              disabled={true}
            ></TextInput>
            <span
              style={{
                width: "0px",
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
              ➡️
            </span>
            <TextInput
              style={{
                borderLeft: "1px solid white",
                borderRight: "1px solid black",
                textAlign: "right",
                height: "100%",
              }}
              placeholder={"0.00 " + token2.symbol}
              onChange={(ev) => {
                setQuantity(parseFloat(ev.target.value));
              }}
            ></TextInput>
            <TokenSelect
              onChange={(token: TokenListToken) => {
                setToken2(token);
                console.log("New Token 2: ", token1);
              }}
            ></TokenSelect>
            <Button
              style={{ borderRadius: "0", margin: "0", height: "100%" }}
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
              {token1Balance.toString()} {token1.symbol}
              <br></br>
              {token2Balance.toString()} {token2.symbol}
            </span>
            <span style={{ float: "right" }}>
              Current Price: {currentPair?.price} {token1.symbol}/
              {token2.symbol}
            </span>
            <br></br>
            <span style={{ float: "right" }}>Fees: 0.00</span>

            <br></br>
            <span style={{ float: "right" }}>
              Total:{" "}
              <b>
                {currentPair?.price} {token1.symbol}
              </b>
            </span>
          </p>
        </div>
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
