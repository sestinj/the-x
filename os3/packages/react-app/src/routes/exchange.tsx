import Layout from "../components/Layout";
import React, { useEffect, useState, useContext } from "react";
import { TextInput, Select, Button, Submit } from "../components";
import addresses from "@project/contracts/src/addresses";
import { ethers } from "ethers";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import { SignerContext } from "../App";
import Table from "../components/Table";
import { useForm } from "react-hook-form";
import { gql, useLazyQuery, useQuery, useApolloClient } from "@apollo/client";
import { Pair, Token } from "@project/subgraph/generated/schema";

const GET_TOKENS = gql`
  query getTokens {
    token {
      name
      symbol
      address
      pairs {
        token1
        token2
        address
      }
    }
  }
`;

const GET_TOKEN = gql`
  query getToken($id: ID!) {
    token(id: $id) {
      name
      symbol
      address
      pairs {
        token1
        token2
        address
      }
    }
  }
`;

const GET_PAIRS = gql`
  query getPairs {
    pairs {
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
    }
  }
`;

const GET_CURRENT_EXCHANGE = gql`
  query getCurrentExchange($token1: ID!, $token2: ID!) {
    pair(token1: $token1, token2: $token2) {
      token1
      token2
      address
      price
    }
  }
`;

const GET_TOKEN2_OPTIONS = gql`
  query getToken2Options($token1: ID!) {
    pairs(token1: $token1) {
      token2 {
        name
        address
      }
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
    console.log("Resetting main exchange with signer: ", signer);
    mainExchange = new ethers.Contract(
      (addresses as any).centralDex,
      CentralDex.abi,
      signer
    );
  }, [signer]);

  // Load pairs
  const { data: pairsData } = useQuery(GET_PAIRS, {
    variables: { language: "english" },
  });

  // Exchange State

  const [token1Address, setToken1Address] = useState("");
  const [token2Address, setToken2Address] = useState("");
  const { data: tokens } = useQuery<Token[]>(GET_TOKENS);
  const [token1, setToken1] = useState<Token | null>();
  const [token2, setToken2] = useState<Token | null>();

  useEffect(() => {
    setToken1(
      apolloClient.readQuery({
        query: GET_TOKEN,
        variables: { id: token1Address },
      })
    );
  }, [token1Address]);

  useEffect(() => {
    setToken2(
      apolloClient.readQuery({
        query: GET_TOKEN,
        variables: { id: token2Address },
      })
    );
  }, [token2Address]);

  const [currentPrice, setCurrentPrice] = useState();

  const getCurrentExchange = () => {
    const pair = apolloClient.readQuery({
      query: GET_CURRENT_EXCHANGE,
      variables: { token1: token1Address, token2: token2Address },
    })?.pair;
    return pair || { address: "0x0" };
  };
  useEffect(() => {
    const currentExchange = getCurrentExchange();
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
  }, [token1Address, token2Address]);
  const [exchangeContract, setExchangeContract] = useState<ethers.Contract>();

  // Table data preparation
  const tableData: [string, string][] = [];

  useEffect(() => {
    (pairsData?.length ? pairsData : undefined)?.forEach((pair: Pair) => {
      tableData.push([pair.token1, pair.token2]);
    });
  }, [pairsData]);

  const submitOrder = async () => {};

  const [token2Options, setToken2Options] = useState([]);

  useEffect(() => {
    setToken2Options(
      apolloClient.readQuery({
        query: GET_TOKEN2_OPTIONS,
        variables: { token1: token1Address },
      }) || []
    );
  }, [token1Address]);

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
              {(pairsData?.length ? pairsData : undefined)?.map(
                (pair: Pair & { token1: Token }) => {
                  const key = pair.token1.name;
                  return (
                    <option key={key} value={pair.token1.address}>
                      {key}
                    </option>
                  );
                }
              )}
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
            <Select
              onChange={(ev) => {
                setToken2Address(ev.target.value);
              }}
            >
              {token2Options.map((token2Option: Token) => {
                const name = token2Option.name;
                return (
                  <option key={name} value={token2Option.address}>
                    {name}
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
            Current Price:{" "}
            <span style={{ float: "right" }}>
              {currentPrice || "?"} {token1?.symbol || "ETH"}/
              {token2?.symbol || "DOGE"}
            </span>
          </p>
        </div>
        <h5>Available Exchanges</h5>
        <Table
          rowData={
            (pairsData?.length ? pairsData : undefined)?.pairs.length
              ? pairsData.pairs
              : [
                  {
                    address: "idk",
                    token1: "0x6A9973322502281205dA4775adbb2249B0f85577",
                    token2: "0x7dD057E3580DB225D263d97fcF3ee56077973F8b",
                  },
                  {
                    address: "idk",
                    token1: "0x7dD057E3580DB225D263d97fcF3ee56077973F8b",
                    token2: "0x6A9973322502281205dA4775adbb2249B0f85577",
                  },
                ]
          }
          rowCell={(data: {
            token1: Token;
            token2: Token;
            address: string;
          }) => {
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
                    if (token1 && token2) {
                      setToken1Address(token1.address);
                      setToken2Address(token2.address);
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
                      <img
                        style={{
                          objectFit: "fill",
                          width: "100%",
                          height: "100%",
                        }}
                        src={`https://raw.githubusercontent.com/dgamingfoundation/erc20-tokens-images/master/images/${token1?.address ||
                          "0x0200412995f1bafef0d3f97c4e28ac2515ec1ece"}.png
`}
                      ></img>
                    </div>
                    <p>1.5 ETH / DOGE</p>
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
                      <img
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "fill",
                        }}
                        src={`https://raw.githubusercontent.com/dgamingfoundation/erc20-tokens-images/master/images/${token2?.address ||
                          "0x075c60ee2cd308ff47873b38bd9a0fa5853382c4"}.png
`}
                      ></img>
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
