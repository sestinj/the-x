// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './ERC20.sol';

abstract contract ICO is ERC20 {

    address owner;

    uint256 public icoPrice;

    bool public icoOpen;

    uint256 public icoSupply;

    // Amount specified by the token owner to reinvest their proceeds back into the token.
    // This volume has to be agreed upon by purchasers, so cannot change following icoOpen()
    uint256 private reinvestmentAmount;

    struct ICOPurchase {
        address purchaser;
        uint256 amount;
    }

    ICOPurchase[] public icoPurchases;

    /**
    @dev As of now the ICO is opened immediately upon construction, but there may be a
    use case where you want to initialize the ICO and be able to alter the supply/price
    before finalizing and opening.
     */
    function openICO() internal {
        icoOpen = true;
    }

    /**
    * @dev Transfers purchased tokens to purchasers, and purchasing funds to token owner.
    **/
    function closeICO() internal {
        icoOpen = false;
        for (uint i; i < icoPurchases.length; i++) {
            // Mint tokens to each purchaser
            _mint(icoPurchases[i].purchaser, icoPurchases[i].amount);
        }
        // Transfer the funds collected to the owner of the token, or put them directly back into tokens for the owner if specified.
        _mint(owner, reinvestmentAmount);
        (bool sent,) = owner.call{value: icoPrice*icoSupply - reinvestmentAmount}("");
        require(sent, "Failed to transfer proceeds to owner.");
    }

    constructor(string memory name_, string memory symbol_, address owner_, uint256 icoPrice_, uint256 icoSupply_, uint256 reinvestmentAmount_) ERC20(name_, symbol_) {
        owner = owner_;
        icoPrice = icoPrice_;
        icoSupply = icoSupply_;
        reinvestmentAmount = reinvestmentAmount_;
        openICO();
    }

    function purchase(uint256 amount) payable public {
        require(amount == msg.value, "Transaction value must match amount parameter.");
        icoPurchases.push(ICOPurchase(msg.sender, amount));
    }

    /**
    @dev In the case that the ICO fails to raise adequate funds before a certain date, or for some other reason
    the purchasers will be payed back.
     */
    function bail() internal {
        for (uint i; i < icoPurchases.length; i++) {
            (bool sent,) = icoPurchases[i].purchaser.call{value: icoPurchases[i].amount}("");
            require(sent, "Failed to pay back purchaser.");
        }
    }

}

// Forms of ICO:
// - Standard stock market with roadshow and initial pool at fixed price and volume
// - Synthetic token price that tracks person's net worth through oracle
// - 