// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

abstract contract AAuction {
    address owner;

    uint256 public price;

    bool public open;

    uint256 public supply;

    struct Purchase {
        address purchaser;
        uint256 amount;
    }

    Purchase[] public purchases;

    /**
    @dev As of now the ICO is opened immediately upon construction, but there may be a
    use case where you want to initialize the ICO and be able to alter the supply/price
    before finalizing and opening.
     */
    function _setOpen() internal {
        open = true;
    }

    function setOpen() virtual internal {}

    /**
    * @dev Transfers purchased tokens to purchasers, and purchasing funds to token owner.
    **/
    function _setClosed() internal {
        require(msg.sender == owner, "You do not have permission to close the ICO.");
        open = false;
    }

    function setClosed() virtual public {}

    constructor(string memory name_, string memory symbol_, address owner_, uint256 icoPrice_, uint256 personalStake_) {
        // owner = owner_;
        // icoPrice = icoPrice_;
        // personalStake = personalStake_;
        // openICO();
    }
}