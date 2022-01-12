import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";

const assert = require("chai").assert;
import TestIco from "../artifacts/src/Token/test/TestIco.sol/TestIco.json";
import Erc20Dex from "../artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
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

  describe("ERC20 token contract", () => {
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

    it("should add an exchange between DOGE and SHIB", async () => {
      const tx = await waitForTx(
        centralDex.createErc20Dex(token1.address, token2.address)
      );
      const event = tx.events[0];
      const decoded = decode(["address", "address", "address"], event.data);
      console.log("New Pair Event: ", decoded);
      console.log("Erc20Dex Address: ", decoded[2]);
      dexs = createContracts(decoded[2], Erc20Dex.abi, signers);
      assert(decoded[2].startsWith("0x"));
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

  describe("ICO Token", () => {
    before(async () => {
      const IcoFactory = await ethers.getContractFactory("IcoFactory");

      icoFactory = await IcoFactory.deploy();
    });
    it("should create a new token.", async () => {
      const event = (
        await waitForTx(
          icoFactory.createNewIco(
            "Nate's Token",
            "NJS",
            1,
            signers[0].address,
            50
          )
        )
      ).events[0];
      const decoded = decode(["address", "address", "uint256"], event.data);
      icoAddress = decoded[0];
      console.log("New ICO Address: ", icoAddress);
      assert(isAddress(icoAddress));
      icos = createContracts(icoAddress, TestIco.abi, signers);
    });

    it("should accept the following list of ICO purchases.", async () => {
      const purchaseValues = [10, 200, 300];
      // icos[0].purchase(90, { value: 90 }), // This leads to an error saying the tx has the wrong nonce. It's because you're using the same account twice at the same time, but this should be allowed. Check out later
      const purchaseSigners = [0, 1, 2];
      const promises = [];
      for (let i = 0; i < purchaseValues.length; i++) {
        promises.push(
          await waitForTx(
            icos[purchaseSigners[i]].purchase(purchaseValues[i], {
              value: purchaseValues[i],
            })
          )
        );
      }
      const txResponses = await Promise.all(promises);
      for (let i = 0; i < purchaseValues.length; i++) {
        const event = txResponses[i].events[0];
        const [purchaser, amount] = decode(["address", "uint256"], event.data);
        assert(purchaser == signers[purchaseSigners[i]].address);
        assert((amount as BigNumber).eq(purchaseValues[i]));
      }
    });

    it("should close the ICO and successfully mint the tokens to the right people.", async () => {
      const txResp = await icos[0].closeICO();
    });
  });

  describe("Test Pair DEX (DOGE <-> SHIB)", () => {
    it("should accept the first bid and do nothing.", async () => {
      // Check the balance of the signer
      const balance = await token1.balanceOf(signers[0].address);

      // First approve funds for the DEX
      const quantity = 100;
      const price = 5;
      const approveTx = await waitForTx(
        token1.approve(dexs[0].address, quantity * price)
      );

      const txResp = await waitForTx(dexs[0].submitBid(price, quantity));

      // Check balance - shouldn't have changed
      const tx = await token2.balanceOf(signers[0].address);
      assert((tx as BigNumber).toNumber() == initialBalance);

      // TODO: Check the balance of the DEX by exposing
    });

    it("should accept an ask creating positive spread, and make profit off of this while fulfilling both orders.", async () => {
      const approveTx = await waitForTx(token2.approve(dexs[0].address, 100));
      const txResp = await waitForTx(dexs[0].submitAsk(6, 100));

      // Check balances and profit
      const tx1 = await token1.balanceOf(signers[0].address);
      const tx2 = await token2.balanceOf(signers[0].address);
      console.log("TX12: ", tx1, tx2);
      // Need to expose and check DEX balance
    });

    it("should not meet a bid below the current price when there is no ask to match.", async () => {
      // Make sure current price is according the the previous trade
      const currentPrice = await dexs[0].currentPrice();
      assert(currentPrice == 5);

      const approveTx = await waitForTx(
        token1.approve(dexs[0].address, 3 * 100)
      );
      const txResp = await waitForTx(dexs[0].submitBid(3, 100));

      // Check that the balance is the same, the transaction didn't go through.
    });

    it("should direct buy an ask below the current price.", async () => {});

    it("should direct sell to a bid above the price, which has no matching ask.", async () => {});

    it("match the following sequence of bids and asks.", async () => {});
  });
});
