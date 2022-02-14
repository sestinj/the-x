// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './FixedPriceAuction.sol';

contract AuctionFactory {

    address[] public deployedTokens;

    constructor() {}

    event NewAuction (address tokenAddress, address owner, uint256 price, address auctionAddress, uint256 personalStake);

    /**
    @dev Creates new ERC-20 token contract
    @param name Name of the new token. Ex) Dogecoin
    @param symbol Token ticker symbol. Ex) DOGE
    **/
    function createNewAuction(string calldata name, string calldata symbol, uint256 price, address owner, uint256 personalStake) public returns (address) {
        FixedPriceAuction auction = new FixedPriceAuction(name, symbol, owner, price, personalStake);
        deployedTokens.push(address(auction));
        emit NewAuction(address(auction), owner, price, address(auction), personalStake);
        return address(auction);
    }
}