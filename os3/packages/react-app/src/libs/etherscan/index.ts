import axios from "axios";
import { BigNumber } from "ethers";
import config from "../../config/index.json";

export function getEtherscanUrlTx(txHash: string, network: string) {
  const prefix = network === "mainnet" ? "" : network + ".";
  return `https://${prefix}etherscan.io/tx/${txHash}`;
}

export function getEtherscanUrlApi(network: string) {
  const prefix = network === "mainnet" ? "" : "-" + network;
  return `https://api${prefix}.etherscan.io/api`;
}

export async function getTokenBalance(
  token: string,
  user: string
): Promise<BigNumber> {
  const baseUrl = getEtherscanUrlApi(config.name);
  try {
    const resp = await axios.get(baseUrl, {
      params: {
        module: "account",
        action: "tokenbalance",
        contractaddress: token,
        address: user,
        tag: "latest",
        apikey: config.etherscanKey,
      },
    });
    if (resp.data.status === "1") {
      return BigNumber.from(resp.data.result);
    } else {
      console.log("Non-OK Status code returned: ", resp.data.status);
      throw resp.status;
    }
  } catch (err) {
    console.log("Error retrieving token balance.");
    throw err;
  }
}
