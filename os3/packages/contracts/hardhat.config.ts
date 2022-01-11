/**
 * @type import('hardhat/config').HardhatUserConfig
 */

import "@nomiclabs/hardhat-ethers";

export default {
  defaultNetwork: "local",
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0x83f15e996eb4da6d8df4ffb075cd15bccd86e7004993cdbd884a98d053b61b49",
        "0x55c5d2cd9f334ee80d1ceee64b6a677f03d52d1d65a89bd020695aa601468ea7",
        "0xb1b203857ab5282f23342d37a848bda0404a88dd4b6e3f5535f99f6b9ca82443",
      ],
    },
    // rinkeby: {
    //   url: "https://eth-rinkeby.alchemyapi.io/v2/123abc123abc123abc123abc123abcde",
    //   accounts: [privateKey1, privateKey2, ...]
    // }
  },
  solidity: "0.8.0",
  paths: {
    sources: "./src",
    tests: "./tests",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
