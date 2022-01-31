// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../Token/IERC20.sol';
import './LToken.sol';
import 'hardhat/console.sol';
import '../libs/Q128x128.sol';

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
    uint128 FUNDS_BUFFER1 = 1;
    uint128 FUNDS_BUFFER2  = 1;

    LToken public lToken;

    function setupTokens(address token1Address_, address token2Address_) internal virtual {}

    constructor(address token1Address_, address token2Address_, uint256 quantity1, uint256 quantity2, address sender) payable {
        setupTokens(token1Address_, token2Address_);

        lToken = new LToken('LToken', 'LT', address(this)); // TODO - generate unique name

        // Deal with initial liquidity
        updateBalance(uint128(quantity2), true, false);
        updateBalance(uint128(quantity1), true, true);

        k = x * y;

        // Mint initial LTokens
        // TODO Find a better way of choosing this number. Lower means less chance of exceeding 2^256, higher means more precision. Both of these concerns are kind of edge case though.
        lToken.mint(sender, 1_000_000);
    }

    function getLTokenAddress() public view returns (address) {
        return address(lToken);
    }

    event PriceUpdate(uint256 price);
    event Swap(address sender, uint128 quantity, uint256 newPrice, bool isForward);

    uint128 public x; // balance of token1
    uint128 public y; // balance of token2
    uint256 public p; // = x / y
    uint128 public k; // = x * y
    uint256 public FEE = Q128x128.fpDiv(1, 1000); // 1/1000
    uint128 public f1;
    uint128 public f2;


    function getPrice() public view returns (uint256) {
        // This is the price if you assume dx, dy << x, y s.t. (x+dy*x/y)(y-dy) \approx xy = k
        return p;
    }

    function getCostOfBuying(uint128 dy) public view returns (uint128) {
        return k / (y - dy) - x; // = dx
    }

    function getCostOfSelling(uint128 dy) public view returns (uint128) {
        return x  - k / (y + dy); // = dx
    }

    // function getPriceImpactOfBuying(uint128 dy) public view returns (uint256) {}
    // function getPriceImpactOfSelling(uint128 dy) public view returns (uint256) {}
    // function getSlippageOfBuying(uint128 dy) public view returns (uint256) {
    //     return getPrice() - getCostOfBuying(dy) / dy;
    // }

    // function getSlippageOfSelling(uint128 dy) public view returns (uint256) {
    //     return getPrice() - getCostOfSelling(dy) / dy;
    // }

    function updateBalance(uint128 quantity, bool isIncrease, bool isToken1) internal {
        if (isToken1) {
            x = isIncrease ? x + quantity : x - quantity;
        } else {
            y = isIncrease ? y + quantity : y - quantity;
        }
        // TODO - you shouldn't recalculate k here every time, what if this causes it to change from rounding errors?
        // But if you only calculate during liquidityAdds and removals, won't that suddenly cause all error propogation to hit at once?
        // k = x * y;
        p = Q128x128.fpDiv(x, y);
        console.log("New p:", x, y, p);
    }

    function swap(uint128 quantity, bool isForward) payable public {
        if (isForward) {
            buy(quantity);
        } else {
            sell(quantity);
        }
    }

    function buy(uint128 dy) payable public {
        // Verify collection of payment
        require(dy < y + FUNDS_BUFFER2, "IF");
        require(transferToken1From(msg.sender, address(this), uint256(getCostOfBuying(dy)), msg.value), "NA");
        
        // Calculate fees, send output
        // Fees round up, not down. Their fault for placing tiny trades, that shouldn't be incentivized.
        uint128 keep = Q128x128.fpMul(dy, Q128x128.ONE - FEE); // TODO - SafeMath.sol
        transferToken2(payable(msg.sender), uint256(keep));

        // Store the rest as fees
        f2 += dy - keep;

        // Update state, emit event
        updateBalance(getCostOfBuying(dy), true, true);
        updateBalance(dy, false, false);

        emit Swap(msg.sender, dy, p, true);
    }
    
    function sell(uint128 dy) payable public {
        // Verify collection of payment
        uint128 dx = getCostOfSelling(dy);
        require(dx < x + FUNDS_BUFFER1, "IF");
        require(transferToken2From(msg.sender, address(this), uint256(dy), msg.value), "NA");
        
        // Calculate fees, send output
        uint128 keep = Q128x128.fpMul(dx, Q128x128.ONE - FEE); // TODO - SafeMath.sol
        transferToken1(payable(msg.sender), uint256(keep));

        // Store the rest as fees
        f1 += dx - keep;

        // Update state, emit event
        updateBalance(dx, false, true);
        updateBalance(dy, true, false);

        // TODO - Swap event needs more info (namely dx)
        emit Swap(msg.sender, dy, p, false);
    }

    event LiquidityAdd(address sender, uint128 n);
    
    function addLiquidity(uint128 quantity1, uint128 quantity2) payable public {
        console.log('info', x, y);
        console.log(quantity1, quantity2);
        console.log(k);
        console.log(p);
        console.log(Q128x128.fpMul(quantity2, p));
        require(quantity1 == Q128x128.fpMul(quantity2, p), "UQ");
        require(transferToken1From(msg.sender, address(this), uint256(quantity1), msg.value), "NA");
        require(transferToken2From(msg.sender, address(this), uint256(quantity2), msg.value), "NA");

        updateBalance(quantity1, true, true);
        updateBalance(quantity2, true, false);

        k = x * y; // See notes above

        // Calculate stake and mint LTokens
        uint256 s = Q128x128.fpDiv(quantity1 + Q128x128.fpMul(p, quantity2), Q128x128.fpMul(p, y) + x); // TODO - Safe math, should be separate from Q128x128. Also you're losing precision here by converting back to 128 before division.
        console.log("S: ", s, Q128x128.fpMul(s, quantity2), y - quantity2);
        uint128 t = uint128(lToken.totalSupply());
        console.log('testing');
        uint128 r = Q128x128.fpMul(Q128x128.fpMul(s, t), Q128x128.reciprocal(Q128x128.ONE - s)); // r = st/(1-s)
        console.log("R: ", r);
        lToken.mint(msg.sender, r);

        emit LiquidityAdd(msg.sender, r);
    }

    event LiquidityRemoval(address sender, uint256 n);
    function removeLiquidity(uint256 n) public {
        // Calculate stake
        uint256 s = Q128x128.fpDiv(uint128(n), uint128(lToken.totalSupply()));
        // Directly burn LTokens
        lToken.burn(msg.sender, n);

        // Any fees at this point?
        transferToken1(payable(msg.sender), uint256(Q128x128.fpMul(s, x)));
        transferToken2(payable(msg.sender), uint256(Q128x128.fpMul(s, y)));

        updateBalance(Q128x128.fpMul(s, x), false, true);
        updateBalance(Q128x128.fpMul(s, y), false, false);

        k = x * y; // See notes above

        emit LiquidityRemoval(msg.sender, n);
    }
}


