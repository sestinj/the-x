import React, { useEffect, useState } from "react";
import { Button, P } from ".";
import { Web3Provider, JsonRpcSigner } from "@ethersproject/providers";
import { MutableRefObject } from "react";
import { BigNumber, ethers } from "ethers";

const WalletButton = ({
  provider,
  signer,
  setSigner,
}: {
  provider: Web3Provider;
  signer: JsonRpcSigner | undefined;
  setSigner:
    | React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>
    | undefined;
}) => {
  const [rendered, setRendered] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [balance, setBalance] = useState("0");

  const getSigner = async () => {
    if (signer) return; // To avoid infinite looping re-renders with the context
    await provider.send("eth_requestAccounts", []);
    const newSigner = provider.getSigner();
    if (setSigner) {
      setSigner(newSigner);
    }
    console.log("New Signer added to context: ", newSigner);
    newSigner.getAddress().then((address) => {
      setRendered(`🟢 ${address.slice(0, 5)}...${address.slice(-4)}`);
    });

    newSigner.getBalance().then((balance) => {
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
      <div style={{ display: "flex" }}>
        <p>Network: {networkName}</p>

        <Button onClick={getSigner}>
          {rendered === "" && "Connect Wallet"}
          {rendered !== "" && rendered}
        </Button>
        <br></br>
        <P>
          My Balance: {ethers.utils.formatEther(BigNumber.from(balance))} Ether
        </P>
      </div>
    </>
  );
};

export default WalletButton;
