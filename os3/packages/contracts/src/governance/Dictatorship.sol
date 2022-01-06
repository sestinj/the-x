// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

abstract contract Dictatorship {

    address[] public pastDictators;

    address public dictator;

    event NewDictator(address newDictator);

    function appoint(address newDictator) public {
        require(msg.sender == dictator, "You have no power.");
        pastDictators.push(dictator);
        dictator = newDictator;
        emit NewDictator(newDictator);
    }

    constructor() {
        dictator = msg.sender;
    }
}