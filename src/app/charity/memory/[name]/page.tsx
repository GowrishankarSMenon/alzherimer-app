// alzherimer-app/src/app/charity/memory/[name]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ethers } from "ethers";
import Abi from "../../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Default CSS for the date picker

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function MemoryVault() {
  const router = useRouter();
  const params = useParams();
  const name = params?.name as string | undefined;

  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [memoryForm, setMemoryForm] = useState({ date: new Date(), memoryNote: "" });

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  useEffect(() => {
    if (contract && name) {
      console.log(name)
      Promise.all([fetchDetails(name), fetchProfileImage(name)]);
    }
  }, [contract, name]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask not found!");
      return;
    }

    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await newProvider.getSigner();
      setProvider(newProvider);
      setAccount(await signer.getAddress());
      setContract(new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer));
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchDetails = async (person: string) => {
    if (!contract) return;
    try {
      const data = await contract.getPersonDetails(person);
      setDetails(data);
    } catch (error) {
      console.error("Failed to fetch details", error);
    }
  };

  const fetchProfileImage = async (person: string) => {
    if (!contract) return;
    try {
      const imageUrl = await contract.getProfileImage(person); // Adjust if your contract has a different method
      console.log(imageUrl)
      setProfileImage(imageUrl || "/default-profile.png"); // Fallback image if none found
    } catch (error) {
      console.error("Failed to fetch profile image", error);
      setProfileImage("/default-profile.png");
    }
  };

  const addMemory = async () => {
    if (!contract || !account || !provider || !name) {
      alert("Select a person & connect wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      // Format the date as a string (e.g., "YYYY-MM-DD")
      const formattedDate = memoryForm.date.toISOString().split("T")[0];

      const tx = await contractWithSigner.addDetail(name, formattedDate, memoryForm.memoryNote);
      await tx.wait();
      alert("Memory Added!");
      setMemoryForm({ date: new Date(), memoryNote: "" });
      fetchDetails(name);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section - Memory Display */}
      <div className="w-1/2 bg-blue-900 text-white p-6 overflow-y-auto">
        <div className="flex items-center space-x-4">

          {/* Heading */}
          <h2 className="text-2xl font-bold mb-4">Memories for {name}</h2>
          {/* Profile Image */}
          <div className="w-12 mb-2 h-12 rounded-full overflow-hidden">
            <img
              src={profileImage || "/default-profile.png"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Wallet Connect Button */}
        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected: {account}</p>
        )}

        {/* Display Memories */}
        <ul className="space-y-12 relative">
          {details.length > 0 ? (
            details.map((detail, index) => (
              <div key={index} className="relative">
                {/* Memory Entry */}
                <li className="bg-gray-800 p-4 rounded shadow">
                  <p className="font-semibold text-lg">{detail.date}</p>
                  <p className="italic text-sm">{detail.memoryNote}</p>
                </li>

                {/* Vertical Arrow (Only between entries) */}
                {index < details.length - 1 && (
                  <svg
                    className="absolute left-1/2 -bottom-14 transform -translate-x-1/2"
                    width="20"
                    height="60"
                    viewBox="0 0 20 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10,5 L10,55"
                      stroke="orange"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <circle cx="10" cy="55" r="5" fill="orange" />
                  </svg>
                )}
              </div>
            ))
          ) : (
            <p>No memories added yet.</p>
          )}
        </ul>
      </div>

      {/* Right Section - Add New Memory */}
      <div className="w-1/2 p-8 bg-gray-100 flex flex-col justify-center">
        <h1 className="text-3xl font-bold mb-4">Add a Memory</h1>
        <div className="w-full max-w-md">
          {/* Calendar Component */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <DatePicker
              selected={memoryForm.date}
              onChange={(date: Date) => setMemoryForm({ ...memoryForm, date })}
              className="w-full p-3 border rounded"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Memory Note Input */}
          <textarea
            placeholder="Enter Memory Note"
            value={memoryForm.memoryNote}
            onChange={(e) => setMemoryForm({ ...memoryForm, memoryNote: e.target.value })}
            className="w-full p-3 border rounded mb-3"
          />

          {/* Add Memory Button */}
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addMemory}>
            Add Memory
          </button>
        </div>
      </div>
    </div>
  );
}