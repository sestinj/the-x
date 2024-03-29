// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Bid.sol';

/**
This is a max-heap used for ordering the bids in an exchange. Order by pricing then timing when using FIFO.
You might generalize this later to allow for pro-rata or other prioritization algorithms.
Uses FIFO algorithm. ORDER BY price DESC, time ASC
 */
contract BidHeap {
    Bid[] private bids;

    // This is the replacement for a timestamp.
    uint256 nextDeliNum = 0;

    constructor() {}

    /**
    @return above Bool, whether bid1 should be above bid2 in the heap
     */
    function compare(Bid memory bid1, Bid memory bid2) internal pure returns (bool above) {
        return bid1.price == bid2.price ? bid1.deliNum < bid2.deliNum : bid1.price > bid2.price;
    }

    function maxHeapify(uint256 i) internal {

        uint256 child1 = 2 * i + 1;
        uint256 child2 = 2 * i + 2;
        uint256 index = i;

        while (child1 < bids.length) { // checks if it's a leaf
            // Get index of the greater child
            uint maxChild = child2;
            if (child2 >= bids.length) {
                maxChild = child1;
            } else if (compare(bids[child1], bids[child2])) {
                maxChild = child1;
            }

            // If the greater child is in the right place, stop
            if (compare(bids[index], bids[maxChild])) {
                break;
            }
            Bid memory temp = bids[index];
            bids[index] = bids[maxChild];
            bids[maxChild] = temp;
            index = maxChild;

            child1 = index * 2 + 1;
            child2 = index * 2 + 2;
        }
    }

    function insert(uint256 price, uint256 quantity, address sender) public {
        Bid memory bid = Bid(price, quantity, sender, nextDeliNum, quantity);
        nextDeliNum += 1;
        
        // Add new bid to end of heap, and max-heapify from bottom up
        uint index = bids.length;
        // This is the problem
        uint parent = index > 0 ? (index - 1) / 2 : 0;
        bids.push(bid);
        while (compare(bids[index], bids[parent]) && index > 0) {
            Bid memory temp = bids[index];
            bids[index] = bids[parent];
            bids[parent] = temp;

            index = parent;
            parent = index > 0 ? (index - 1) / 2 : 0;
        }
    }

    /**
    @dev Get the next-up bid
     */
    function pop() public returns (Bid memory bid) {
        require(bids.length > 0, "Empty heap.");
        for (uint i; i < bids.length; i++) {
        }
        Bid memory bid_ = bids[0];

        // Replace first item with last and max-heapify from root
        uint256 lastIdx = bids.length - 1;
        bids[0] = bids[lastIdx];
        bids.pop();
        maxHeapify(0);

        return bid_;
    }

    function peek() public view returns (Bid memory bid) {
        require(bids.length > 0, "Empty heap.");
        return bids[0];
    }

    function isEmpty() public view returns (bool empty) {
        return bids.length == 0;
    }
}