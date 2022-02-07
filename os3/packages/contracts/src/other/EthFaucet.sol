// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './AFaucet.sol';

contract EthFaucet is AFaucet {
    constructor(address forwarder_) AFaucet(forwarder_) {}

    function transferToken(address payable reciever, uint256 quantity) override internal returns (bool sent) {
        (sent,) = reciever.call{value: quantity}("");
    }
    function getTokenBalance() override internal view returns (uint256 balance) {
        return address(this).balance;
    }
}