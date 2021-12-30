import React, { useEffect, useState } from "react";
import { Button, P } from ".";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { MutableRefObject } from "react";

const WalletButton = ({
  provider,
  signerRef,
}: {
  provider: Web3Provider;
  signerRef: MutableRefObject<JsonRpcSigner | undefined>;
}) => {
  const [rendered, setRendered] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [balance, setBalance] = useState("");

  const getSigner = async () => {
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    signerRef.current = signer;
    signer.getAddress().then((address) => {
      setRendered(`🟢 ${address.slice(0, 5)}...${address.slice(-4)}`);
    });

    signer.getBalance().then((balance) => {
      setBalance(balance.toString());
    });

    provider
      .getNetwork()
      .then((network) =>
        setNetworkName(network.name === "unknown" ? "Local Host" : network.name)
      );
  };

  useEffect(() => {
    getSigner();
    window.ethereum.on("accountsChanged", (accounts: any) => {
      console.log("Account changed: ", accounts);
      getSigner();
    });
  });

  return (
    <>
      <p>Network: {networkName}</p>

      <Button onClick={getSigner}>
        {rendered === "" && "Connect Wallet"}
        {rendered !== "" && rendered}
      </Button>
      <br></br>
      <P>My Balance: {balance} wei</P>
    </>
  );
};

export default WalletButton;
