// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
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

    // As of now, these exist to avoid DBZ
    uint256 FUNDS_BUFFER1 = 1;
    uint256 FUNDS_BUFFER2  = 1;

    LToken public lToken;

    function setupTokens(address token1Address_, address token2Address_) internal virtual {}

    constructor(address token1Address_, address token2Address_, uint256 quantity1, uint256 quantity2, address sender) payable {
        setupTokens(token1Address_, token2Address_);

        lToken = new LToken('LToken', 'LT', address(this)); // TODO - generate unique name

        // Deal with initial liquidity
        updateBalance(quantity2, true, false);
        updateBalance(quantity1, true, true);

        k = x * y;

        // Mint initial LTokens
        // TODO Find a better way of choosing this number. Lower means less chance of exceeding 2^256, higher means more precision. Both of these concerns are kind of edge case though.
        lToken.mint(sender, 1_000_000);
    }

    function getLTokenAddress() public view returns (address) {
        return address(lToken);
    }

    event PriceUpdate(uint256 price);
    event Swap(address sender, uint256 quantity, uint256 newPrice, bool isForward);

    uint256 public x; // balance of token1
    uint256 public y; // balance of token2
    uint256 public p; // = x / y
    uint256 public k; // = x * y
    uint256 public FEE = 1; // 1/1000


    function getPrice() public view returns (uint256) {
        // This is the price if you assume dx, dy << x, y s.t. (x+dy*x/y)(y-dy) \approx xy = k
        return p;
    }

    function getCostOfBuying(uint256 dy) public view returns (uint256) {
        return k / (y - dy) - x; // = dx
    }

    function getCostOfSelling(uint256 dy) public view returns (uint256) {
        return x  - k / (y + dy); // = dx
    }

    // function getPriceImpactOfBuying(uint256 dy) public view returns (uint256) {}
    // function getPriceImpactOfSelling(uint256 dy) public view returns (uint256) {}
    // function getSlippageOfBuying(uint256 dy) public view returns (uint256) {
    //     return getPrice() - getCostOfBuying(dy) / dy;
    // }

    // function getSlippageOfSelling(uint256 dy) public view returns (uint256) {
    //     return getPrice() - getCostOfSelling(dy) / dy;
    // }

    function updateBalance(uint256 quantity, bool isIncrease, bool isToken1) internal {
        if (isToken1) {
            x = isIncrease ? x + quantity : x - quantity;
        } else {
            y = isIncrease ? y + quantity : y - quantity;
        }
        // TODO - you shouldn't recalculate k here every time, what if this causes it to change from rounding errors?
        // But if you only calculate during liquidityAdds and removals, won't that suddenly cause all error propogation to hit at once?
        // k = x * y;
        p = x / y;
    }

    function swap(uint256 quantity, bool isForward) payable public {
        if (isForward) {
            buy(quantity);
        } else {
            sell(quantity);
        }
    }

    function buy(uint256 dy) payable public {
        // Verify collection of payment
        require(dy < y + FUNDS_BUFFER2, "IF");
        require(transferToken1From(msg.sender, address(this), getCostOfBuying(dy), msg.value), "NA");
        
        // Calculate fees, send output
        uint256 fees = dy * FEE / 1000; // TODO - SafeMath.sol
        console.log('fees', fees, FEE / 1000);
        transferToken2(payable(msg.sender), dy - fees);

        // TODO - give out fees!!!!

        // Update state, emit event
        updateBalance(getCostOfBuying(dy), true, true);
        updateBalance(dy, false, false);

        emit Swap(msg.sender, dy, p, true);
    }
    
    function sell(uint256 dy) payable public {
        // Verify collection of payment
        uint256 dx = getCostOfSelling(dy);
        require(dx < x + FUNDS_BUFFER1, "IF");
        require(transferToken2From(msg.sender, address(this), dy, msg.value), "NA");
        
        // Calculate fees, send output
        uint256 fees = dx * FEE / 1000; // TODO - SafeMath.sol
        transferToken1(payable(msg.sender), dx - fees);

        // Update state, emit event
        updateBalance(dx, false, true);
        updateBalance(dy, true, false);

        // TODO - Swap event needs more info (namely dx)
        emit Swap(msg.sender, dy, p, false);
    }

    event LiquidityAdd(address sender, uint256 n);
    
    function addLiquidity(uint256 quantity1, uint256 quantity2) payable public {
        require(quantity1 == quantity2 * p, "UQ");
        require(transferToken1From(msg.sender, address(this), quantity1, msg.value), "NA");
        require(transferToken2From(msg.sender, address(this), quantity2, msg.value), "NA");

        updateBalance(quantity1, true, true);
        updateBalance(quantity2, true, false);

        k = x * y; // See notes above

        // Calculate stake and mint LTokens
        uint256 s = (quantity1 + p * quantity2) / (p * y + x);
        uint256 r = (s * quantity2) / (y - quantity2);
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
        transferToken1(payable(msg.sender), s * x);
        transferToken2(payable(msg.sender), s * y);

        updateBalance(s * x, false, true);
        updateBalance(s * y, false, false);

        k = x * y; // See notes above

        emit LiquidityRemoval(msg.sender, n);
    }
}


