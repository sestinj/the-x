import axios from "axios";

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

export const DEFAULT_TOKEN_LISTS = [
  "https://gateway.ipfs.io/ipns/tokens.uniswap.org",
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
