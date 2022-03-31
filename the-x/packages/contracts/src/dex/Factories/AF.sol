// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

abstract contract AF {
    address public registry;

    constructor(address registry_) {
        registry = registry_;
    }
    
    function _createDex() internal returns (address) {}

    function createDex() public returns (address) {
        require(msg.sender == registry, "NP");
        return _createDex();
    }
}