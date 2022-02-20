import { JsonRpcSigner } from "@ethersproject/providers";
import IERC20 from "@project/contracts/artifacts/src/Token/IERC20.sol/IERC20.json";
import axios from "axios";
import { BigNumber, ethers } from "ethers";
import {
  DEFAULT_TOKEN_LISTS,
  getTokens,
} from "../../components/TokenSelect/compileTokenLists";
import config from "../../config/index.json";
import { isZeroAddress } from "../index";

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
  user: string,
  signer: JsonRpcSigner | undefined
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
      console.log("Non-OK Status code returned: ", resp.data.status, resp.data);
      throw resp.status;
    }
  } catch (err) {
    console.log("Error retrieving token balance.");
    throw err;
  }
}

export async function ethersGetTokenBalance(
  token: string,
  signer: JsonRpcSigner
): Promise<BigNumber> {
  if (isZeroAddress(token)) {
    return await signer.getBalance();
  }
  const address = signer.getAddress();
  const contract = new ethers.Contract(token, IERC20.abi, signer);
  let tx;
  try {
    tx = await contract.balanceOf(address);
  } catch (err) {
    console.log("Couldn't retrieve balance of token ", token);
  }
  return tx || BigNumber.from(0);
}

export async function getAllTokenBalances(
  signer: JsonRpcSigner | undefined
): Promise<{ token: string; balance: BigNumber }[]> {
  const user = await signer?.getAddress();
  if (!user || !signer) {
    return [];
  }
  const tokens = await getTokens(DEFAULT_TOKEN_LISTS);
  let balances = await Promise.all(
    tokens.map(async (token) => {
      const balance = await ethersGetTokenBalance(token.address, signer);
      if (balance.isZero()) {
        return null;
      }
      return { token, balance };
    })
  );
  balances = balances.filter((element) => element !== null);
  return balances as any;
}
