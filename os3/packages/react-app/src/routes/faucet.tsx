import React, { useContext, useState } from "react";
import { ethers } from "ethers";
import Layout from "../components/Layout";
import { SignerContext } from "../App";
import TokenSelect from "../components/TokenSelect";
import { DEFAULT_TOKEN } from "../components/TokenSelect/compileTokenLists";
import { Button } from "../components";
import { useContract } from "../libs";
import config from "../config/index.json";
import { Faucet } from "@project/contracts/artifacts/src/dex/";

const Faucet = () => {
  const { signer } = useContext(SignerContext);
  const [token, setToken] = useState(DEFAULT_TOKEN);

  const faucetContract = useContract(config.addresses.faucet);

  const drip = async () => {};

  return (
    <Layout>
      <h1>Faucet</h1>
      <TokenSelect
        onChange={(token) => {
          setToken(token);
        }}
      ></TokenSelect>
      <Button onClick={drip}>Get {token.symbol}</Button>
    </Layout>
  );
};

export default Faucet;
