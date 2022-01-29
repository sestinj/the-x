// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Erc20ToEthDex.sol';

library FErc20ToEthDex {
    function createDex(address token1, uint256 quantity1, uint256 quantity2, address sender) public returns (address) {
        Erc20ToEthDex newDex = new Erc20ToEthDex(token1, quantity1, quantity2, sender);
        return address(newDex);
    }
}