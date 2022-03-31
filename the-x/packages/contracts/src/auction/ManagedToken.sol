// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/ERC20.sol';

contract ManagedToken is ERC20 {

    // Once the manager is set to the zero address, the token is forever free. This will happen upon the auction close.
    // In the case of auctions, the user controls the token through the auction contract, which is the direct manager.

    address public manager;

    constructor(string memory name_, string memory symbol_, address manager_) ERC20(name_, symbol_) {
        manager = manager_;
    }

    function mint(address account, uint256 amount) external {
        require(_msgSender() == manager, 'NP');
        _mint(account, amount);
    }

    function setManager(address manager_) public {
        require(_msgSender() == manager, 'NP');
        manager = manager_;
    }
}