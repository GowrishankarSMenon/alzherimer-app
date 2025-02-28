"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function MemoryVault() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [persons, setPersons] = useState<string[]>([]);
  const [details, setDetails] = useState<{ [key: string]: any[] }>({});
  const [personName, setPersonName] = useState("");
  const [memoryForm, setMemoryForm] = useState({ date: "", memoryNote: "" });
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);

      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(newContract);
      await fetchPersons(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchPersons = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getPersons();
      setPersons(data);
      const detailsData: { [key: string]: any[] } = {};
      for (const name of data) {
        detailsData[name] = await contractInstance.getPersonDetails(name);
      }
      setDetails(detailsData);
    } catch (error) {
      console.error("Failed to fetch persons", error);
    }
  };

  const addPerson = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addPerson(personName);
      await tx.wait();
      alert("Person Added!");
      setPersonName("");
      fetchPersons(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  const addMemory = async () => {
    if (!contract || !account || !provider || !selectedPerson) {
      alert("Select a person & connect wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addDetail(
        selectedPerson,
        memoryForm.date,
        memoryForm.memoryNote
      );

      await tx.wait();
      alert("Memory Added!");
      setMemoryForm({ date: "", memoryNote: "" });
      fetchPersons(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - List of Persons and their Memories */}
      <div className="w-1/2 bg-gray-900 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Stored Persons</h2>
        <ul>
          {persons.map((name, index) => (
            <li key={index} className="mb-4">
              <p className="text-lg font-semibold">{name}</p>
              <ul className="ml-4 text-sm">
                {details[name]?.map((detail, i) => (
                  <li key={i} className="border-b py-1">
                    <p className="font-semibold">{detail.date}</p>
                    <p className="italic">{detail.memoryNote}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      {/* Right Side - Adding Options */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">MemoryVault DApp</h1>

        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected: {account}</p>
        )}

        {/* Add Person */}
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Enter Person's Name"
            value={personName}
            onChange={(e) => setPersonName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addPerson}>
            Add Person
          </button>
        </div>

        {/* Add Memory */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Add Memory</h2>
          <select
            className="w-full p-2 border rounded mb-2"
            onChange={(e) => setSelectedPerson(e.target.value)}
          >
            <option value="">Select a Person</option>
            {persons.map((name, index) => (
              <option key={index} value={name}>{name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Date"
            value={memoryForm.date}
            onChange={(e) => setMemoryForm({ ...memoryForm, date: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Memory Note"
            value={memoryForm.memoryNote}
            onChange={(e) => setMemoryForm({ ...memoryForm, memoryNote: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-purple-600 text-white px-4 py-2 rounded w-full" onClick={addMemory}>
            Add Memory
          </button>
        </div>
      </div>
    </div>
  );
}
