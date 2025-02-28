"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed contract
const CONTRACT_ABI = Abi.abi;

export default function BioData() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", relation: "", phone: "", memoryNote: "" });

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

      await fetchContacts(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchContacts = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getContacts();
      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch contacts", error);
    }
  };

  const addContact = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addContact(
        form.name,
        form.relation,
        form.phone,
        form.memoryNote
      );

      await tx.wait();
      alert("Contact Added!");

      setForm({ name: "", relation: "", phone: "", memoryNote: "" });
      fetchContacts(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Black Screen */}

<div className="w-1/2 bg-black"> 
  
      </div>
      {/* Right Side - UI */}
      <div className="w-1/2 p-8 flex flex-col items-center justify-center bg-gray-100">
        <h1 className="text-3xl font-bold mb-4">BioData DApp</h1>

        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected: {account}</p>
        )}

        <div className="w-full max-w-md">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Relation"
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Memory Note"
            value={form.memoryNote}
            onChange={(e) => setForm({ ...form, memoryNote: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />

          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addContact}>
            Add Contact
          </button>
        </div>

        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Stored Contacts</h2>
          <ul className="bg-white shadow p-4 rounded">
            {contacts.map((contact, index) => (
              <li key={index} className="border-b py-2">
                <p className="font-semibold">{contact.name} ({contact.relation})</p>
                <p className="text-gray-600">{contact.phone}</p>
                <p className="italic text-sm">{contact.memoryNote}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
