// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Ask.sol';

/**
This is a min-heap used for ordering the asks in an exchange. Order by pricing then timing when using FIFO.
You might generalize this later to allow for pro-rata or other prioritization algorithms.
Uses FIFO algorithm. ORDER BY price DESC, time ASC

Notice that the only difference between this and the BidHeap contract is 'ask1.price < ask2.price' in compare() instead of >.
 */
contract AskHeap {
    Ask[] private asks;

    // This is the replacement for a timestamp.
    uint256 nextDeliNum = 0;

    constructor() {}

    /**
    @return above Bool, whether ask1 should be above ask2 in the heap
     */
    function compare(Ask memory ask1, Ask memory ask2) internal pure returns (bool above) {
        return ask1.price == ask2.price ? ask1.deliNum < ask2.deliNum : ask1.price < ask2.price;
    }

    function minHeapify(uint i) internal {
        uint256 child1 = 2 * i + 1;
        uint256 child2 = 2 * i + 2;
        uint index = i;

        while (!compare(asks[index], asks[child1]) || !compare(asks[index], asks[child2]) || 2 * index > asks.length) { // Last statement checks whether there are any children. TODO it does this wrong
            uint minChild = child2;
            if (compare(asks[child1], asks[child2])) {
                minChild = child1;
            }
            Ask memory temp = asks[index];
            asks[index] = asks[minChild];
            asks[minChild] = temp;
            index = minChild;

            child1 = index * 2 + 1;
            child2 = index * 2 + 2;
        }
    }

    function insert(uint256 price, uint256 quantity, address sender) public {
        Ask memory ask = Ask(price, quantity, sender, nextDeliNum, quantity);
        nextDeliNum += 1;

        // Add new ask to end of heap, and min-heapify from bottom up
        uint index = asks.length;
        uint parent = index / 2 - 1; // Division rounds toward zero. TODO -1 or no?
        asks.push(ask);

        while (compare(asks[index], asks[parent]) || index <= 0) {
            Ask memory temp = asks[index];
            asks[index] = asks[parent];
            asks[parent] = temp;

            index = parent;
            parent = index / 2 - 1;
        }
    }

    /**
    @dev Get the next-up ask
     */
    function pop() public returns (Ask memory ask) {
        Ask memory ask_ = asks[0];

        // Replace first item with last and min-heapify from root
        asks[0] = asks[asks.length - 1];
        delete asks[asks.length - 1];
        minHeapify(0);

        return ask_;
    }

    function peek() public view returns (Ask memory ask) {
        require(asks.length > 0, "Empty heap.");
        return asks[0];
    }

    function isEmpty() public view returns (bool empty) {
        return asks.length == 0;
    }
}