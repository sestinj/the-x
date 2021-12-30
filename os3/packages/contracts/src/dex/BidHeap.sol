// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './BidQueue.sol';

/**
This is a max-heap used for ordering the bids in an exchange. The nodes of the tree are each queues, to order by timing when using FIFO.
You might generalize this later to allow for pro-rata or other prioritization algorithms.
 */
contract BidHeap {
    BidQueue[] private bids;

    constructor() {}

    function maxHeapify(uint i) internal {
        uint256 child1 = 2 * i + 1;
        uint256 child2 = 2 * i + 2;
        uint index = i;

        while (bids[index].peek().price < bids[child1].peek().price || bids[index].peek().price < bids[child2].peek().price || 2 * index > bids.length) { // Last statement checks whether there are any children. TODO it does this wrong
            uint maxChild = child2;
            if (bids[child1].peek().price > bids[child2].peek().price) {
                maxChild = child1;
            }
            BidQueue temp = bids[i];
            bids[i] = bids[maxChild];
            bids[maxChild] = temp;
            index = maxChild;

            child1 = index * 2 + 1;
            child2 = index * 2 + 2;
        }
    }

    function insertBid(Bid memory bid_) internal {
        // Should you keep a mapping of prices to queues? Probably not because then you'd
        // have to update many times when maxHeapify-ing.
        // Alternative is to search through the heap upon every insertion, which will take O(n/2)
        // because you have to search through the entire layer of the heap since it is unordered.
        // This is not ideal.

        // If you changed to a single heap, which ordered FIFO style, you could get O(logn) insertion
        // But the problem would be if it was common for many orders of the same price you would be doing
        // the O(logn) deletion method way more often instead of just dequeueing in O(1). Tough to know a priori.
        // With a single heap would you have a log pop speed.
        // To analyze this you'll need to know average length of queues n_q and average size of heap n_h.
        // Might make this dynamic, would be cool.
        // Or use an AVL tree.

        // Add new bid to end of heap, and max-heapify from bottom up
        uint index = bids.length;
        uint parent = index / 2 - 1; // Division rounds toward zero. TODO -1 or no?
        bids.push(bid_);

        while (bids[parent].price < bids[index].price || index <= 0) {
            Bid memory temp = bids[index];
            bids[index] = bids[parent];
            bids[parent] = temp;

            index = parent;
            parent = index / 2 - 1;
        }
    }

    /**
    @dev Get the next-up bid by FIFO algorithm. ORDER BY price DESC, time ASC
     */
    function pop() public returns (Bid memory bid) {
        Bid memory bid_ = bids[0].dequeue();

        if (bids[0].getLength() == 0) {
            // Replace first item with last and max-heapify from root
            bids[0] = bids[bids.length - 1];
            delete bids[bids.length - 1];
            maxHeapify(0);
        }

        return bid_;
    }
}