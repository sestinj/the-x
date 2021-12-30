// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Ask.sol';

contract AskQueue {
    mapping(uint256 => Ask) queue;
    uint256 first = 1;
    uint256 last = 0;

    constructor() {}

    function enqueue(Ask memory ask) public {
        last += 1;
        queue[last] = ask;
    }

    function dequeue() public returns (Ask memory ask) {
        require(first <= last, "Empty queue.");

        Ask memory ask_ = queue[first];
        delete queue[first];
        first += 1;
        return ask_;
    }

    /**
    @return ask Get the next up item in the queue without removal.
     */
    function peek() public view returns (Ask memory ask) {
        require(first <= last, "Empty queue.");
        return queue[first];
    }

    function getLength() public view returns (uint256 length) {
        return last - first + 1;
    }
    // TODO: Make this a SafeQueue to ensure that if there are close to 2^256 enqueues, the mapping is shifted back down.
}