import { ethers } from "hardhat";
import { assert } from "chai";
import BidHeap from "../artifacts/src/dex/BidHeap.sol/BidHeap.json";
import AskHeap from "../artifacts/src/dex/AskHeap.sol/AskHeap.json";
import { Contract, BigNumber } from "ethers";
import { waitForTx } from "./libs";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe.skip("Bid Heap", () => {
  var signers: SignerWithAddress[];
  before(async () => {
    signers = await ethers.getSigners();
  });
  var bidHeap: Contract;
  it("should initialize without error.", async () => {
    const BidHeap = await ethers.getContractFactory("BidHeap");
    bidHeap = await BidHeap.deploy();
  });

  const bidQuantities = [100, 100, 100, 100, 100, 100, 100, 100];
  const bidPrices = [5, 4, 6, 3, 2, 7, 8, 1];
  const sorted = [...bidPrices].sort().reverse();
  it("should allow insertion of multiple bids.", async () => {
    for (let i = 0; i < bidPrices.length; i++) {
      await waitForTx(
        bidHeap.insert(bidPrices[i], bidQuantities[i], signers[0].address)
      );
    }

    // console.log("Attempting insertion: ", tx);
  });

  it("should pop all in the correct order and correctly maxHeapify.", async () => {
    for (let i = 0; i < bidPrices.length; i++) {
      var peek = await bidHeap.peek();
      var val = (peek[0] as BigNumber).toNumber();
      assert(val == sorted[i]);
      await waitForTx(bidHeap.pop());
    }
    try {
      await waitForTx(bidHeap.pop());
      assert(false); // Expecting an error when popping from empty heap
    } catch (err) {
      console.log(err);
    }
  });
});

// Deal with the ask heap only when you're done with the bid heap. They're the same thing. Just copy paste.
// Eventually you'll want to move toward considering asks and bids as the same thing: orders.
