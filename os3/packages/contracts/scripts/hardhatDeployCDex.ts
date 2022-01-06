const hre = require("hardhat");
const { ethers } = hre;
import { exec } from "child_process";

async function main() {
  const CentralDex = await ethers.getContractFactory("CentralDex");
  const centralDex = await CentralDex.deploy();
  await centralDex.deployed();
  console.log("Central DEX deployed to:", centralDex.address);
  exec(`printf ${centralDex.address} | pbcopy`);
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
