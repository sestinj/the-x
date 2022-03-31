// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

struct Registry {
    // [token1][token2] = DEX address
    mapping(address => mapping (address => address)) dexAddresses;
    // [token2][token1] = DEX address
    mapping(address => mapping (address => address)) dexAddressesBackward;

    // token1 address => token2 addresses
    mapping(address => address[]) exchangesForToken;
    // token2 address => token1 addresses
    mapping(address => address[]) exchangesForTokenReverse;

    // [[token1, token2], ...]
    address[][] exchangesFlat;
}