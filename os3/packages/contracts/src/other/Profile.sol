// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
The Profile contract is a contract that could be attached to everyone's address.
I think it makes sense for there to be a place where persoal information can be seen
so that addresses become more personal. The profile would probably be linked through a registry contract.
Though they would all inherit from this abstract Profile, people should be able to make their own profiles
that have custom functions so they can be interacted with in new ways. And the you could run a service to help
people add such functions or extensions to their profile, a marketplace of extensions.
 */
abstract contract Profile {
    
}