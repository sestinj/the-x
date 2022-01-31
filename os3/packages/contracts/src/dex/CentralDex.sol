// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import '../governance/Dictatorship.sol';
import './Factories/FErc20Dex.sol';
import './ADex.sol';
import './Factories/FErc20Dex.sol';
import './Factories/FEthToErc20Dex.sol';
import './Factories/FErc20ToEthDex.sol';

contract CentralDex is Dictatorship {
    // [token1][token2] = DEX address
    mapping(address => mapping (address => address)) public dexAddresses;
    // [token2][token1] = DEX address
    mapping(address => mapping (address => address)) dexAddressesBackward;

    // token1 address => token2 addresses
    mapping(address => address[]) exchangesForToken;
    // token2 address => token1 addresses
    mapping(address => address[]) exchangesForTokenReverse;

    // [[token1, token2], ...]
    address[][] exchangesFlat;

    constructor() Dictatorship() {}

    event NewPair(address token1, address token2, address dexAddress);

    function createErc20Dex(address token1, address token2, uint256 quantity1, uint256 quantity2) public payable returns (address newDexAddress) {
        console.log("CCC");
        if (dexAddresses[token1][token2] != address(0x0)) {
            revert("AE"); // Already exists
        }
        if (token1 == token2) {
            revert("ST"); // Same Token
        }
        console.log("A");
        // How can we check here whether the addresses are existing tokens?
        address dexAddress;
        if (token1 == address(0x0)) {
            dexAddress = FEthToErc20Dex.createDex(token2, quantity1, quantity2, msg.sender);
            require(msg.value == quantity1, "UQ");
            (bool sent, bytes memory data) = payable(dexAddress).call{value: quantity1}("");
            require(sent, "TF");
            require(IERC20(token2).transferFrom(msg.sender, dexAddress, quantity2), "NA");
        } else if (token2 == address(0x0)) {
            dexAddress = FErc20ToEthDex.createDex(token1, quantity1, quantity2, msg.sender);
            require(IERC20(token1).transferFrom(msg.sender, dexAddress, quantity1), "NA");
            require(msg.value == quantity2, "UQ");
            (bool sent, bytes memory data) = payable(dexAddress).call{value: quantity2}("");
            require(sent, "TF");
            
        } else {
            dexAddress = FErc20Dex.createDex(token1, token2, quantity1, quantity2, msg.sender);
            require(IERC20(token1).transferFrom(msg.sender, dexAddress, quantity1), "NA");
            require(IERC20(token2).transferFrom(msg.sender, dexAddress, quantity2), "NA");
        }

        dexAddresses[token1][token2] = dexAddress;
        dexAddressesBackward[token2][token1] = dexAddress;
        exchangesForToken[token1].push(token2);
        exchangesForTokenReverse[token2].push(token1);
        exchangesFlat.push([token1, token2]);

        console.log(token1, token2, dexAddress);
        emit NewPair(token1, token2, dexAddress);

        return dexAddress;
        
    }

    function listExchangesToBuy(address token2) public view returns (address[] memory) {
        return exchangesForTokenReverse[token2];
    }

    function listExchangesToSell(address token1) public view returns (address[] memory) {
        return exchangesForToken[token1];
    }
}