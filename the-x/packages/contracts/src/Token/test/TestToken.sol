// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC20.sol";

// This is a token which is publicly mintable, for use in unit tests

abstract contract TestToken is ERC20 {

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }
}