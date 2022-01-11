import { ethers } from "hardhat";
import { BytesLike, Contract, Wallet, BigNumber } from "ethers";

const assert = require("chai").assert;
import Ico from "../artifacts/src/Token/ICO.sol/ICO.json";
import Erc20Dex from "../artifacts/src/dex/Erc20Dex.sol/Erc20Dex.json";
import { ParamType } from "@ethersproject/abi";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

const decode = (types: readonly (string | ParamType)[], data: BytesLike) => {
  return ethers.utils.defaultAbiCoder.decode(types, data);
};

const isAddress = (addressCandidate: string) => {
  return (
    typeof addressCandidate == "string" &&
    addressCandidate.startsWith("0x") &&
    addressCandidate.length == 42
  );
};

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
  var testPairDex: Contract;
  var icoFactory: Contract;
  var icoAddress: string;
  var icos: Contract[]; // An ethers.Contract for each signer

  describe("ERC20 token contract", () => {
    it("should be constructed without reversion", async () => {
      const ERC20Token = await ethers.getContractFactory("ERC20");

      token1 = await ERC20Token.deploy("Token1", "ONE");
      token2 = await ERC20Token.deploy("Token2", "TWO");
      console.log("Token addresses: ", token1.address, token2.address);
    });
  });

  describe("Central DEX contract", () => {
    before(async () => {
      const CentralDex = await ethers.getContractFactory("CentralDex");

      centralDex = await CentralDex.deploy();

      assert.exists(await centralDex.dexAddresses);
    });

    it("should add an exchange between DOGE and SHIB", async () => {
      const tx = await centralDex.createErc20Dex(
        token1.address,
        token2.address
      );
      const resp = await tx.wait();
      const event = resp.events[0];
      const decoded = decode(["address", "address", "address"], event.data);
      console.log("Erc20Dex Address: ", decoded[2]);
      testPairDex = new ethers.Contract(decoded[2], Erc20Dex.abi, signers[0]);
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
        await (
          await icoFactory.createNewIco(
            "Nate's Token",
            "NJS",
            1,
            signers[0].address,
            50
          )
        ).wait()
      ).events[0];
      const decoded = decode(["address", "address", "uint256"], event.data);
      icoAddress = decoded[0];
      console.log("New ICO Address: ", icoAddress);
      assert(isAddress(icoAddress));
      icos = await Promise.all(
        signers.map((signer) => {
          return new ethers.Contract(icoAddress, Ico.abi, signer);
        })
      );
    });

    it("should accept the following list of ICO purchases.", async () => {
      const purchaseValues = [10, 200, 300];
      // icos[0].purchase(90, { value: 90 }), // This leads to an error saying the tx has the wrong nonce. It's because you're using the same account twice at the same time, but this should be allowed. Check out later
      const purchaseSigners = [0, 1, 2];
      const promises = [];
      for (let i = 0; i < purchaseValues.length; i++) {
        promises.push(
          (
            await icos[purchaseSigners[i]].purchase(purchaseValues[i], {
              value: purchaseValues[i],
            })
          ).wait()
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
      console.log("Closing ICO:", txResp);
    });
  });

  describe("Test Pair DEX (DOGE <-> SHIB)", () => {
    it("should accept the first bid and do nothing.", async () => {
      const txResp = await dex.submitBid(5, 100);

      // Check balances
    });

    it("should accept an ask creating positive spread, and make profit off of this while fulfilling both orders.", async () => {
      const txResp = await dex.submitAsk(6, 100);
      // Check balances and profit
    });

    it("should not meet a bid below the current price when there is no ask to match.", async () => {
      // Make sure current price is according the the previous trade
      const currentPrice = await dex.currentPrice();
      assert(currentPrice == 5);

      const txResp = await dex.submitBid(3, 50);
    });

    it("should direct buy an ask below the current price.", async () => {});

    it("should direct sell to a bid above the price, which has no matching ask.", async () => {});

    it("match the following sequence of bids and asks.", async () => {});
  });
});
