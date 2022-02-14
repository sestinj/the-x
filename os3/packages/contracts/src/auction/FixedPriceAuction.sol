// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './AAuction.sol';
import './ManagedToken.sol'; // Go back later and make an interface so this is less heavy?

contract FixedPriceAuction is AAuction {

    // should we keep some of the token as liquidity for the exchange automatically? There has to be a market from the start and that won't necessarily happen if you just sell some initial tokens.

    uint256 public price;

    bool public open;

    uint256 public supply;

    // This is the percentage of the total token amount to be owned by the token owner at the beginning.
    // Though token supply is dynamic (with fixed price) during ICO, this is a constant.
    // Eventually make this more complex so you can have multiple initial shareholders. this is like the cap table
    uint256 public personalStake;

    struct Purchase {
        address purchaser;
        uint256 amount;
    }

    Purchase[] public purchases;

    ManagedToken internal token;

    /**
    @dev As of now the ICO is opened immediately upon construction, but there may be a
    use case where you want to initialize the ICO and be able to alter the supply/price
    before finalizing and opening.
     */
    function setOpen() internal {
        open = true;
    }

    event AuctionClosed();

    /**
    * @dev Transfers purchased tokens to purchasers, and purchasing funds to token owner.
    **/
    function setClosed() public {
        require(msg.sender == owner, "NP");
        open = false;
        for (uint i; i < purchases.length; i++) {
            // Mint tokens to each purchaser
            token.mint(purchases[i].purchaser, purchases[i].amount);
        }
        // Calculate personal stake to give to owner
        // TODO: How do I work with fractions? personalStake is a fraction?
        // Also this is the wrong calculation
        token.mint(owner, personalStake * supply);
        // Isn't transfer the preferred way to send Ether?
        (bool sent,) = owner.call{value: supply * price}("");
        require(sent, "TF");
        emit AuctionClosed();
    }

    constructor(string memory name_, string memory symbol_, address owner_, uint256 price_, uint256 personalStake_) {
        owner = owner_;
        price = price_;
        personalStake = personalStake_;
        token = new ManagedToken(name_, symbol_, address(this));
        setOpen();
    }

    event PurchaseEvent(address purchaser, uint256 amount);

    function purchase() payable public {
        uint256 amount = msg.value / price;
        purchases.push(Purchase(msg.sender, amount));
        supply += amount;
        emit PurchaseEvent(msg.sender, amount);
    }

    /**
    @dev In the case that the ICO fails to raise adequate funds before a certain date, or for some other reason
    the purchasers will be payed back.
     */
    function bail() internal {
        for (uint i; i < purchases.length; i++) {
            (bool sent,) = purchases[i].purchaser.call{value: purchases[i].amount}("");
            require(sent, "TF");
        }
    }

}

// Forms of ICO:
// - Standard stock market with roadshow and initial pool at fixed price and volume
// - Synthetic token price that tracks person's net worth through oracle
// - 