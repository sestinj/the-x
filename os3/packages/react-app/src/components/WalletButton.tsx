import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { BigNumber, ethers } from "ethers";
import Fortmatic from "fortmatic";
import React, { useEffect, useState } from "react";
import Web3Modal from "web3modal";
import { Button, P } from ".";
import config from "../config/index.json";

// // Example for Polygon/Matic:
// const customNetworkOptions = {
//   rpcUrl: "https://rpc-mainnet.maticvigil.com",
//   chainId: 137,
// };

const providerOptions = {
  fortmatic: {
    package: Fortmatic, // required
    options: {
      key: config.fortmaticKey, // required
      // network: customNetworkOptions, // if we don't pass it, it will default to localhost:8454
    },
  },
};

const web3Modal = new Web3Modal({
  network: config.name, // optional
  cacheProvider: true, // optional
  providerOptions, // required
});

const WalletButton = ({
  provider,
  setProvider,
  signer,
  setSigner,
}: {
  provider: JsonRpcProvider;
  setProvider:
    | React.Dispatch<React.SetStateAction<JsonRpcProvider>>
    | undefined;
  signer: JsonRpcSigner | undefined;
  setSigner:
    | React.Dispatch<React.SetStateAction<JsonRpcSigner | undefined>>
    | undefined;
}) => {
  const [rendered, setRendered] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [balance, setBalance] = useState("0");

  async function getWeb3ModalProvider() {
    const instance = await web3Modal.connect();

    const web3ModalProvider = new ethers.providers.Web3Provider(instance);

    const web3ModalSigner = web3ModalProvider.getSigner();

    if (setSigner) {
      setSigner(web3ModalSigner);
    }
    if (setProvider) {
      setProvider(web3ModalProvider);
    }
    web3ModalSigner.getAddress().then((address) => {
      setRendered(`🟢 ${address.slice(0, 5)}...${address.slice(-4)}`);
    });

    web3ModalSigner.getBalance().then((balance) => {
      setBalance(balance.toString());
    });

    web3ModalProvider.getNetwork().then((network) => {
      setNetworkName(
        network.name === "unknown"
          ? "Local Host"
          : network.name.substring(0, 1).toUpperCase() +
              network.name.substring(1)
      );
    });
  }

  useEffect(() => {
    // Subscribe to accounts change
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log(accounts);
    });

    // Subscribe to chainId change
    provider.on("chainChanged", (chainId: number) => {
      console.log(chainId);
    });

    // Subscribe to provider connection
    provider.on("connect", (info: { chainId: number }) => {
      console.log(info);
    });

    // Subscribe to provider disconnection
    provider.on("disconnect", (error: { code: number; message: string }) => {
      console.log(error);
    });
  });

  return (
    <>
      <div style={{ display: "flex" }}>
        {rendered && <p>Network: {networkName}</p>}

        <Button
          onClick={async () => {
            web3Modal.clearCachedProvider();
            await getWeb3ModalProvider();
          }}
        >
          {rendered === "" && "🟡 Connect Wallet"}
          {rendered !== "" && rendered}
        </Button>
        <br></br>
        {rendered && (
          <P>
            My Balance:{" "}
            {parseFloat(
              ethers.utils.formatEther(BigNumber.from(balance))
            ).toFixed(4)}{" "}
            Ether
          </P>
        )}
      </div>
    </>
  );
};

export default WalletButton;
