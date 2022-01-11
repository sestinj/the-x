// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './ICO.sol';

contract IcoFactory {

    address[] public deployedTokens;

    constructor() {}

    event NewIco (address tokenAddress, address owner, uint256 icoPrice);

    /**
    @dev Creates new ERC-20 token contract
    @param name Name of the new token. Ex) Dogecoin
    @param symbol Token ticker symbol. Ex) DOGE
    **/
    function createNewIco(string calldata name, string calldata symbol, uint256 icoPrice, address owner, uint256 personalStake) public returns (address) {
        ICO ico = new ICO(name, symbol, owner, icoPrice, personalStake);
        deployedTokens.push(address(ico));
        emit NewIco(address(ico), owner, icoPrice);
        return address(ico);
    }
}