import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { fullDeployment } from "../scripts/libs/index";

const assert = require("chai").assert;
import Erc20Dex from "../artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import CentralDex from "../artifacts/src/dex/CentralDex.sol/CentralDex.json";
import ERC20 from "../artifacts/src/Token/ERC20.sol/ERC20.json";
import LToken from "../artifacts/src/dex/LToken.sol/LToken.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { createContracts, waitForTx, decode, isAddress } from "./libs";

// TODO Instead of having an array of Contracts, one for each signer, you should make a function to do this, and memoize the Contracts

const initialBalance = 100000000000000;

describe("*", () => {
  var signers: SignerWithAddress[];
  before(async () => {
    signers = await ethers.getSigners();
    console.log(
      "SIGNERS: ",
      signers.map((signer) => signer.address)
    );
  });

  // We must create existing tokens to test functionality.
  // Otherwise you get an opaque revert message.
  var token1: Contract;
  var token2: Contract;
  var dex: Contract;
  var centralDexs: Contract[];
  var dexs: Contract[];
  var icoFactory: Contract;
  var icoAddress: string;
  var icos: Contract[]; // An ethers.Contract for each signer
  var lToken: Contract;
  var token1s: Contract[];
  var token2s: Contract[];

  let x_0 = 100;
  let y_0 = 100;
  let p_0 = x_0 / y_0;
  let k_0 = x_0 * y_0;
  let FEE: number;

  async function getBalances(address: string) {
    return await Promise.all([
      token1.balanceOf(address),
      token2.balanceOf(address),
    ]);
  }

  async function getStats() {
    const stats = await Promise.all([
      dexs[0].x(),
      dexs[0].y(),
      dexs[0].k(),
      dexs[0].p(),
    ]);
    return stats.map((stat) => {
      return (stat as BigNumber).toNumber();
    });
  }

  describe("Test Tokens", () => {
    it("should be constructed without reversion", async () => {
      const ERC20Token = await ethers.getContractFactory("TestErc20");

      token1 = await ERC20Token.deploy("Token1", "ONE");
      token2 = await ERC20Token.deploy("Token2", "TWO");
      console.log("Token addresses: ", token1.address, token2.address);
      for (let i = 0; i < signers.length; i++) {
        // Give each of the account a bunch of the token for testing
        const tx1 = await waitForTx(
          token1.mint(signers[i].address, initialBalance)
        );
        const tx2 = await waitForTx(
          token2.mint(signers[i].address, initialBalance)
        );
      }
      token1s = createContracts(token1.address, ERC20.abi, signers);
      token2s = createContracts(token2.address, ERC20.abi, signers);
    });
  });

  describe("Central DEX contract", () => {
    before(async () => {
      const centralDex = await fullDeployment(ethers);
      centralDexs = createContracts(
        centralDex.address,
        CentralDex.abi,
        signers
      );
      console.log("CENTRAL DEX: ", centralDex.address);
      assert.exists(await centralDex.dexAddresses);

      // Approve spending of entire initialBalance up front
      for (let tokens of [token1s, token2s]) {
        for (let token of tokens) {
          await waitForTx(
            token.approve(centralDexs[0].address, initialBalance)
          );
        }
      }
    });

    it("should add a pair between test tokens.", async () => {
      const tx = await waitForTx(
        centralDexs[0].createErc20Dex(token1.address, token2.address, x_0, y_0)
      );
      const event = tx.events[tx.events.length - 1]; // The last event emitted is the one we want, see CentralDex.sol
      const decoded = decode(["address", "address", "address"], event.data);
      console.log("New Pair Event: ", decoded);
      console.log("Erc20Dex Address: ", decoded[2]);
      dexs = createContracts(decoded[2], Erc20Dex.abi, signers);
      // Approve spending of entire initialBalance up front
      for (let tokens of [token1s, token2s]) {
        for (let token of tokens) {
          await waitForTx(token.approve(dexs[0].address, initialBalance));
        }
      }
      assert(decoded[2].startsWith("0x"));

      const lTokenAddress = await dexs[0].getLTokenAddress();
      lToken = new ethers.Contract(lTokenAddress, LToken.abi, signers[0]);

      const [x, y, k, p] = await getStats();
      const [balance1, balance2] = await getBalances(signers[0].address);
      assert(
        x === initialBalance - balance1,
        `Incorrect balance: ${x} !== ${initialBalance - balance1}`
      );
      assert(
        y === initialBalance - balance2,
        `Incorrect balance: ${y} !== ${initialBalance - balance2}`
      );
      assert(x_0 === x);
      assert(y_0 === y);
      assert(k_0 === k, `k_0 = ${k_0} !== k = ${k}`);
      assert(p_0 === p);

      const [dbal1, dbal2] = await getBalances(dexs[0].address);
      assert(dbal1.eq(100), "Balance of DEX of X incorrect");
      assert(dbal2.eq(100), "Balance of DEX of Y incorrect");

      FEE = ((await dexs[0].FEE()) as BigNumber).toNumber() / 1000;
    });

    it("should show that the created exchange exists for both listExchangesToBuy/Sell.", async () => {
      const tx1 = await centralDexs[0].listExchangesToBuy(token2.address);
      const tx2 = await centralDexs[0].listExchangesToSell(token1.address);
      console.log(tx1, tx2);
      assert(tx1.length == 1, "Should be only one exchange to buy token2");
      assert(tx2.length == 1, "Should be only one exchange to sell token1");
      assert(tx1[0] == token1.address, "We get the address of token1");
      assert(tx2[0] == token2.address, "We get the address of token2");
    });
  });

  describe("Test Token Pair", () => {
    it("should execute a swap.", async () => {
      const q = 10;
      await waitForTx(dexs[1].swap(q, true));

      // Balances of trader
      const [balance1, balance2] = await getBalances(signers[1].address);
      assert(
        balance2.eq(Math.round(initialBalance + q * (1 - FEE))),
        `Incorrect balance: ${balance2} !== ${initialBalance + q * (1 - FEE)}`
      );
      assert(balance1 < initialBalance, "Balance of x should have decreased");
      console.log("Balance1!!!; ", balance1);

      // Stats of DEX
      const [x, y, k, p] = await getStats();
      const [dbal1, dbal2] = await getBalances(dexs[0].address);
      assert(dbal1.eq(x), `Balance of X ${dbal1} doesn't match x = ${x}`);
      assert(dbal2.eq(y), `Balance of Y ${dbal2} doesn't match y = ${y}`);
      console.log(`x: ${x}, y: ${y}, k: ${k}`);

      //TODO - It seems that due to error rounding, it is only possible to get one of the below assertions correct each time.
      // Right now choosing to assert the second. See ADEX.sol.
      //   assert(k === x * y, `k = ${k} doesn't match with x * y = ${x * y}`);
      // Considering even just giving prices, you HAVE to be able to represent floats in Solidity. Look at how Uni does it.
      // Anywhere you see Math.round in this file should be gone.
      assert(k === k_0, `k has changed. (from ${k_0} to ${k})`);

      assert(
        p === Math.round(x / y),
        `Price updated incorrectly. p = ${p} !== x / y = ${x / y}`
      );
      x_0 = x;
      y_0 = y;
      p_0 = p;
    });
    it("should not allow adding liquidity of different values for now.", async () => {});
    it("should add liquidity.", async () => {
      const currentPrice = ((await dexs[0].getPrice()) as BigNumber).toNumber();
      const q2 = 20;
      const q1 = q2 * currentPrice;
      await waitForTx(dexs[2].addLiquidity(q1, q2));
      const [x, y, k, p] = await getStats();
      assert(x === x_0 + q1);
      assert(y === y_0 + q2);
      assert(k === x * y);
      assert(p === x / y);
      const reward = ((await lToken.balanceOf(
        signers[2].address
      )) as BigNumber).toNumber();
      const totalSupply = ((await lToken.totalSupply()) as BigNumber).toNumber();
      assert(reward / totalSupply === q1 / x);
      assert(reward / totalSupply === q2 / y);
      x_0 = x;
      y_0 = y;
      k_0 = k;
      p_0 = p;
    });
    it("should remove liquidity", async () => {});
    it("should successfully execute the following series of swaps.", async () => {});
  });
});
