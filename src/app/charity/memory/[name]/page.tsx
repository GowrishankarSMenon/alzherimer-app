"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ethers } from "ethers";
import Abi from "../../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function MemoryVault() {
  const router = useRouter();
  const params = useParams();
  const name=params.name||null;
  
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [memoryForm, setMemoryForm] = useState({ date: "", memoryNote: "" });
  const [personName, setPersonName] = useState("");

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  useEffect(() => {
    if (!contract){ 
        console.log("no name") 
        return;}
    if (typeof name === "string") {
      fetchDetails(name);
    }
  }, [contract, name]);

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
      router.push(`/memory/${personName}`);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
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

      const tx = await contractWithSigner.addDetail(name, memoryForm.date, memoryForm.memoryNote);
      await tx.wait();
      alert("Memory Added!");
      setMemoryForm({ date: "", memoryNote: "" });
      fetchDetails(name);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar - Person List */}
      <div className="w-1/3 bg-gray-900 text-white p-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
          {!account ? "Connect MetaMask" : `Connected: ${account}`}
        </button>
      </div>

      {/* Right Section - Memory Details */}
      <div className="w-2/3 p-8 bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">MemoryVault</h1>

        {/* Add New Person */}
     

        {/* Add New Memory */}
        <div className="w-full max-w-md mt-6">
          <input
            type="text"
            placeholder="Enter Memory Date"
            value={memoryForm.date}
            onChange={(e) => setMemoryForm({ ...memoryForm, date: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Enter Memory Note"
            value={memoryForm.memoryNote}
            onChange={(e) => setMemoryForm({ ...memoryForm, memoryNote: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addMemory}>
            Add Memory
          </button>
        </div>

        {/* Timeline - Show Memories */}
        {name && (
          <div className="w-full max-w-md mt-6">
            <h2 className="text-xl font-bold mb-2">Memories for {name}</h2>
            <ul className="bg-white shadow p-4 rounded">
              {details.map((detail, index) => (
                <li key={index} className="border-b py-2">
                  <p className="font-semibold">{detail.date}</p>
                  <p className="italic text-sm">{detail.memoryNote}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
