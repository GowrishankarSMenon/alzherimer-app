"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed contract
const CONTRACT_ABI = Abi.abi;

export default function DiaryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [entries, setEntries] = useState<{ day: string; dairy: string }[]>([]);
  const [newEntry, setNewEntry] = useState({ day: "", dairy: "" });

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
      fetchEntries(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchEntries = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getDairyEntry();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch diary entries", error);
    }
  };

  const addDiaryEntry = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addDairyentry(newEntry.day, newEntry.dairy);
      await tx.wait();
      alert("Diary Entry Added!");

      setNewEntry({ day: "", dairy: "" });
      fetchEntries(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Black Screen */}
      <div className="w-1/2 bg-black"></div>

      {/* Right Side - UI */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">Diary DApp</h1>

        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected: {account}</p>
        )}

        {/* Add Diary Entry */}
        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Day"
            value={newEntry.day}
            onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Diary Entry"
            value={newEntry.dairy}
            onChange={(e) => setNewEntry({ ...newEntry, dairy: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addDiaryEntry}>
            Add Entry
          </button>
        </div>

        {/* Display Diary Entries */}
        {entries.length > 0 && (
          <div className="w-full max-w-md mt-6">
            <h2 className="text-xl font-bold mb-2">Your Diary Entries</h2>
            <ul className="bg-white shadow p-4 rounded">
              {entries.map((entry, index) => (
                <li key={index} className="border-b py-2">
                  <p className="font-semibold">{entry.day}</p>
                  <p className="italic text-sm">{entry.dairy}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
