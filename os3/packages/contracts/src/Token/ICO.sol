// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './ERC20.sol';

contract ICO is ERC20 {

    // should we keep some of the token as liquidity for the exchange automatically? There has to be a market from the start and that won't necessarily happen if you just sell some initial tokens.

    address owner;

    uint256 public icoPrice;

    bool public icoOpen;

    uint256 public icoSupply;

    // This is the percentage of the total token amount to be owned by the token owner at the beginning.
    // Though token supply is dynamic (with fixed price) during ICO, this is a constant.
    uint256 public personalStake;

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
    function closeICO() public {
        require(msg.sender == owner, "You do not have permission to close the ICO.");
        icoOpen = false;
        for (uint i; i < icoPurchases.length; i++) {
            // Mint tokens to each purchaser
            _mint(icoPurchases[i].purchaser, icoPurchases[i].amount);
        }
        // Calculate personal stake to give to owner
        // TODO: How do I work with fractions? personalStake is a fraction?
        // Also this is the wrong calculation
        _mint(owner, personalStake*icoSupply);
        // Isn't transfer the preferred way to send Ether?
        (bool sent,) = owner.call{value: icoSupply*icoPrice}("");
        require(sent, "Failed to transfer proceeds to owner.");
    }

    constructor(string memory name_, string memory symbol_, address owner_, uint256 icoPrice_, uint256 personalStake_) ERC20(name_, symbol_) {
        owner = owner_;
        icoPrice = icoPrice_;
        personalStake = personalStake_;
        openICO();
    }

    event IcoPurchase(address purchaser, uint256 amount);

    function purchase(uint256 amount) payable public {
        // Or just make this parameterless.
        require(amount*icoPrice == msg.value, "Transaction value must match amount parameter times price.");
        icoPurchases.push(ICOPurchase(msg.sender, amount));
        icoSupply += amount;
        emit IcoPurchase(msg.sender, amount);
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