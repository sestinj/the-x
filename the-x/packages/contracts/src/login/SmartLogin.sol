// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

contract SmartLogin {

    struct UserInfo {
        address address_;
        string passwordHash;
        string encryptedSecretKey;
        // address[] guardians;
    }

    mapping(string => UserInfo) public userInfoMap;

    constructor() {}

    function addNewAccount(address address_, string calldata email, string calldata passwordHash, string calldata encryptedSecretKey) public returns (string memory) {
        userInfoMap[email] = UserInfo(address_, passwordHash, encryptedSecretKey);
        return encryptedSecretKey;
    }

    function login(string calldata email, string memory passwordHash) public returns (string memory) {
        UserInfo memory userInfo = userInfoMap[email];
        // require(bytes(passwordHash) == bytes(userInfo.passwordHash), "Passwords do not match.");
        return userInfo.encryptedSecretKey;
    }

    function loginOrSignup(address address_, string calldata email, string calldata passwordHash, string calldata encryptedSecretKey) public returns (string memory) {
        // if (bytes(userInfoMap[email]).length > 0) { // Consider using bytes instead? Might you even encrypt their email?
        //     return login(email, passwordHash);
        // } else {
        //     return addNewAccount(address_, email, passwordHash, encryptedSecretKey);
        // }
    }
}
