import { exec } from "child_process";
import hre from "hardhat";
const { ethers } = hre;
import config from "../../../config.json";
import { updateConfig } from "./libs";

const INITIAL_BALANCE = ethers.BigNumber.from(10).pow(24);

// ATTEMPT #2: Make your own ERC20 tokens locally, and make a token list accordingly

async function main() {
  const signers = await ethers.getSigners();

  console.log(
    `Loading the following address with ${INITIAL_BALANCE} TST1 and TST2 each:`
  );

  const ERC20Factory = await ethers.getContractFactory("TestErc20", signers[0]);
  const testToken1 = await ERC20Factory.deploy("Test 1", "TST1");
  const testToken2 = await ERC20Factory.deploy("Test 2", "TST2");
  console.log("TST1 at address " + testToken1.address);
  console.log("TST2 at address " + testToken2.address);
  for (let signer of signers) {
    await testToken1.mint(signer.address, INITIAL_BALANCE);
    await testToken2.mint(signer.address, INITIAL_BALANCE);
    const balance1: any = await testToken1.balanceOf(signer.address);
    const balance2: any = await testToken2.balanceOf(signer.address);
    console.log(
      signer.address,
      `${balance1.toString()} TST1; ${balance2.toString()} TST2`
    );
  }

  updateConfig((oldConfig) => {
    oldConfig.addresses.testToken1 = testToken1.address;
    oldConfig.addresses.testToken2 = testToken2.address;
    return oldConfig;
  });
}

// ATTEMPT #1: Fork mainnet and impersonate whales. Local graph node didn't like the fork :(

// const TEST_TOKENS = {
//   dai: {
//     address: "0x6b175474e89094c44da98b954eedeac495271d0f",
//     topHolder: "0xe78388b4ce79068e89bf8aa7f218ef6b9ab0e9d0",
//   },
//   aave: {
//     address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
//     topHolder: "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8",
//   },
// };

// async function getSignerFor(address: string) {
//   const provider = new ethers.providers.JsonRpcProvider(
//     "http://localhost:8545"
//   );
//   await provider.send("hardhat_impersonateAccount", [address]);
//   //   await network.provider.request({
//   //     method: "hardhat_impersonateAccount",
//   //     params: [address],
//   //   });
//   const signer = provider.getSigner(address);
//   return signer;
// }

// async function drip(token: any, recipient: string, amount: number) {
//   const zeroSigner = await getSignerFor(token.topHolder);
//   const tokenContract = new ethers.Contract(
//     token.address,
//     ERC20.abi,
//     zeroSigner
//   );

//   const tx = await waitForTx(tokenContract.transfer(recipient, amount));
//   return tx;
// }

// async function main() {
//   const signers = await ethers.getSigners();

//   console.log(
//     `Loading the following address with ${INITIAL_BALANCE} DAI and AAVE each:`
//   );
//   await Promise.all(
//     signers.map(async (signer) => {
//       console.log(signer.address);
//       await drip(TEST_TOKENS.dai, signer.address, INITIAL_BALANCE);
//       await drip(TEST_TOKENS.aave, signer.address, INITIAL_BALANCE);
//     })
//   );
// }
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
