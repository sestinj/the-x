import { Button, Header, Link } from "../components";
import Layout from "../components/Layout";
import WalletButton from "../components/WalletButton";
import { createToken } from "../functions";
import React, { MutableRefObject, useRef } from "react";
import { JsonRpcSigner } from "@ethersproject/providers";
import { ethers } from "ethers";

const Exchange = () => {
  const signerRef: MutableRefObject<JsonRpcSigner | undefined> = useRef();
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  return (
    <>
      <Header>
        <WalletButton provider={provider} signerRef={signerRef}></WalletButton>
      </Header>
      <Button onClick={createToken}>Create Token</Button>
      <Link href={"./pages/exchange"}>Exchange</Link>
    </>
  );
};

export default Exchange;
