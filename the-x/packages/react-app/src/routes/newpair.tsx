import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import config from "@project/react-app/src/config/index.json";
import { BigNumber, ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SignerContext } from "../App";
import { A, primaryHighlight, TextInput } from "../components";
import Hr from "../components/Hr";
import Layout from "../components/Layout";
import PayableButton from "../components/PayableButton";

const NewPair = () => {
  const { signer } = useContext(SignerContext);
  const searchParams = new URLSearchParams(window.location.search);
  const [requirements, setRequirements] = useState<any[]>([
    {
      address: searchParams.get("token1") || "",
      amount: BigNumber.from(10).pow(24),
    },
    {
      address: searchParams.get("token2") || "",
      amount: BigNumber.from(10).pow(24),
    },
  ]);

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

  // New Exchange
  const {
    register: registerNE,
    handleSubmit: handleSubmitNE,
    getValues,
  } = useForm({
    defaultValues: {
      token1: searchParams.get("token1") || "",
      token2: searchParams.get("token2") || "",
      quantity1: undefined,
      quantity2: undefined,
    },
  });

  function isZeroAddress(address: string): boolean {
    return address === "0x0000000000000000000000000000000000000000";
  }

  const onNESubmit = (data: any) => {
    if (!signer) return;
    console.log("Adding pair: ", data);
    const exp = BigNumber.from(10).pow(18); // TODO - not all tokens have same # of decimals

    const value1 = BigNumber.from(data.quantity1).mul(exp);
    const value2 = BigNumber.from(data.quantity2).mul(exp);
    let txValue = BigNumber.from(0);
    if (isZeroAddress(data.token1)) {
      txValue = txValue.add(value1);
    }
    if (isZeroAddress(data.token2)) {
      txValue = txValue.add(value2);
    }
    mainExchange
      .createErc20Dex(data.token1, data.token2, value1, value2, {
        value: txValue,
      })
      .then((tx: any) => {
        console.log("New Exchange created at: ", tx);
      });
  };
  return (
    <Layout>
      <h1>New Pair</h1>
      <div>
        <form
          style={{
            border: "2px solid white",
            borderRadius: "8px",
            overflow: "clip",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            boxShadow: `0px 0px 8px 8px ${primaryHighlight}`,
            padding: "20px",
            margin: "auto",
            width: "auto",
          }}
          onChange={() => {
            setRequirements([
              { address: getValues("token1"), amount: getValues("quantity1") },
              { address: getValues("token2"), amount: getValues("quantity2") },
            ]);
            console.log(
              "requirements changed: ",
              getValues("token1"),
              getValues("token2")
            );
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto auto",
              gridTemplateRows: "auto auto",
              gap: "20px",
              rowGap: "20px",
            }}
          >
            <TextInput
              style={{ gridColumn: "1", gridRow: "1" }}
              placeholder="Token Address 1"
              {...registerNE("token1")}
            ></TextInput>
            <TextInput
              style={{ gridColumn: "1", gridRow: "2" }}
              placeholder="Token Address 2"
              {...registerNE("token2")}
            ></TextInput>
            <TextInput
              style={{ gridColumn: "2", gridRow: "1" }}
              type="number"
              placeholder="Token 1 Liquidity"
              {...registerNE("quantity1")}
            ></TextInput>
            <TextInput
              style={{ gridColumn: "2", gridRow: "2" }}
              type="number"
              placeholder="Token 2 Liquidity"
              {...registerNE("quantity2")}
            ></TextInput>
          </div>

          <br></br>
          <br></br>
          <PayableButton
            onClick={handleSubmitNE(onNESubmit)}
            requirements={requirements}
            spender={config.addresses.centralDex}
          >
            Add New Exchange
          </PayableButton>
        </form>
      </div>

      <Hr></Hr>
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h4>Important Notes</h4>
        <p>
          You should take the time to ensure that the proportion of tokens that
          you add to the initial pool matches the current market price. You will
          be better rewarded by accuracy. Learn more about impermanent loss{" "}
          <A
            href="https://academy.binance.com/en/articles/impermanent-loss-explained"
            target={"_blank"}
          >
            here
          </A>
          .
        </p>
      </div>
    </Layout>
  );
};

export default NewPair;
