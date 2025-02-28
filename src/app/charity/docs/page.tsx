"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with deployed contract
const CONTRACT_ABI = Abi.abi;

export default function SecureStorage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [docForm, setDocForm] = useState({ name: "", description: "" });
  const [accForm, setAccForm] = useState({ accountNumber: "", password: "" });

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

      await fetchData(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchData = async (contractInstance: ethers.Contract) => {
    try {
      const docData = await contractInstance.getDocuments();
      setDocuments(docData);

      const accData = await contractInstance.getaccounts();
      setAccounts(accData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const addDocument = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addDocument(docForm.name, docForm.description);
      await tx.wait();
      alert("Document Added!");

      setDocForm({ name: "", description: "" });
      fetchData(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  const addAccount = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addAccount(accForm.accountNumber, accForm.password);
      await tx.wait();
      alert("Account Added!");

      setAccForm({ accountNumber: "", password: "" });
      fetchData(contract);
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
        <h1 className="text-3xl font-bold mb-4">SecureStorage DApp</h1>

        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected: {account}</p>
        )}

        {/* Add Document */}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Add Document</h2>
          <input
            type="text"
            placeholder="Name"
            value={docForm.name}
            onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Description"
            value={docForm.description}
            onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addDocument}>
            Add Document
          </button>
        </div>

        {/* Add Account */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Add Account</h2>
          <input
            type="text"
            placeholder="Account Number"
            value={accForm.accountNumber}
            onChange={(e) => setAccForm({ ...accForm, accountNumber: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={accForm.password}
            onChange={(e) => setAccForm({ ...accForm, password: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addAccount}>
            Add Account
          </button>
        </div>

        {/* Stored Documents */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Stored Documents</h2>
          <ul className="bg-white shadow p-4 rounded">
            {documents.map((doc, index) => (
              <li key={index} className="border-b py-2">
                <p className="font-semibold">{doc.name}</p>
                <p className="text-gray-600">{doc.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Stored Accounts */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Stored Accounts</h2>
          <ul className="bg-white shadow p-4 rounded">
            {accounts.map((acc, index) => (
              <li key={index} className="border-b py-2">
                <p className="font-semibold">Account: {acc.accountNumber}</p>
                <p className="text-gray-600">Password: {acc.password}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
