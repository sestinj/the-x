// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Erc20Dex.sol';

library FErc20Dex {
    function createDex(address token1, address token2, uint256 quantity1, uint256 quantity2, address sender) public returns (address) {
        Erc20Dex newDex = new Erc20Dex(token1, token2, quantity1, quantity2, sender);
        return address(newDex);
    }
}