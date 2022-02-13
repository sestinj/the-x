import ERC20Faucet from "@project/contracts/artifacts/src/other/ERC20Faucet.sol/ERC20Faucet.json";
import EthFaucet from "@project/contracts/artifacts/src/other/EthFaucet.sol/EthFaucet.json";
import ERC20 from "@project/contracts/artifacts/src/Token/ERC20.sol/ERC20.json";
import { BigNumber, ethers } from "ethers";
import React, { useContext, useEffect, useState } from "react";
import { SignerContext } from "../App";
import { Button } from "../components";
import Info from "../components/Info";
import Layout from "../components/Layout";
import TokenSelect from "../components/TokenSelect";
import { DEFAULT_TOKEN } from "../components/TokenSelect/compileTokenLists";
import TxModal from "../components/TxModal";
import config from "../config/index.json";
import { isZeroAddress } from "../libs";

const Faucet = () => {
  const { signer } = useContext(SignerContext);
  const [token, setToken] = useState(DEFAULT_TOKEN);
  const [balance, setBalance] = useState(BigNumber.from(0));
  const [faucetBalance, setFaucetBalance] = useState(BigNumber.from(0));
  const [address, setAddress] = useState("");

  useEffect(() => {
    const aa = async () => {
      if (!signer) {
        return;
      }
      const ad = await signer.getAddress();
      setAddress(ad);
    };
    aa();
  });

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
    if (isZeroAddress(token.address)) {
      setFaucetContract(undefined); // TODO - This is just for now!!! Remove when you get to GSN
    }
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

  // const drip = async () => {
  //   if (!faucetContract) {
  //     return;
  //   }
  //   const conf = {
  //     ourContract: faucetContract.address,
  //     paymaster: config.addresses.gsn.paymaster,
  //     gasPrice: 20000000000, // 20 Gwei
  //   };
  //   let gsnProvider = await new gsn.RelayProvider(window.ethereum, {
  //     forwarderAddress: conf.forwarder,
  //     paymasterAddress: conf.paymaster,
  //     verbose: false,
  //   }).init();
  //   provider = new ethers.providers.Web3Provider(gsnProvider);
  //   userAddr = gsnProvider.origProvider.selectedAddress;
  //   const tx = await faucetContract.dripOrDrown();
  //   console.log("Tx: ", tx);
  // };

  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Layout>
      <TxModal
        open={modalOpen}
        closeModal={() => {
          setModalOpen(false);
        }}
        args={[]}
        txFunction={faucetContract?.dripOrDrown}
        options={{
          onConfirm: (receipt: any) => {
            console.log("Confirmed: ", receipt);
          },
          onPending: (tx: any) => {
            console.log("Sent: ", tx);
          },
          onError: (error: any) => {
            console.log("Error: ", error);
          },
          title: `Drip or Drown`,
          description: `Claimed free ${token.symbol} from faucet.`,
        }}
        requirements={[]}
        spender=""
      >
        Confirm that you would like to recieve free {token.symbol}.
      </TxModal>
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
            onClick={() => {
              setModalOpen(true);
            }}
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
      {isZeroAddress(token.address) && (
        <p>
          If you have exactly zero Ether, use{" "}
          <a href="https://faucet.egorfine.com/" target={"_blank"}>
            this faucet
          </a>{" "}
          to get some first for gas fees.<br></br>(Your address is {address})
        </p>
      )}
    </Layout>
  );
};

export default Faucet;
