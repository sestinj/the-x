// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

struct Ask {
    uint256 price;
    uint256 quantity;
    address sender;
    uint256 deliNum;
    uint256 quantityRemaining;
    uint256 avgPrice;
}