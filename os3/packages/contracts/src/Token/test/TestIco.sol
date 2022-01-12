// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import '../ICO.sol';
import './TestToken.sol';

// A testable version of ICO token.
contract TestIco is ICO, TestToken {
    constructor(string memory name_, string memory symbol_, address owner_, uint256 icoPrice_, uint256 personalStake_) ICO(name_, symbol_, owner_, icoPrice_, personalStake_) {}
}