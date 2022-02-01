import React, { useContext, useEffect, useState } from "react";
import { TextInput, primaryHighlight } from "../components";
import Layout from "../components/Layout";
import { useForm } from "react-hook-form";
import { SignerContext } from "../App";
import { BigNumber, ethers } from "ethers";
import config from "@project/react-app/src/config/index.json";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";
import PayableButton from "../components/PayableButton";
import Hr from "../components/Hr";

const NewPair = () => {
  const { signer } = useContext(SignerContext);
  const [requirements, setRequirements] = useState<any[]>([]);

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
  } = useForm();

  const onNESubmit = (data: any) => {
    if (!signer) return;
    console.log("Adding pair: ", data);
    mainExchange
      .createErc20Dex(
        data.token1,
        data.token2,
        10 ** 18 * data.quantity1,
        10 ** 18 * data.quantity2
      )
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
          <a
            href="https://academy.binance.com/en/articles/impermanent-loss-explained"
            target={"_blank"}
          >
            here
          </a>
          .
        </p>
      </div>
    </Layout>
  );
};

export default NewPair;
