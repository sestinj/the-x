import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

const assert = require("chai").assert;
import TestIco from "../artifacts/src/Token/test/TestIco.sol/TestIco.json";
import Erc20Dex from "../artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import LToken from "../artifacts/src/dex/LToken.sol/LToken.json";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { createContracts, waitForTx, decode, isAddress } from "./libs";

// TODO Instead of having an array of Contracts, one for each signer, you should make a function to do this, and memoize the Contracts

const initialBalance = 100000000000000;

describe("*", () => {
  var signers: SignerWithAddress[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  // We must create existing tokens to test functionality.
  // Otherwise you get an opaque revert message.
  var token1: Contract;
  var token2: Contract;
  var dex: Contract;
  var centralDex: Contract;
  var dexs: Contract[];
  var icoFactory: Contract;
  var icoAddress: string;
  var icos: Contract[]; // An ethers.Contract for each signer
  var lToken: Contract;

  let x_0 = 100;
  let y_0 = 100;
  let p_0 = x_0 / y_0;
  let k_0 = x_0 * y_0;
  let FEE: number;

  async function getBalances(signerIndex: number) {
    return await Promise.all([
      token1.balanceOf(signers[signerIndex].address),
      token2.balanceOf(signers[signerIndex].address),
    ]);
  }

  async function getStats() {
    return await Promise.all([
      dexs[0].x(),
      dexs[0].y(),
      dexs[0].k(),
      dexs[0].p(),
    ]);
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
    });
  });

  describe("Central DEX contract", () => {
    before(async () => {
      const CentralDex = await ethers.getContractFactory("CentralDex");

      centralDex = await CentralDex.deploy();

      assert.exists(await centralDex.dexAddresses);
    });

    it("should add a pair between test tokens.", async () => {
      const tx = await waitForTx(
        centralDex.createErc20Dex(token1.address, token2.address, x_0, y_0)
      );
      const event = tx.events[0];
      const decoded = decode(["address", "address", "address"], event.data);
      console.log("New Pair Event: ", decoded);
      console.log("Erc20Dex Address: ", decoded[2]);
      dexs = createContracts(decoded[2], Erc20Dex.abi, signers);
      assert(decoded[2].startsWith("0x"));

      const lTokenAddress = await dexs[0].getLTokenAddress();
      lToken = new ethers.Contract(lTokenAddress, LToken.abi, signers[0]);

      const [x, y, k, p] = await getStats();
      const [balance1, balance2] = await getBalances(0);
      assert(x === balance1);
      assert(y === balance2);
      assert(x_0 === x);
      assert(y_0 === y);
      assert(k_0 === k);
      assert(p_0 === p);

      FEE = ((await dexs[0].FEE()) as BigNumber).toNumber() / 1000;
    });

    it("should show that the created exchange exists for both listExchangesToBuy/Sell.", async () => {
      const tx1 = await centralDex.listExchangesToBuy(token2.address);
      const tx2 = await centralDex.listExchangesToSell(token1.address);
      console.log(tx1, tx2);
      assert(tx1.length == 1, "Should be only one exchange to buy token2");
      assert(tx2.length == 1, "Should be only one exchange to sell token1");
      assert(tx1[0] == token1.address, "We get the address of token1");
      assert(tx2[0] == token2.address, "We get the address of token2");
    });
  });

  describe("Test Token Pair", () => {
    it("should execute a swap.", async () => {
      const q = 1000;
      await waitForTx(dexs[1].swap(q, true));
      const [balance1, balance2] = await getBalances(1);
      assert(balance1 === initialBalance - p_0 * q);
      assert(balance2 === initialBalance + q * (1 - FEE));
      const [x, y, k, p] = await getStats();
      assert(x === x_0 - q * p_0);
      assert(y === y_0 - q);
      assert(k === x * y);
      assert(p === x / y);
      x_0 = x;
      y_0 = y;
      k_0 = k;
      p_0 = p;
    });
    it("should not allow adding liquidity of different values for now.", async () => {});
    it("should add liquidity.", async () => {
      const currentPrice = ((await dexs[0].getPrice()) as BigNumber).toNumber();
      const q2 = 2000;
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
