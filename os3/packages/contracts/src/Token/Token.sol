// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <9.0.0;

import './ERC20.sol';
import './ICO.sol';


/**
@dev The Token contract may have implement one of several ICO strategies.
 */
contract Token is ICO {
    address public owner;

    constructor(string memory name_, string memory symbol_, address owner_) ICO(name_, symbol_) {
        owner = owner_;
    }

    
}