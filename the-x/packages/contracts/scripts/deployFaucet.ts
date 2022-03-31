import hre from "hardhat";
import config from "../../../config.json";
import TestErc20 from "../artifacts/src/Token/test/TestErc20.sol/TestErc20.json";
import { updateConfig, ZERO_ADDRESS } from "./libs/index";
const { ethers } = hre;

async function main() {
  const [deployer, _, tertiary] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const EthFaucetFactory = await ethers.getContractFactory("EthFaucet");
  const ethFaucet = await EthFaucetFactory.deploy();
  await ethFaucet.deployed();

  //   tertiary.sendTransaction({
  //     to: ethFaucet.address,
  //     value: ethers.utils.parseEther("10"),
  //   });

  console.log("EthFaucet deployed to:", ethFaucet.address);

  const testTokens: string[] = [
    config.addresses.testToken1,
    config.addresses.testToken2,
  ];
  const Erc20FaucetFactory = await ethers.getContractFactory("ERC20Faucet");
  const ercFaucetAddresses: string[] = [];
  for (let token of testTokens) {
    const erc20Faucet = await Erc20FaucetFactory.deploy(
      token,
      ethers.utils.parseEther("100")
    );
    await erc20Faucet.deployed();
    console.log(`Deployed ERC20 Faucet to address ${erc20Faucet.address}`);
    ercFaucetAddresses.push(erc20Faucet.address);

    // Mint test tokens to the Faucet
    const testTokenContract = new ethers.Contract(
      token,
      TestErc20.abi,
      deployer
    );
    await testTokenContract.mint(
      erc20Faucet.address,
      ethers.utils.parseEther("100000000")
    );
  }

  updateConfig((oldConfig) => {
    oldConfig.addresses.faucets = {};
    oldConfig.addresses.faucets[ZERO_ADDRESS] = ethFaucet.address;
    for (let i = 0; i < testTokens.length; i++) {
      oldConfig.addresses.faucets[testTokens[i]] = ercFaucetAddresses[i];
    }
    return oldConfig;
  });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
