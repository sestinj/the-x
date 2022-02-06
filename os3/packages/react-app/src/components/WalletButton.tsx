import React, { useEffect, useState } from "react";
import { Button, P } from ".";
import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";

const WalletButton = ({
  provider,
  signer,
  setSigner,
}: {
  provider: JsonRpcProvider;
  signer: JsonRpcSigner | undefined;
  setSigner:
    | React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>
    | undefined;
}) => {
  const [rendered, setRendered] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [balance, setBalance] = useState("0");

  const getSigner = async () => {
    console.log("Get Signer");
    if (signer) return; // To avoid infinite looping re-renders with the context
    console.log(
      "Signer doesn't exist yet",
      provider,
      provider.constructor.name
    );
    if (provider.constructor.name !== "r") {
      return; // because Alchemy Provider can't call eth_requestAccounts. TODO this is sketch though
    }
    console.log("Using Web3 Provider");
    await provider.send("eth_requestAccounts", []);
    console.log("Accounts requested");
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

    provider.getNetwork().then((network) => {
      setNetworkName(
        network.name === "unknown"
          ? "Local Host"
          : network.name.substring(0, 1).toUpperCase() +
              network.name.substring(1)
      );
    });
  };

  useEffect(() => {
    getSigner();
    if ((window as any).ethereum?.on) {
      (window as any).ethereum.on("accountsChanged", (accounts: any) => {
        console.log("Account changed: ", accounts);
        getSigner();
      });
    }
  });

  return (
    <>
      <div style={{ display: "flex" }}>
        <p>Network: {networkName}</p>

        <Button onClick={getSigner}>
          {rendered === "" && "🟡 Connect Wallet"}
          {rendered !== "" && rendered}
        </Button>
        <br></br>
        <P>
          My Balance:{" "}
          {parseFloat(
            ethers.utils.formatEther(BigNumber.from(balance))
          ).toFixed(4)}{" "}
          Ether
        </P>
      </div>
    </>
  );
};

export default WalletButton;
