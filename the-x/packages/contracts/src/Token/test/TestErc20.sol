// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ERC20.sol';
import './TestToken.sol';

// A testable version of ICO token.
contract TestErc20 is ERC20, TestToken {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}
}