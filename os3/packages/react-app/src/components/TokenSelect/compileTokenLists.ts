import axios from "axios";
import config from "../../config/index.json";

export type Token = {
  name: string;
  address: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  chainId: number;
};

export const TOKEN_LISTS = [
  "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
  "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
  "https://tokens.coingecko.com/uniswap/all.json",
  "tokens.1inch.eth",
];

export const DEFAULT_TOKEN_LISTS =
  config.name === "mainnet"
    ? config.isTest
      ? ["local"]
      : ["https://gateway.ipfs.io/ipns/tokens.uniswap.org"]
    : [
        "https://wispy-bird-88a7.uniswap.workers.dev/?url=http://testnet.tokenlist.eth.link",
      ];

export const DEFAULT_TOKEN = {
  name: "Ethereum",
  symbol: "ETH",
  address: "0x0000000000000000000000000000000000000000",
  chainId: 1,
  decimals: 18,
  logoURI: "/logo192.png",
};

export const getTokens = async (tokenLists: string[]): Promise<Token[]> => {
  if (tokenLists[0] === "local") {
    return [
      {
        name: "Test One",
        symbol: "TST1",
        logoURI: "/logo192.png",
        address: config.addresses.testToken1,
        chainId: 1,
        decimals: 18,
      },
      {
        name: "Test Two",
        symbol: "TST2",
        logoURI: "/logo192.png",
        address: config.addresses.testToken2,
        chainId: 1,
        decimals: 18,
      },
    ];
  }

  const allTokens: any = {};
  const finalTokenList: Token[] = [];
  await Promise.all(
    tokenLists.map((tokenListUrl: string) => {
      return axios.get(tokenListUrl).then((result: any) => {
        try {
          let tokens = result.data.tokens as Token[];
          tokens.forEach((token) => {
            if (!allTokens[token.address]) {
              allTokens[token.address] = 1;
              finalTokenList.push(token);
            }
          });
        } catch (err) {
          console.log(
            "Couldn't cast response to token list. Response: ",
            result,
            err
          );
        }
        return 1;
      });
    })
  );
  return finalTokenList;
};
