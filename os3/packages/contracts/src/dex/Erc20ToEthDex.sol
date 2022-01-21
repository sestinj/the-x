// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './ADex.sol';

contract Erc20ToEthDex is ADex {

    function transferToken1(address payable reciever, uint256 quantity) override virtual internal {
        token1.transfer(reciever, quantity);
    }

    function transferToken2(address payable reciever, uint256 quantity) override virtual internal {
        reciever.transfer(quantity);
    }

    function transferToken1From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        return token1.transferFrom(sender, reciever, quantity);
    }
    function transferToken2From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        if (msgValue < quantity) {
            return false;
        }
        return true;
    }

    function getToken1Balance() override internal view returns (uint256 balance) {
        return token2.balanceOf(address(this));
    }

    function getToken2Balance() override internal view returns (uint256 balance) {
        return address(this).balance;
    }

    constructor(address token1Address_) ADex() {
        token1 = IERC20(token1Address_);
    }

}