// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../EthToErc20Dex.sol';

library FEthToErc20Dex {
    function createDex(address token2, uint256 quantity1, uint256 quantity2, address sender) public returns (address) {
        EthToErc20Dex newDex = new EthToErc20Dex(token2, quantity1, quantity2, sender);
        return address(newDex);
    }
}