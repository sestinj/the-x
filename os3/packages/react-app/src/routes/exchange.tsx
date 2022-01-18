import Layout from "../components/Layout";
import React, { useEffect, useState, useContext, useRef } from "react";
import { TextInput, Select, Button, Submit } from "../components";
import addresses from "@project/contracts/src/addresses";
import { ethers } from "ethers";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import { SignerContext } from "../App";
import Table from "../components/Table";
import { useForm } from "react-hook-form";
import { gql, useQuery, useApolloClient } from "@apollo/client";
import { Pair, Token } from "@project/subgraph/generated/schema";

// TODO - You should move all graphql queries somewhere else if there are too many.
// And should make a type for each query, with a good naming convention.
// ex) GET_TOKENS -> type GetTokensResp = Token & {pairs1: {token1: string, token2: string, address: string}}
type PairWithTokens = Pair & { token1: Token; token2: Token };

// You should be able to autogen all of this.
type MiniPair = {
  token2: { id: string; name: string; symbol: string };
  address: string;
  token1: string;
};
type GetTokensResp = Token & {
  pairs1: MiniPair[];
};

const GET_TOKENS = gql`
  query getTokens {
    tokens {
      id
      name
      symbol
      address
      pairs1 {
        token1 {
          id
        }
        token2 {
          id
          name
          symbol
        }
        address
      }
    }
  }
`;

const GET_TOKEN_FRAGMENT = gql`
  fragment token on Token {
    id
    name
    symbol
    address
    pairs1 {
      token1
      token2
      address
    }
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

type GetCurrentExchangeResp = {
  token1: string;
  token2: string;
  address: string;
  price: number;
};
const GET_CURRENT_EXCHANGE = gql`
  query getCurrentExchange($id: ID!) {
    pair(id: $id) {
      id
      token1
      token2
      address
      price
    }
  }
`;

const Exchange = () => {
  const apolloClient = useApolloClient();
  // Web3
  const { signer } = useContext(SignerContext);
  // const provider = useContext(ProviderContext);

  // Main Exchange Contract
  var mainExchange = new ethers.Contract(
    (addresses as any).centralDex,
    CentralDex.abi,
    signer
  );

  useEffect(() => {
    mainExchange = new ethers.Contract(
      (addresses as any).centralDex,
      CentralDex.abi,
      signer
    );
  }, [signer]);

  // Load pairs
  const { data: pairsData } = useQuery<{ pairs: PairWithTokens[] }>(GET_PAIRS, {
    variables: { language: "english" },
  });

  // Exchange State - token1Address => currentExchange => token1, token2
  const [token1Address, setToken1Address] = useState("");
  const [exchangeAddress, setExchangeAddress] = useState("");
  const [currentExchange, setCurrentExchange] = useState<Pair>();
  const { data: tokenData, loading: tokenDataLoading } = useQuery(GET_TOKENS);
  const [token1, setToken1] = useState<any>();
  const [token2, setToken2] = useState<any>();

  const [token2Frags, setToken2Frags] = useState([]);
  const token2SelectRef = useRef<HTMLSelectElement | null>(null);
  const [token2Options, setToken2Options] = useState<HTMLOptionElement[]>([]);

  const reactToChangedExchangeAddress = () => {
    console.log("REACTING: ", exchangeAddress);
    let currEx = apolloClient.readQuery({
      query: GET_CURRENT_EXCHANGE,
      variables: { id: exchangeAddress },
    });
    if (!currEx) {
      return;
    }
    console.log("CURREX: ", currEx);
    let t2 = apolloClient.readFragment({
      id: currEx.token2.__ref,
      fragment: GET_TOKEN_FRAGMENT,
    });
    console.log("New token two!: ", t2);
    setCurrentExchange(currEx);
    setToken2(t2);
  };

  useEffect(() => {
    let newT1 = apolloClient.readFragment({
      id: "Token:" + token1Address,
      fragment: GET_TOKEN_FRAGMENT,
    });
    setToken1(newT1);
    console.log("NEWtoken1: ", newT1, token1Address);

    setToken2Frags(
      token1?.pairs1?.map((pair: any) => {
        return apolloClient.readFragment({
          id: pair.token2.__ref,
          fragment: GET_TOKEN_FRAGMENT,
        });
      }) || []
    );
    setToken2Options(
      token1?.pairs1?.map((pair: any) => {
        let token2Frag = apolloClient.readFragment({
          id: pair.token2.__ref,
          fragment: GET_TOKEN_FRAGMENT,
        });
        return (
          <option key={token2Frag.name} value={pair.address}>
            {token2Frag.name}
          </option>
        );
      })
    );

    // Set the new exchange address, because the select onChange method doesn't trigger when you change the options
    // ISSUE: This is happening before the options are loaded by the map below in the select! How to deal with this?

    if (token2Options?.length) {
      setExchangeAddress(token2Options[0].value);
    }
  }, [token1Address]);

  const [currentPrice, setCurrentPrice] = useState();

  useEffect(reactToChangedExchangeAddress, [exchangeAddress]);

  useEffect(() => {
    if (!currentExchange) {
      return;
    }
    try {
      const dex = new ethers.Contract(
        currentExchange.address,
        Erc20Dex.abi,
        signer
      );
      setExchangeContract(dex);
    } catch (error) {
      setExchangeContract(undefined);
      console.log(error);
    }
  }, [currentExchange]);
  const [exchangeContract, setExchangeContract] = useState<ethers.Contract>();

  const submitOrder = async () => {};

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
                setToken1Address(ev.target.value);
              }}
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
              placeholder={"0.00 " + (token1?.symbol || "ETH")}
            ></TextInput>
            <span
              style={{
                width: "0px",
                display: "inline-block",
                overflow: "visible",
                position: "relative",
                zIndex: "9999",
                left: "-12px",
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
              placeholder={"0.00 " + (token2?.symbol || "DOGE")}
              disabled={true}
            ></TextInput>
            {console.log("TOKEN2: ", token2)}
            <Select
              ref={token2SelectRef}
              onChange={(ev) => {
                setExchangeAddress(ev.target.value);
              }}
            >
              {token2Options}
            </Select>
            <Button
              style={{ borderRadius: "0", margin: "0", height: "100%" }}
              onClick={submitOrder}
            >
              Submit Order
            </Button>
          </div>
          <p>
            Current Price:{" "}
            <span style={{ float: "right" }}>
              {currentPrice || "?"} {token1?.symbol || "ETH"}/
              {token2?.symbol || "DOGE"}
            </span>
          </p>
        </div>
        <h5>Available Exchanges</h5>
        <Table
          rowData={pairsData?.pairs || []}
          rowCell={(data: PairWithTokens) => {
            return [
              <>
                <button
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "white",
                    margin: "none",
                    padding: "none",
                    fontSize: "18px",
                  }}
                  onClick={() => {
                    let currEx = apolloClient.readQuery({
                      query: GET_CURRENT_EXCHANGE,
                      variables: { id: data.address },
                    });
                    if (currEx) {
                      setCurrentExchange(currEx);
                    }
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
                      {data.token1?.address && (
                        <img
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "fill",
                          }}
                          src={`https://raw.githubusercontent.com/dgamingfoundation/erc20-tokens-images/master/images/${data.token1.address}.png`}
                        ></img>
                      )}
                    </div>
                    <p>
                      {data.price} {data.token1.symbol} / {data.token2.symbol}
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
                      {data.token2?.address && (
                        <img
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "fill",
                          }}
                          src={`https://raw.githubusercontent.com/dgamingfoundation/erc20-tokens-images/master/images/${data.token2.address}.png
`}
                        ></img>
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
      </Layout>
    </>
  );
};

export default Exchange;
