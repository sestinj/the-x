import Layout from "../components/Layout";
import ExchangeTokenList from "../json/ExchangeTokenList";
import React, { useEffect, useState, useContext } from "react";
import { TextInput, Select, Button, Submit } from "../components";
import addresses from "@project/contracts/src/addresses";
import { ethers } from "ethers";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import Erc20Dex from "@project/contracts/artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import { SignerContext } from "../App";
import Table from "../components/Table";
import { useForm } from "react-hook-form";

const Exchange = () => {
  const [token1, setToken1] = useState("Ethereum");
  const [token2, setToken2] = useState("Dogecoin");
  const [token2SelectOptions, setToken2SelectOptions] = useState<
    React.ReactNode[]
  >([]);
  const [exchangeList, setExchangeList] = useState<[string, string][]>([]);
  const [currentPrice, setCurrentPrice] = useState();

  const { register: registerNE, handleSubmit: handleSubmitNE } = useForm();

  const { signer } = useContext(SignerContext);
  // const provider = useContext(ProviderContext);

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

  const [exchangeContract, setExchangeContract] = useState<ethers.Contract>();

  useEffect(() => {
    // Set the current exchange for this token pair.
    try {
      const dex = new ethers.Contract(
        (ExchangeTokenList as any)[token1].exchanges[token1],
        Erc20Dex.abi,
        signer
      );
      setExchangeContract(dex);
    } catch (error) {
      setExchangeContract(undefined);
      console.log(error);
    }
  }, [token1, token2]);

  const getCurrentPrice = async () => {
    // Get the current price of the selected coin
    if (!signer) return;
    if (exchangeContract) {
      exchangeContract.currentPrice().then((tx: any) => {
        console.log(tx);
      });
    }
  };

  useEffect(() => {
    getCurrentPrice();
  }, [token1, token2]);

  const getExistingExchanges = async () => {
    if (!signer) return;
    mainExchange.listExchanges().then((tx: any) => {
      console.log("Exchange List:");
      console.log(tx);
      setExchangeList(tx);
    });
  };

  useEffect(() => {
    getExistingExchanges();
  }, [signer]);

  const submitOrder = async () => {};

  useEffect(() => {
    const token = (ExchangeTokenList as any)[token1];
    const names = Object.keys(token.exchanges);
    setToken2SelectOptions(
      names.map((name: string) => {
        return (
          <option key={name} value={name}>
            {name}
          </option>
        );
      })
    );
  }, [token1]);

  // Table data preparation
  const tableData: [string, string][] = [];

  Object.keys(ExchangeTokenList).forEach((token1: string) => {
    Object.keys((ExchangeTokenList as any)[token1].exchanges).forEach(
      (token2: string) => {
        tableData.push([token1, token2]);
      }
    );
  });

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
                setToken1(ev.target.value);
              }}
            >
              {Object.keys(ExchangeTokenList).map((key: string) => {
                return (
                  <option key={key} value={key}>
                    {key}
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
              placeholder={"0.00 " + (ExchangeTokenList as any)[token1].symbol}
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
              placeholder={"0.00 " + (ExchangeTokenList as any)[token2].symbol}
              disabled={true}
            ></TextInput>
            <Select
              onChange={(ev) => {
                setToken2(ev.target.value);
              }}
            >
              {token2SelectOptions}
            </Select>
            <Button
              style={{ borderRadius: "0", margin: "0", height: "100%" }}
              onClick={submitOrder}
            >
              Submit Order
            </Button>
          </div>
          <p>Current Price: {currentPrice}</p>
        </div>
        <h5>Available Exchanges</h5>
        <Table
          rowData={exchangeList}
          rowCell={(data) => {
            return [
              <>
                test
                {/* {(ExchangeTokenList as any)[data[0]].symbol}
                {"  ->  "}
                {(ExchangeTokenList as any)[data[1]].symbol} */}
              </>,
            ];
          }}
        ></Table>
        <br></br>
        <form onSubmit={handleSubmitNE(onNESubmit)}>
          <TextInput
            placeholder="Token Address 1"
            {...registerNE("token1")}
          ></TextInput>
          <TextInput
            placeholder="Token Address 2"
            {...registerNE("token2")}
          ></TextInput>
          <br></br>
          <Submit value="Add New Exchange" />
        </form>

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
