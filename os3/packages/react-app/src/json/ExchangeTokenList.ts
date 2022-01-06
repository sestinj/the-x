const ExchangeTokenList = {
  Ethereum: {
    symbol: "ETH",
    exchanges: {
      Dogecoin: "CONTRACT_ADDRESS",
    },
  },
  Dogecoin: {
    symbol: "DOGE",
    exchanges: {
      Ethereum: "CONTRACT_ADDRESS",
    },
  },
};

export default ExchangeTokenList;
