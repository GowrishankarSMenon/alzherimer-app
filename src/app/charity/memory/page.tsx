// alzherimer-app/src/app/charity/memory/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function MemoryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [persons, setPersons] = useState<string[]>([]);
  const [personName, setPersonName] = useState("");

  const router = useRouter();

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
      const signer = await provider!.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(newContract);

      fetchPersons(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchPersons = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getPersons();
      setPersons(data);
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
      const signer = await provider!.getSigner();
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

  return (
    <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">MemoryVault DApp</h1>

      {/* Connect Wallet Button */}
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

      {/* List Persons */}
      <div className="w-full max-w-md mt-6">
        <h2 className="text-xl font-bold mb-2">Stored Persons</h2>
        <ul className="bg-white shadow p-4 rounded">
          {persons.map((name, index) => (
            <li
              key={index}
              className="border-b py-2 cursor-pointer hover:bg-gray-200"
              onClick={() => router.push(`/charity/memory/${name}`)}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
