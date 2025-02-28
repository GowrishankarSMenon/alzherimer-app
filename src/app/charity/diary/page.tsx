"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import Chat from "@/components/Chat";
import { X, MessageSquare } from "lucide-react";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;
const ENTRIES_PER_PAGE = 5;

export default function DiaryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [entries, setEntries] = useState<{ day: string; dairy: string }[]>([]);
  const [newEntry, setNewEntry] = useState({ day: "", dairy: "" });
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastEntry = currentPage * ENTRIES_PER_PAGE;
  const indexOfFirstEntry = indexOfLastEntry - ENTRIES_PER_PAGE;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);

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
      {/* AI Chat Panel */}
      <div 
        className={`h-full bg-black transition-all duration-300 ease-in-out ${
          isAIOpen ? "w-1/2" : "w-0 overflow-hidden"
        }`}
      >
        {isAIOpen && <Chat />}
      </div>

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isAIOpen ? "w-1/2" : "w-full"
        }`}
      >
        {/* Toggle Button */}
        <div className="p-4">
          <button 
            onClick={() => setIsAIOpen(!isAIOpen)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
            aria-label={isAIOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {isAIOpen ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center bg-gray-100">
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

          {/* Display Diary Entries with Pagination */}
          {entries.length > 0 && (
            <div className="w-full max-w-md mt-6">
              <h2 className="text-xl font-bold mb-2">Your Diary Entries</h2>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {currentEntries.map((entry, index) => (
                    <li key={index} className="p-4 hover:bg-gray-50 transition-colors">
                      <p className="font-semibold text-gray-800">{entry.day}</p>
                      <p className="mt-1 text-gray-600">{entry.dairy}</p>
                    </li>
                  ))}
                </ul>
                
                {/* Pagination Controls */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}