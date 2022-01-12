// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Erc20Dex.sol';
import '../governance/Dictatorship.sol';

// This contract is where global pools of all token types will be stored, so liquidity is shared across exchanges.
// All governance logic will also be dealt with here (or in an inherited class).
contract CentralDex is Dictatorship {

    // [token1][token2] = DEX address
    mapping(address => mapping (address => address)) public dexAddresses;
    // [token2][token1] = DEX address
    mapping(address => mapping (address => address)) dexAddressesBackward;

    // token1 address => token2 addresses
    mapping(address => address[]) exchangesForToken;
    // token2 address => token1 addresses
    mapping(address => address[]) exchangesForTokenReverse;

    mapping(address => uint) Erc20Balances;

    // [[token1, token2], ...]
    address[][] exchangesFlat;

    constructor() Dictatorship() {}

    event NewPair(address token1, address token2, address dexAddress);

    function createErc20Dex(address token1, address token2) public returns (address newDexAddress) {
        require(msg.sender == dictator, "NP"); // No permission
        if (dexAddresses[token1][token2] != address(0x0)) {
            revert("AE"); // Already exists
        }
        // How can we check here whether the addresses are existing tokens?

        Erc20Dex newDex = new Erc20Dex(token1, token2);
        dexAddresses[token1][token2] = address(newDex);
        dexAddressesBackward[token2][token1] = address(newDex);
        exchangesForToken[token1].push(token2);
        exchangesForTokenReverse[token2].push(token1);
        exchangesFlat.push([token1, token2]);

        emit NewPair(token1, token2, address(newDex));

        return address(newDex);
    }

    function listExchangesToBuy(address token2) public view returns (address[] memory) {
        return exchangesForTokenReverse[token2];
    }

    function listExchangesToSell(address token1) public view returns (address[] memory) {
        return exchangesForToken[token1];
    }

    // The Graph couldn't compile this function because of type address[][]
    // function listExchanges() public view returns (address[][] memory) {
    //     return exchangesFlat;
    // }
}