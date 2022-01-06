/**
 * @type import('hardhat/config').HardhatUserConfig
 */

require("@nomiclabs/hardhat-ethers");

module.exports = {
  defaultNetwork: "local",
  networks: {
    hardhat: {},
    local: {
      url: "http://127.0.0.1:7545",
      accounts: [
        "d75153b3ce0f4eb956b299150c86c6df7bc16d35feddf28fa74aa8808388ed65",
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
