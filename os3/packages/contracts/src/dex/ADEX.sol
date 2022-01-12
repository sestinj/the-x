// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './Bid.sol';
import './Ask.sol';
import './BidHeap.sol';
import './AskHeap.sol';
import 'hardhat/console.sol';

// You can eventually generalize like this so you don't have to rewrite the DEX class to work with non-ERC-20 tokens.
// Specifying these functions should include checks for allowance.
// You might also want to specify address domains in case you are working with off/other chain addresses for something like Solana.

// An even better way to do this would be to define an interface for any token, which itself hides the type of token you are working with.
// Then you only have to specify that token type once. Don't overdo this right now though because the only other type of token
// you have to deal with is Eth until you move off-chain and that might end up being radically different so as to not want to make
// this abstraction. Probably better to leave it at the DEX level for visibility.

abstract contract ADex {
    // Implements all the usual DEX functions, but leaves token transfer implementations for child contracts
    function transferToken1(address payable reciever, uint256 quantity) virtual internal;
    function transferToken2(address payable reciever, uint256 quantity) virtual internal;
    function transferToken1From(address sender, address reciever, uint256 quantity) virtual internal returns (bool);
    function transferToken2From(address sender, address reciever, uint256 quantity) virtual internal returns (bool);
    function getToken1Balance() virtual internal view returns (uint256 balance);
    function getToken2Balance() virtual internal view returns (uint256 balance);

    IERC20 token1;
    IERC20 token2;

    uint256 FUNDS_BUFFER1 = 0;
    uint256 FUNDS_BUFFER2  = 0;

    uint256 token1Balance;
    uint256 token2Balance;

    uint256 public currentPrice;

    bool mainRunning = false;

    BidHeap private bids;
    AskHeap private asks;

    constructor() {
        bids = new BidHeap();
        asks = new AskHeap();
    }

    event NewBid(uint256 price, uint256 quantity, address sender);
    event NewAsk(uint256 price, uint256 quantity, address sender);

    function submitBid(uint256 price, uint256 quantity) public {
        // Right now the transfer has to happen before the payback, but UniSwap does Flash Swaps, which you could implement
        require(transferToken1From(msg.sender, address(this), quantity*price), "Transfer of funds not approved.");
        token1Balance += quantity;
        bids.insert(price, quantity, msg.sender);
        emit NewBid(price, quantity, msg.sender);
        if (!mainRunning) {
            mainRunning = true;
            main();
        }
    }

    function submitAsk(uint256 price, uint256 quantity) public {
        require(transferToken2From(msg.sender, address(this), quantity), "Transfer of funds not approved.");
        token2Balance += quantity;
        asks.insert(price, quantity, msg.sender);
        emit NewAsk(price, quantity, msg.sender);
        if (!mainRunning) {
            mainRunning = true;
            main();
        }
    }

    function main() internal {
        while (!asks.isEmpty() || !bids.isEmpty()) {
            if (!asks.isEmpty() && !bids.isEmpty()) {
                Ask memory topAsk = asks.peek();
                Bid memory topBid = bids.peek();

                int256 spread = int256(topAsk.price) - int256(topBid.price);

                if (spread < 0) {
                    // Inverted market.
                    // 1) Direct buy as long as topBid.price > currentPrice. You get token1 for cheap.
                    // 2) What will this cause people to do? Will they continue buying at inverted prices until you run out of balance?
                    // 3) Direct sell as long as topAsk.price < currentPrice. You get token2 for cheap.
                    // After direct buy, should you raise the price to that specified by the buyer? You then have tokens which are worth more.
                    // After direct sell, should you lower the price? Wouldn't doing this repeatedly change the price in large swings?
                    // It would make the tokens you are recieving "worth more" but this seems transient?
                    if (!directBuy(topBid) && !directSell(topAsk)) {
                        break;
                    }
                } else {
                    // Right-side-up market. Buy, mark up, sell.
                    swap(topBid, topAsk);
                }
            } else if (!asks.isEmpty()) {
                if (!directSell(asks.peek())) {
                    break;
                }
            } else {
                if (!directBuy(bids.peek())) {
                    break;
                }
            }
            
        }
        mainRunning = false;
    }

    // Emits the current price of token2
    event PriceUpdate(uint256 price);

    function swap(Bid memory bid, Ask memory ask) internal {

        if (bid.quantityRemaining < ask.quantityRemaining) {
            // Use the entire bid - how do you know another bid hasn't come into the heap in between? Is pop safe?
            bids.pop();
            // We made sure the allowance goes through, but consider making a mapping(address => uint256) of balances given by each account.
            // Or is it significantly more efficient to transfer directly from user to user?
            transferToken1(payable(ask.sender), bid.quantityRemaining*bid.price);
            transferToken2(payable(bid.sender), bid.quantityRemaining);
            ask.quantityRemaining -= bid.quantityRemaining;
        } else if (bid.quantityRemaining > ask.quantityRemaining) {
            asks.pop();
            transferToken1(payable(ask.sender), ask.quantityRemaining*bid.price);
            transferToken2(payable(bid.sender), ask.quantityRemaining);
            bid.quantityRemaining -= ask.quantityRemaining;
        } else {
            asks.pop();
            bids.pop();
            transferToken1(payable(ask.sender), ask.quantityRemaining*bid.price);
            transferToken2(payable(bid.sender), ask.quantityRemaining);
        }
        
        currentPrice = bid.price;
        emit PriceUpdate(bid.price);
    }


    /**
    When contract funds are available, we can meet a buy order without having any sell orders to match it with.
    They will buy at the price of the last match, which is the currentPrice.
    Notice that we only allow directBuy when the buyer is buying for more than the currentPrice, which
    results DEX profit.
    Alternative is to give the currentPrice to buyers and sellers. But since
    they specify what they are willing to buy/sell for, profit seems fair. This is the benefit of providing
    liquidity. This might be how you pay back a liquidity pool.
    @return bool whether the direct bid went through - if not we should not try anymore
     */
    function directBuy(Bid memory bid) internal returns (bool) {
        if (bid.price >= currentPrice && bid.quantityRemaining + FUNDS_BUFFER2 <= token2Balance) {
            bids.pop();
            transferToken2(payable(bid.sender), bid.quantityRemaining);
            return true;
        }
        return false;
    }

    /**
    @return bool whether the direct sell went through - if not we should not try anymore
     */
    function directSell(Ask memory ask) internal returns (bool) {
        if (ask.price <= currentPrice && ask.quantityRemaining*ask.price + FUNDS_BUFFER1 <= token1Balance) {
            asks.pop();
            transferToken1(payable(ask.sender), ask.quantityRemaining*ask.price);
            return true;
        }
        return false;
    }
}

// Spread = min ask - max bid.
// + Spread: Buy the bid, and sell for more, make both parties happy, make money.
// - Spread: ? "Inverted Market", seems like there will be some token surplus you can still take advantage of?

// Make sure this all makes sense, that neither will run out of money, and will there be leftover funds
// Ask must sell ask_.quantity of token2. It is willing to recieve down to ask_.quantity*ask.price of token1.
// Bid must receive bid.quantity of token2. It is willing to pay up to bid.quantity*bid.price of token1.
// token1 surplus = ask_.quantity*ask.price - bid.quantity*bid.price
// token2 surplus = ask_.quantity - bid.quantity
// This is more confusing when you're working with multiple bids to pay each ask and vice versa.
// I think the key is that you are exploiting the difference in the prices they are willing to accept.
// The bid should always have to pay the price they specify and the ask should always only get the price they specify.
// So you might only have surplus of token1. Is the exchange not naturally symmetric then?
// To get liquidity of token2 you might either make a central liquidity pool for all exchange pairs.
// Or you might simply make a bid of your own occasionally when token2 balance gets lower than token1 balance (relative to price).
// Might also take into account the current rate of flow (maybe more people buying token2 than vice versa and you can make forecasts).

// Don't collect the bid amount up front, but on the front end at this point you should
// have the user approve an allowance on the token for this contract


// Pop bids until the ask is fully met
// 2 options: 1) Hold funds until an order is completely fulfilled 2) pay out immediately
// The latter is probably needed otherwise one order would be paying and the other not sending tokens yet

// TODO: Since you are declaring memory below, you might not be changing the underlying struct you want to (this could be a transient copy)
// Just check this, if it isn't working right probably will just have to do bids.peek().quantityMet += ... or something.
// The above still might not work though because I think the function is "return (Bid MEMORY bid)"
// **Bid memory nextBid = bids.peek();**

// Note that price always refers to the number of token1 needed to get a single token2
// So nextBid.quantity*price is the number of token1 they will give up to get bid.quantity of token2

// TODO Will need a slightly modified contract to interact with non-ERC20 tokens, including Ether. Then much more work to deal with other blockchains