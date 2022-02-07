// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

abstract contract AFaucet {
    function transferToken(address payable reciever, uint256 quantity) virtual internal returns (bool sent);
    function getTokenBalance() virtual internal view returns (uint256 balance);

    uint256 public DRIP_SIZE = 1e17; // 0.1 ETH
    uint16 private DRIP_LIMIT = 100;

    mapping(address => uint16) private dripCounts;

    constructor() {}

    function dripOrDrown() public {
        if (dripCounts[msg.sender] >= DRIP_LIMIT) {
            revert("Dripped too hard");
        }
        if (DRIP_SIZE < getTokenBalance()) {
            bool sent = transferToken(payable(msg.sender), DRIP_SIZE);
            require(sent, "Failed to send Ether");
        } else {
            revert("Not enough balance");
        }
    }

    function getBalance() public view returns (uint256 balance) {
        return getTokenBalance();
    }
}

// // Could you start a faucet war?
// // Naive: This contract repeatedly withdraws from other faucets.
// // Problem: They can just blacklist. (Which you should do)
// // Smarter: Treat this as a factory contract to deploy an army of bots, so they aren't under same address
// // Problem: They could still keep track, with much effort, of whether this contract created those contracts.
// // More Smarter: Make a tree of contracts, each self-replicating
// // Problem: They could obviously still trace this, just with difficulty.
// // Unstoppable: Make many roots, as in you have to have a spawner which isn't on-chain

// // Another way to protect would be to force a verification, or a second transaction step.
// // If they were keeping a simple array here of how to interact with it, then this would make it harder. Definitely can work around though.

// contract Probe {

//     uint16 private REPLICATION_RATE;

//     address private mothership;

//     address[] private targets;
//     string[] private abis;
//     // How do we store the parameters when we don't know their types? Bytes should cover all cases right?
//     bytes[] private parameters;

//     address[] private children;
//     uint16 private depth;

//     constructor(address mothership_, address[] memory targets_, string[] memory abis_, bytes[] memory parameters_, uint16 depth_) {
//         mothership = mothership_;
//         targets = targets_;
//         abis = abis_;
//         parameters = parameters_;
//         depth = depth_;
//     }

//     function replicate() private {
//         for (uint16 i; i < REPLICATION_RATE; i++) {
//             Probe newProbe = new Probe(mothership, targets, abis, parameters, depth + 1);
//             children.push(address(newProbe));
//         }
//     }

//     // This has to be called from the main contract if it is to be done on a cron-job
//     function plunder() external {
//         for (uint16 i; i < targets.length; i++) {
//             pirate(i);
//         }
//     }
    
//     function pirate(uint256 index) private {
//         // targets[index].call{value: 0}(abi.encodeWithSignature("foo(string,uint256)", "call foo", 123));
//         targets[index].call{value: 0}(abi.encodeWithSignature(abis[index], parameters[index]));
//     }
// }

// contract Faucet {

//     uint256 public DRIP_SIZE = 100_000_000; // 0.1 ETH
//     uint16 private DRIP_LIMIT = 100;

//     mapping(address => uint16) private dripCounts;

//     constructor() {}

//     function dripTooHard() public {
//         if (dripCounts[msg.sender] >= DRIP_LIMIT) {
//             revert("Address exceeded drip limit");
//         }
//         if (DRIP_SIZE < address(this).balance) {
//             (bool sent,) = msg.sender.call{value: DRIP_SIZE}("");
//             require(sent, "Failed to send Ether");
//         } else {
//             revert("Not enough balance");
//         }
//     }
// }