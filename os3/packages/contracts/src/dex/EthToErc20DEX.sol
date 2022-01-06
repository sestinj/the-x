// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './ADex.sol';

contract EthToErc20Dex is ADex {
    IERC20 token2;

    function transferToken1(address payable reciever, uint256 quantity) override virtual internal {
        reciever.transfer(quantity);
    }

    function transferToken2(address payable reciever, uint256 quantity) override virtual internal {
        token2.transfer(reciever, quantity);
    }

    function transferToken1From(address sender, address reciever, uint256 quantity) override internal {
        revert("Not yet implemented.");
    }
    function transferToken2From(address sender, address reciever, uint256 quantity) override internal {
        token2.transferFrom(sender, reciever, quantity);
    }

    function getToken1Balance() override internal view returns (uint256 balance) {
        return address(this).balance;
    }

    function getToken2Balance() override internal view returns (uint256 balance) {
        return token2.balanceOf(address(this));
    }

    constructor(address token2Address_) ADex() {
        token2 = IERC20(token2Address_);
    }

}