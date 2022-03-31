// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Token.sol';

contract TokenFactory {

    address[] public deployedTokens;

    constructor() {}

    event TokenDeployed (address tokenAddress);

    /**
    @dev Creates new ERC-20 token contract
    @param name Name of the new token. Ex) Dogecoin
    @param symbol Token ticker symbol. Ex) DOGE
    **/
    function createNewToken(string calldata name, string calldata symbol, uint256 initialVolume) public {
        Token token = new Token(name, symbol, msg.sender);
        deployedTokens.push(address(token));
        emit TokenDeployed(address(token));

        // token._mint(msg.sender, initialVolume);
    }
}