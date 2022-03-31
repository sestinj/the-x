// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './ERC20.sol';


/**
@dev The Token contract may have implement one of several ICO strategies.
You previously had this contract inheriting ICO, but I don't think that's what you want. Consider renaming this one then?
 */
contract Token {

    constructor(string memory name_, string memory symbol_, address owner_) {
    }

    
}