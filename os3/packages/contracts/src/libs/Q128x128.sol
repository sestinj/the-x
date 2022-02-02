// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

library Q128x128 {
    uint256 constant ONE = 2**128;
    uint256 constant MAX_INT = 2**256 - 1;

    function upgrade(uint128 a) internal pure returns (uint256) {
        return uint256(a) * ONE;
    }

    function fpDiv(uint128 a, uint128 b) internal pure returns (uint256) {
        return upgrade(a) / uint256(b);
    }

    function fpMul(uint256 a, uint128 b) internal pure returns (uint128) {
        return uint128(a * b / ONE);
    }

    function fpMul(uint128 a, uint256 b) internal pure returns (uint128) {
        return fpMul(b, a);
    }

    function integer(uint256 a) internal pure returns (uint256) {
        return (a / ONE) * ONE;
    }

    function decompose(uint256 a) internal pure returns (uint256 ia, uint256 fa) {
        ia = integer(a);
        fa = a - ia;
    }

    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        (uint256 ia, uint256 fa) = decompose(a);
        (uint256 ib, uint256 fb) = decompose(b);

        // No need to check for overflow here, right? ONE*ONE is still < MAX_INT
        uint256 iaib = (ia / ONE) * (ib / ONE);
        uint256 iafb = (ia / ONE) * fb;
        uint256 faib = fa * (ib / ONE);
        uint256 fafb = fa * fb;

        uint256 result = iaib * ONE * ONE;
        result += iafb * ONE;
        result += faib * ONE;
        result += fafb;
        return result;
    }

    function reciprocal(uint256 a) internal pure returns (uint256) {
        return MAX_INT / a;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return mul(a, reciprocal(b));
    }

    
}