// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './FixedPriceAuction.sol';
import 'hardhat/console.sol';
import './ManagedToken.sol';

contract AuctionFactory {

    address[] public deployedTokens;

    constructor() {}

    event NewAuction (address tokenAddress, address owner, uint256 price, address auctionAddress, uint256 personalStake);
    event NewManagedToken (address tokenAddress, string symbol, string name, address manager);
    /**
    @dev Creates new ERC-20 token contract
    @param name Name of the new token. Ex) Dogecoin
    @param symbol Token ticker symbol. Ex) DOGE
    **/
    function createNewAuction(string calldata name, string calldata symbol, uint256 price, address owner, uint256 personalStake) public returns (address) {

        ManagedToken token = new ManagedToken(name, symbol, address(this));
        FixedPriceAuction auction = new FixedPriceAuction(name, symbol, owner, price, personalStake, address(token));
        token.setManager(address(auction));

        deployedTokens.push(address(auction));
        
        emit NewAuction(address(token), owner, price, address(auction), personalStake);
        emit NewManagedToken(address(token), symbol, name, address(auction));
        
        return address(auction);
    }
}