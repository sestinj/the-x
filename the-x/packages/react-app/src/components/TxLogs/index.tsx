import React, { useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { Console } from "../../components";
import config from "../../config/index.json";
import { SignerContext } from "../../App";
import CentralDex from "@project/contracts/artifacts/src/dex/CentralDex.sol/CentralDex.json";

const CentralDexInterface = new ethers.utils.Interface(CentralDex.abi);

const TxLogs = () => {
  const { signer } = useContext(SignerContext);
  const etherscan = new ethers.providers.EtherscanProvider(config.name);

  const [history, setHistory] = useState("");

  useEffect(() => {
    (async () => {
      if (!signer) {
        return;
      }
      const address = await signer.getAddress();
      const newHistory = await etherscan.getHistory(
        address,
        etherscan.blockNumber - 10
      );
      setHistory(
        newHistory
          .map((txResp) => {
            if (txResp.to) {
              if (txResp.to === config.addresses.centralDex) {
                // https://ethereum.stackexchange.com/questions/110489/how-to-decode-input-data-in-ethersjs/110498
                // The first 10 bytes of txResp.data are the method name
                const methodName = txResp.data.substring(0, 10); // But you probably need the actual method name, not just bytes...
                return CentralDexInterface.decodeFunctionData(
                  methodName,
                  txResp.data
                ); // Can also decode function result after your await txResp.wait().
              }
            }
            return `[${txResp.timestamp?.toLocaleString()}] ${txResp.hash}`;
          })
          .join("\n\n")
      );
    })();
  }, [signer]);

  return (
    <>
      <Console readOnly value={history} rows={20} cols={68}></Console>
    </>
  );
};

export default TxLogs;
