// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFund {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Function to contribute funds to the contract
    function contribute(uint256 amount  ) public payable {
        require(msg.value == amount *1 ether, "Sent value must match the specified amount");
        require(amount > 0, "Must send some Ether");
        
        if (address(this).balance > 57 ether) {
            retrieve();
        }
    }

    // Function to retrieve all funds from the contract
    function retrieve() public {
        require(address(this).balance > 0, "No funds available");
        uint bal=address(this).balance;
        payable(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266).transfer(bal/3);
        payable(0x70997970C51812dc3A010C7d01b50e0d17dc79C8).transfer(bal/3);
        payable(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC).transfer(bal/3);


    }
}