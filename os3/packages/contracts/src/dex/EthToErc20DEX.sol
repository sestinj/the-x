// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './ADex.sol';

contract EthToErc20Dex is ADex {

    function transferToken1(address payable reciever, uint256 quantity) override virtual internal {
        reciever.transfer(quantity);
    }

    function transferToken2(address payable reciever, uint256 quantity) override virtual internal {
        token2.transfer(reciever, quantity);
    }

    function transferToken1From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        // Since ethereum is automatically transferred to the contract via msg.value, we just have to verify that this amount was correct.
        if (msgValue < quantity) {
            return false;
        }
        return true;
    }
    function transferToken2From(address sender, address reciever, uint256 quantity, uint256 msgValue) override internal returns (bool) {
        return token2.transferFrom(sender, reciever, quantity);
    }

    function getToken1Balance() override internal view returns (uint256 balance) {
        return address(this).balance;
    }

    function getToken2Balance() override internal view returns (uint256 balance) {
        return token2.balanceOf(address(this));
    }

    function setupTokens(address token1Address_, address token2Address_) internal override {
        token2 = IERC20(token2Address_);
    }

    constructor(address token2Address_, uint256 quantity1_, uint256 quantity2_, address sender) ADex(address(0x0), token2Address_, quantity1_, quantity2_, sender) {}


}