// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './ADex.sol';

contract Erc20Dex is ADex {

    function transferToken1(address payable reciever, uint256 quantity) override virtual internal {
        token1.transfer(reciever, quantity);
    }

    function transferToken2(address payable reciever, uint256 quantity) override virtual internal {
        token2.transfer(reciever, quantity);
    }

    function transferToken1From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        return token1.transferFrom(sender, reciever, quantity);
    }
    function transferToken2From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        return token2.transferFrom(sender, reciever, quantity);
    }

    function getToken1Balance() override internal view returns (uint256 balance) {
        return token1.balanceOf(address(this));
    }

    function getToken2Balance() override internal view returns (uint256 balance) {
        return token2.balanceOf(address(this));
    }

    function setupTokens(address token1Address_, address token2Address_) internal override {
        token1 = IERC20(token1Address_);
        token2 = IERC20(token2Address_);
    }

    constructor(address token1Address_, address token2Address_, uint256 quantity1_, uint256 quantity2_, address sender) ADex(token1Address_, token2Address_, quantity1_, quantity2_, sender) {}

}