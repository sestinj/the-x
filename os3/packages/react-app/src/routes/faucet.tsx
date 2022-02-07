import React, { useContext, useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import Layout from "../components/Layout";
import { SignerContext } from "../App";
import TokenSelect from "../components/TokenSelect";
import { DEFAULT_TOKEN } from "../components/TokenSelect/compileTokenLists";
import { Button } from "../components";
import { isZeroAddress, useContract } from "../libs";
import config from "../config/index.json";
import EthFaucet from "@project/contracts/artifacts/src/other/EthFaucet.sol/EthFaucet.json";
import ERC20Faucet from "@project/contracts/artifacts/src/other/ERC20Faucet.sol/ERC20Faucet.json";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import Info from "../components/Info";

const Faucet = () => {
  const { signer } = useContext(SignerContext);
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [faucetBalance, setFaucetBalance] = useState(BigNumber.from(0));

  useEffect(() => {
    async function getBalance() {
      if (isZeroAddress(token.address)) {
        const b = await signer?.getBalance();
        if (b) {
          setBalance(b);
        }
        return;
      }

      const tokenContract = new ethers.Contract(
        token.address,
        ERC20.abi,
        signer
      );
      const signerAddress = await signer?.getAddress();
      if (signerAddress) {
        const tx: BigNumber = await tokenContract.balanceOf(signerAddress);
        setBalance(tx);
      }
    }
    getBalance();
  }, [token, signer]);

  const [faucetContract, setFaucetContract] = useState<
    ethers.Contract | undefined
  >(
    new ethers.Contract(
      (config.addresses.faucets as any)[DEFAULT_TOKEN.address],
      EthFaucet.abi,
      signer
    )
  );

  useEffect(() => {
    async function getFaucetBalance() {
      if (faucetContract?.signer) {
        const faucetB = await faucetContract.getBalance();
        setFaucetBalance(faucetB);
      }
    }
    getFaucetBalance();
  }, [faucetContract]);

  useEffect(() => {
    if ((config.addresses.faucets as any)[token.address]) {
      if (isZeroAddress(token.address)) {
        setFaucetContract(
          new ethers.Contract(
            (config.addresses.faucets as any)[token.address],
            EthFaucet.abi,
            signer
          )
        );
      } else {
        setFaucetContract(
          new ethers.Contract(
            (config.addresses.faucets as any)[token.address],
            ERC20Faucet.abi,
            signer
          )
        );
      }
    } else {
      setFaucetContract(undefined);
    }
  }, [token, signer]);

  const drip = async () => {
    if (!faucetContract) {
      return;
    }
    const tx = await faucetContract.dripOrDrown();
    console.log("Tx: ", tx);
  };

  return (
    <Layout>
      <div style={{ display: "flex" }}>
        <h1>Faucet</h1>
        <Info>Use the faucet to get tokens for free on the test network.</Info>
      </div>
      <div
        style={{
          border: "2px solid white",
          borderRadius: "8px",
          overflow: "clip",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50px",
        }}
      >
        <TokenSelect
          onChange={(token) => {
            setToken(token);
          }}
        ></TokenSelect>
        {faucetContract && (
          <Button
            onClick={drip}
            style={{ borderRadius: "0", margin: "0", height: "100%" }}
          >
            Get {token.symbol}
          </Button>
        )}
      </div>

      {faucetContract ? (
        <p>
          This faucet has a balance of{" "}
          {parseFloat(
            ethers.utils.formatUnits(faucetBalance, token.decimals)
          ).toFixed(4)}{" "}
          {token.symbol}.
        </p>
      ) : (
        <p>
          No faucet available for this token, but you can trade for it at{" "}
          <a href="/exchange">the exchange</a>.
        </p>
      )}

      <p>
        Your balance of {token.name}:{" "}
        {parseFloat(ethers.utils.formatUnits(balance, token.decimals)).toFixed(
          4
        )}{" "}
        {token.symbol}
      </p>
    </Layout>
  );
};

export default Faucet;
