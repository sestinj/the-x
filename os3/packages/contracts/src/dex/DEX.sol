// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './Bid.sol';
import './Ask.sol';
import './AskHeap.sol';
import './BidHeap.sol';

contract DEX {
    uint256 FUNDS_BUFFER1 = 0;
    uint256 FUNDS_BUFFER2  = 0;
    uint256 DEFAULT_SPREAD = 100; // wei

    // You can purchase token2 with token1. A bid wants to buy token2 with token1. An ask is selling token2 for token1.
    IERC20 token1;
    IERC20 token2;
    address token1Address;
    address token2Address;

    uint256 token1Balance;
    uint256 token2Balance;

    uint256 currentPrice;

    constructor(uint256 token1Balance_, uint256 token2Balance_, address token1Address_, address token2Address_) {
        token1Balance = token1Balance_;
        token2Balance = token2Balance_;
        token1Address = token1Address_;
        token2Address = token2Address;
        token1 = IERC20(token1Address_);
        token2 = IERC20(token2Address_);
    }

    // A max-heap ordered by price containing queues ordered by time
    BidHeap[] private bids;

    // A min-heap of asks ordered by price containing queues ordered by time
    AskHeap[] private asks;

    function insertAsk(Ask memory ask_) internal {
        asks.enqueue(ask_);
    }

    function bid(uint256 price, uint256 quantity, uint256 spread) public {
        insertBid(Bid(price, quantity, msg.sender, spread));
    }

    function bid(uint256 price, uint256 quantity) public {
        insertBid(Bid(price, quantity, msg.sender, DEFAULT_SPREAD));
    }

    function ask(uint256 price, uint256 quantity, uint256 spread) public {
        insertAsk(Ask(price, quantity, msg.sender, spread));
    }

    function ask(uint256 price, uint256 quantity) public {
        insertAsk(Ask(price, quantity, msg.sender, DEFAULT_SPREAD));
    }

    function popBid() internal returns (Bid memory bid_) {
        // Pop from the queue, if it's empty then swap with last in heap and max-heapify

    }

    function matchBidToAskFIFO(Ask memory ask_) internal {
        // First match an ask with highest bid amount
        // Break ties by earliness. Determined by queue.
        // TODO: How do we select the ask to meet? For now will just go with earliest
        
        // TODO: Ensure the spread is met, otherwise move onto another ask. What to do with unmet asks?
        // Naive is to keep them front of queue but this is easily attacked with outrageously high asks.
        Bid memory bid_ = popBid();
        swap(bid_, ask_);
    }

    function main() internal {
        // Is there a better way than a forever loop? Maybe trigger this only upon a bid or ask?
        while (asks.getLength() > 0) {
            Ask memory ask_ = asks.dequeue();
            matchBidToAskFIFO(ask_);
        }
    }

    event PriceUpdate(uint256 price);

    // Right now we will assume that the bid and ask's tokens are being held once they are sent in.
    // But you may want to instead do somethig with allowances so it can remain in their account.

    // TODO What if only a portion of the bid/ask are met, as in Pro Rata?
    function swap(Bid memory bid_, Ask memory ask_) internal {
        require(bid_.quantity + FUNDS_BUFFER2 <= token2Balance, "Insufficient funds to transfer token 2.");
        require(ask_.quantity + FUNDS_BUFFER1 <= token1Balance, "Insufficient funds to transfer token 1.");
        token1.transfer(ask_.sender, ask_.quantity);
        token2.transfer(bid_.sender, bid_.quantity);
        
        currentPrice = bid_.price;
        emit PriceUpdate(bid_.price); // Emits the current price of token2
    }


    /**
    When contract funds are available, we can meet a buy order without having any sell orders to match it with.
    They will buy at the price of the last match, which is the currentPrice.
    These will be called only when there is no available match.
    Notice that the buyer in this case will likely be buying for more than the currentPrice, which in effect
    results in a profit for the DEX. Alternative is to give the currentPrice to buyers and sellers. But since
    they specify what they are willing to buy/sell for, profit seems fair. This is the benefit of providing
    liquidity. This might be how you pay back a liquidity pool.
     */
    function directBuy(Bid memory bid_) internal {
        require(bid_.price >= currentPrice, "No bid price meets current.");
        require(bid_.quantity + FUNDS_BUFFER2 <= token2Balance, "Insufficient funds to transfer token 2.");
        token2.transfer(bid_.sender, bid_.quantity);
    }

    function directSell(Ask memory ask_) internal {
        require(ask_.price <= currentPrice, "No ask price meets current.");
        require(ask_.quantity + FUNDS_BUFFER1 <= token1Balance, "Insufficient funds to transfer token 1.");
        token1.transfer(ask_.sender, ask_.quantity);
    }

}