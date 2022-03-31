/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";

const ALCHEMY_API_KEY =
  "https://eth-ropsten.alchemyapi.io/v2/iQg42SGtsJ11gAA9awS8gph4yQql9ogQ";

const ROPSTEN_PRIVATE_KEY =
  "65b80e3396c2d2319c0cb60d270ab0f741a4318246f643b79555c643d853141f";

export default {
  defaultNetwork: "local",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
      ],
      // forking: {
      //   url:
      //     "https://eth-mainnet.alchemyapi.io/v2/iQg42SGtsJ11gAA9awS8gph4yQql9ogQ",
      //   blockNumber: 14127213,
      // },
    },
    ropsten: {
      url: ALCHEMY_API_KEY,
      accounts: [`${ROPSTEN_PRIVATE_KEY}`],
    },
  },
  solidity: "0.8.0",
  paths: {
    sources: "./src",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    // only: [':ERC20$'],
  },
};
