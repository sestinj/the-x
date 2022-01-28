// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import './Erc20Dex.sol';
import './EthToErc20Dex.sol';
import './Erc20ToEthDex.sol';
import '../governance/Dictatorship.sol';
import './ADex.sol';

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

    function createErc20Dex(address token1, address token2, uint256 quantity1, uint256 quantity2) public returns (address newDexAddress) {
        if (dexAddresses[token1][token2] != address(0x0)) {
            revert("AE"); // Already exists
        }
        if (token1 == token2) {
            revert("ST"); // Same Token
        }
        // How can we check here whether the addresses are existing tokens?
        // ADex newDex;
        // if (token1 == address(0x0)) {
        //     EthToErc20Dex newDex = new EthToErc20Dex(token2, quantity1, quantity2);
        // } else if (token2 == address(0x0)) {
        //     Erc20ToEthDex newDex = new Erc20ToEthDex(token1, quantity1, quantity2);
        // } else {
        //     Erc20Dex newDex = new Erc20Dex(token1, token2, quantity1, quantity2);
        // }
        // dexAddresses[token1][token2] = address(newDex);
        // dexAddressesBackward[token2][token1] = address(newDex);
        // exchangesForToken[token1].push(token2);
        // exchangesForTokenReverse[token2].push(token1);
        // exchangesFlat.push([token1, token2]);

        // emit NewPair(token1, token2, address(newDex));

        // return address(newDex);
        
        Erc20Dex newDex = new Erc20Dex(token1, token2, quantity1, quantity2);
        return address(this);
    }

    function listExchangesToBuy(address token2) public view returns (address[] memory) {
        return exchangesForTokenReverse[token2];
    }

    function listExchangesToSell(address token1) public view returns (address[] memory) {
        return exchangesForToken[token1];
    }
}