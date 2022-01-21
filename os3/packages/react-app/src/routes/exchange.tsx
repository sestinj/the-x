import Layout from "../components/Layout";
import React, { useEffect, useState, useContext, useRef } from "react";
import { TextInput, Select, Button, Submit } from "../components";
import Hr from "../components/Hr";
import config from "@project/react-app/src/config/index.json";
import { ethers } from "ethers";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import { ProviderContext, SignerContext } from "../App";
import Table from "../components/Table";
import SafeImg from "../components/SafeImg/SafeImg";
import { useForm } from "react-hook-form";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Pair, Token } from "@project/subgraph/generated/schema";
import { isAddress } from "../libs"; // TODO There should be a libs package so you aren't importing cross-package like this.

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

const SHIB = {
  id: "0x0",
  name: "Shiba Inu",
  symbol: "SHIB",
  address: "0x0",
} as Token;
const DOGE = {
  id: "0x1",
  name: "Dogecoin",
  symbol: "DOGE",
  address: "0x1",
} as Token;
const SHIB_DOGE = {
  id: "0x00x1",
  address: "0x3",
  price: 42,
  token1: SHIB,
  token2: DOGE,
} as any;
// TODO - when the page first loads, the selected options have no corresponding token value. Only after changing each of them can you set the exchange.

const Exchange = () => {
  const { signer } = useContext(SignerContext);
  const provider = useContext(ProviderContext);

  // STATE MANAGEMENT START***********************************************************
  const apolloClient = useApolloClient();

  const { data: tokenData } = useQuery<{ tokens: Token[] }>(GET_TOKENS);
  const { data: pairData } = useQuery<{ pairs: Pair[] }>(GET_PAIRS);

  const [token1, setToken1] = useState<Token>(SHIB);
  const [token2, setToken2] = useState<Token>(DOGE);
  const [currentPair, setCurrentPair] = useState<Pair>(SHIB_DOGE);

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
    });
  };

  // New Exchange
  const { register: registerNE, handleSubmit: handleSubmitNE } = useForm();

  const onNESubmit = (data: any) => {
    if (!signer) return;
    console.log("Adding pair: ", data);
    mainExchange.createErc20Dex(data.token1, data.token2).then((tx: any) => {
      console.log("New Exchange created at: ", tx);
    });
  };

  return (
    <>
      <Layout>
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
            }}
          >
            <Select
              onChange={(ev) => {
                let newToken = apolloClient.readFragment({
                  id: "Token:" + ev.target.value,
                  fragment: TOKEN_FRAG,
                });
                if (newToken) {
                  setToken1(newToken);
                }
                console.log("New Token 1: ", token1);
              }}
              value={token1.address}
            >
              {tokenData?.tokens?.map((token: any) => {
                return (
                  <option key={token.address} value={token.address}>
                    {token.name}
                  </option>
                );
              })}
            </Select>
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
                zIndex: "9999",
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
            <Select
              onChange={(ev) => {
                let newToken = apolloClient.readFragment({
                  id: "Token:" + ev.target.value,
                  fragment: TOKEN_FRAG,
                });
                if (newToken) {
                  setToken2(newToken);
                }
              }}
              value={token2.address}
            >
              {tokenData?.tokens?.map((token: any) => {
                return (
                  <option key={token.address} value={token.address}>
                    {token.name}
                  </option>
                );
              })}
            </Select>
            <Button
              style={{ borderRadius: "0", margin: "0", height: "100%" }}
              onClick={submitOrder}
            >
              Submit Order
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
              Current Price: {currentPair.price} {token1.symbol}/{token2.symbol}
            </span>
            <br></br>
            <span style={{ float: "right" }}>Fees: 0.00</span>

            <br></br>
            <span style={{ float: "right" }}>
              Total:{" "}
              <b>
                {currentPair.price} {token1.symbol}
              </b>
            </span>
          </p>
        </div>
        <h5>Available Exchanges</h5>
        <Table
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
        ></Table>
        <br></br>
        <form
          style={{ textAlign: "center" }}
          onSubmit={handleSubmitNE(onNESubmit)}
        >
          <h5>Add a token pair:</h5>
          <TextInput
            placeholder="Token Address 1"
            {...registerNE("token1")}
          ></TextInput>
          <TextInput
            placeholder="Token Address 2"
            {...registerNE("token2")}
          ></TextInput>
          <br></br>
          <br></br>
          <Submit value="Add New Exchange" />
        </form>
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
              Each token trade is facilitated by a smart contract between a
              SINGLE PAIR of tokens in a SINGLE DIRECTION. So at the moment you
              might be able to select two tokens in the dropdown for which a
              pair doesn't actually exist. A next step for me is to create a
              "bridge finder" that lets you trade any 2 supported tokens by
              daisy-chaining pairs, but until then you can just use the
              Available Pairs table - all listed pairs there are valid.
            </li>
          </ul>
        </div>
      </Layout>
    </>
  );
};

export default Exchange;
