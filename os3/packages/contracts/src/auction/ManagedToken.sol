// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/ERC20.sol';

contract ManagedToken is ERC20 {

    address public manager;

    constructor(string memory name_, string memory symbol_, address manager_) ERC20(name_, symbol_) {
        manager = manager_;
    }

    
}