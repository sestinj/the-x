// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './AFaucet.sol';
import '../Token/IERC20.sol';

contract ERC20Faucet is AFaucet {

    IERC20 token;

    constructor(address tokenAddress, uint256 dripSize) AFaucet() {
        token = IERC20(tokenAddress);
        DRIP_SIZE = dripSize;
    }

    function transferToken(address payable reciever, uint256 quantity) override internal returns (bool sent) {
        token.transfer(reciever, quantity);
        return true;
    }
    function getTokenBalance() override internal view returns (uint256 balance) {
        return token.balanceOf(address(this));
    }
}