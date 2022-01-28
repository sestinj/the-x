// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/ERC20.sol';

/// @title Liquidity Token
/// @author Nate Sesti
/// @notice An ERC-20 token representing liquidity stake in a pair of The X
/// @dev Explain to a developer any extra details
contract LToken is ERC20 {

    address public x;

    constructor(string memory name_, string memory symbol_, address x_) ERC20(name_, symbol_) {
        x = x_;
    }

    function mint(address to, uint256 quantity) public {
        require(msg.sender == x, 'NP');
        _mint(to, quantity);
    }

    function burn(address account, uint256 quantity) public {
        require(msg.sender == x, 'NP');
        _burn(account, quantity);
    }
}