// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Bid.sol';

contract BidQueue {
    mapping(uint256 => Bid) queue;
    uint256 first = 1;
    uint256 last = 0;

    constructor() {}

    function enqueue(Bid memory bid) public {
        last += 1;
        queue[last] = bid;
    }

    function dequeue() public returns (Bid memory bid) {
        require(first <= last, "Empty queue.");

        Bid memory bid_ = queue[first];
        delete queue[first];
        first += 1;
        return bid_;
    }

    /**
    @return bid Get the next up item in the queue without removal.
     */
    function peek() public view returns (Bid memory bid) {
        require(first <= last, "Empty queue.");
        return queue[first];
    }

    function getLength() public view returns (uint256 length) {
        return last - first + 1;
    }
    // TODO: Make this a SafeQueue to ensure that if there are close to 2^256 enqueues, the mapping is shifted back down.
}