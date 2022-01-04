// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './ADEX.sol';

contract Erc20DEX is ADEX {

    function transferToken1(address payable reciever, uint256 quantity) override virtual internal {
        token1.transfer(reciever, quantity);
    }

    function transferToken2(address payable reciever, uint256 quantity) override virtual internal {
        token2.transfer(reciever, quantity);
    }

    function transferToken1From(address sender, address reciever, uint256 quantity) override internal {
        token1.transferFrom(sender, reciever, quantity);
    }
    function transferToken2From(address sender, address reciever, uint256 quantity) override internal {
        token2.transferFrom(sender, reciever, quantity);
    }

    function getToken1Balance(address tokenAddress) override internal returns (uint256 balance) {
        return token1.balanceOf(address(this));
    }

    function getToken2Balance(address tokenAddress) override internal returns (uint256 balance) {
        return token2.balanceOf(address(this));
    }

    constructor(address token1Address_, address token2Address_) ADEX(token1Address_, token2Address_) {}

}