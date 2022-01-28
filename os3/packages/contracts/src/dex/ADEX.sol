// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './Bid.sol';
import './Ask.sol';
import './BidHeap.sol';
import './AskHeap.sol';
import './LToken.sol';
import 'hardhat/console.sol';

/// @title AMM DEX
/// @author Nate Sesti
/// @notice A single exchange pair
/// @dev x
/// Note that `quantity` is always in terms of token2
/// TODO Float math EVERYWHERE!
/// TODO Send fees to liquidity holders.
abstract contract ADex {
    // Implements all the usual DEX functions, but leaves token transfer implementations for child contracts
    function transferToken1(address payable reciever, uint256 quantity) virtual internal;
    function transferToken2(address payable reciever, uint256 quantity) virtual internal;
    function transferToken1From(address sender, address reciever, uint256 quantity, uint256 msgValue) virtual internal returns (bool);
    function transferToken2From(address sender, address reciever, uint256 quantity, uint256 msgValue) virtual internal returns (bool);
    function getToken1Balance() virtual internal view returns (uint256 balance);
    function getToken2Balance() virtual internal view returns (uint256 balance);

    IERC20 token1;
    IERC20 token2;

    uint256 FUNDS_BUFFER1 = 0;
    uint256 FUNDS_BUFFER2  = 0;

    LToken public lToken;

    constructor(uint256 quantity1, uint256 quantity2) {
        lToken = new LToken('LToken', 'LT', address(this)); // TODO - generate unique name

        // Deal with initial liquidity
        require(transferToken1From(msg.sender, address(this), quantity1, msg.value), "Transfer of funds not approved.");
        require(transferToken2From(msg.sender, address(this), quantity2, msg.value), "Transfer of funds not approved.");

        updateBalance(quantity1, true, true);
        updateBalance(quantity2, true, false);

        // Mint initial LTokens
        // TODO Find a better way of choosing this number. Lower means less chance of exceeding 2^256, higher means more precision. Both of these concerns are kind of edge case though.
        lToken.mint(msg.sender, 1_000_000);
    }

    function getLTokenAddress() public view {
        return address(lToken);
    }

    event PriceUpdate(uint256 price);
    event Swap(address sender, uint256 quantity, uint256 newPrice, bool isForward);

    uint256 public x; // balance of token1
    uint256 public y; // balance of token2
    uint256 public p; // = x / y
    uint256 public k; // = x * y
    uint256 public FEE = 1; // 1/1000


    function getPrice() public view {
        return p;
    }

    function updateBalance(uint256 quantity, bool isIncrease, bool isToken1) internal {
        if (isToken1) {
            x = isIncrease ? x + quantity : x - quantity;
        } else {
            y = isIncrease ? y + quantity : y - quantity;
        }
        k = x * y;
        p = x / y;
    }

    function swap(uint256 quantity, bool isForward) payable public {
        if (isForward) {
            buy(quantity);
        } else {
            sell(quantity);
        }
    }

    function buy(uint256 quantity) payable public {
        // Verify collection of payment
        require(quantity > y + FUNDS_BUFFER2, "IF");
        require(transferToken1From(msg.sender, address(this), quantity*p, msg.value), "Transfer of funds not approved.");
        
        // Calculate fees, send output
        uint256 fees = quantity * FEE / 1000; // TODO - SafeMath.sol
        transferToken2(msg.sender, quantity - fees);

        // TODO - give out fees!!!!

        // Update state, emit event
        updateBalance(quantity * p, true, true);
        updateBalance(quantity, false, false);

        emit Swap(msg.sender, quantity, p, true);
    }
    
    function sell(uint256 quantity) payable public {
        // Verify collection of payment
        require(quantity * p > x + FUNDS_BUFFER1, "IF");
        require(transferToken2From(msg.sender, address(this), quantity, msg.value), "Transfer of funds not approved.");
        
        // Calculate fees, send output
        uint256 fees = quantity * p * FEE / 1000; // TODO - SafeMath.sol
        transferToken1(msg.sender, quantity * p - fees);

        // Update state, emit event
        updateBalance(quantity * p, false, true);
        updateBalance(quantity, true, false);

        emit Swap(msg.sender, quantity, p, false);
    }

    event LiquidityAdd(address sender, uint256 n);
    /// @notice Add to the liquidity pool
    /// @dev Currently using k=xy, enforcing equal amounts of each coin to be added when adding liquidity.
    /// @param quantity Amount of liquidity to donate
    /// @return Documents the return variables of a contract’s function state variable
    /// @inheritdoc	Copies all missing tags from the base function (must be followed by the contract name)
    function addLiquidity(uint256 quantity1, uint256 quantity2) payable public {
        require(quantity1 == quantity2 * p, "Must add equal amounts of each coin.");
        require(transferToken1From(msg.sender, address(this), quantity1, msg.value), "Transfer of funds not approved.");
        require(transferToken2From(msg.sender, address(this), quantity2, msg.value), "Transfer of funds not approved.");

        updateBalance(quantity1, true, true);
        updateBalance(quantity2, true, false);

        // Calculate stake and mint LTokens
        uint256 s = (quantity1 + p * quantity2) / (p * y + x);
        uint256 r = (s * quantity2) / (y - n);
        lToken.mint(msg.sender, r);

        emit LiquidityAdd(msg.sender, r);
    }

    event LiquidityRemoval(address sender, uint256 n);
    function removeLiquidity(uint256 n) public {
        // Calculate stake
        uint256 s = n / lToken.totalSupply();
        // Directly burn LTokens
        lToken.burn(msg.sender, n);

        // Any fees at this point?
        transferToken1(msg.sender, s * x);
        transferToken2(msg.sender, s * y);

        updateBalance(s * x, false, true);
        updateBalance(s * y, false, false);

        emit LiquidityRemoval(msg.sender, n);
    }
}


