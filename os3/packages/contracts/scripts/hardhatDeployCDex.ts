const hre = require("hardhat");
const { ethers } = hre;
import { exec } from "child_process";
import { deployContract, fullDeployment, updateConfig } from "./libs/index";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const centralDex = await fullDeployment(ethers);
  console.log("Central DEX deployed to:", centralDex.address);
  exec(`printf ${centralDex.address} | pbcopy`);

  await updateConfig((oldConfig) => {
    oldConfig.addresses.centralDex = centralDex.address;
    return oldConfig;
  });

  const auctionFactoryContract = await deployContract(
    "AuctionFactory",
    (oldConfig: any, address: string) => {
      oldConfig.addresses.auctionFactory = address;
      return oldConfig;
    }
  );
  console.log(`Deployed Auction factory to ${auctionFactoryContract.address}`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
