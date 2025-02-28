"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import Chat from "@/components/Chat";
import { X, MessageSquare, Eye, XCircle } from "lucide-react"; // Additional icons

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
  const [showChat, setShowChat] = useState(false);
  const [showDocPopup, setShowDocPopup] = useState(false);
  const [showAccPopup, setShowAccPopup] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum !== undefined) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
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

  // Toggle functions
  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const openDocPopup = (doc: any) => {
    setSelectedItem(doc);
    setShowDocPopup(true);
  };

  const closeDocPopup = () => {
    setShowDocPopup(false);
    setTimeout(() => setSelectedItem(null), 300); // Clear after animation completes
  };

  const openAccPopup = (acc: any) => {
    setSelectedItem(acc);
    setShowAccPopup(true);
  };

  const closeAccPopup = () => {
    setShowAccPopup(false);
    setTimeout(() => setSelectedItem(null), 300); // Clear after animation completes
  };

  return (
    <div className="flex h-screen">
      {/* AI Chat Panel */}
      <div 
        className={`h-full bg-black transition-all duration-300 ease-in-out ${
          showChat ? "w-1/2" : "w-0 overflow-hidden"
        }`}
      >
        {showChat && <Chat />}
      </div>

      {/* Main Content - Dynamically adjusts width */}
      <div className={`transition-all duration-300 p-8 flex flex-col items-center justify-center bg-gray-100 ${
        showChat ? "w-1/2" : "w-full"
      }`}>
        {/* Toggle Button - Inside the main content */}
        <div className="self-start mt-5">
          <button 
            onClick={toggleChat}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
            aria-label={showChat ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {showChat ? <X size={24} /> : <MessageSquare size={24} />}
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-4">Secure Storage</h1>

        {!account ? (
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
            Connect MetaMask
          </button>
        ) : (
          <p className="mb-4">Connected to account: {account}</p>
        )}

        {/* Add Document */}
        <div className="w-full max-w-md">
          <h2 className="text-xl font-bold mb-2">Add Note</h2>
          <input
            type="text"
            placeholder="Name"
            value={docForm.name}
            onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Description (eg i kept my wallet in the sofa)"
            value={docForm.description}
            onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addDocument}>
            Add Note
          </button>
        </div>

        {/* Add Account */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Add Credentials</h2>
          <input
            type="text"
            placeholder="Key(Account Number)"
            value={accForm.accountNumber}
            onChange={(e) => setAccForm({ ...accForm, accountNumber: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="password"
            placeholder="Value (password)"
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
          <h2 className="text-xl font-bold mb-2">Stored Notes</h2>
          <ul className="bg-white shadow p-4 rounded">
            {documents.map((doc, index) => (
              <li key={index} className="border-b py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-gray-600 truncate max-w-xs">{doc.description.substring(0, 50)}...</p>
                </div>
                <button 
                  onClick={() => openDocPopup(doc)} 
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                >
                  <Eye size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Stored Accounts */}
        <div className="w-full max-w-md mt-6">
          <h2 className="text-xl font-bold mb-2">Stored Credentials</h2>
          <ul className="bg-white shadow p-4 rounded">
            {accounts.map((acc, index) => (
              <li key={index} className="border-b py-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Account: {acc.accountNumber}</p>
                  <p className="text-gray-600">Password: ••••••••</p>
                </div>
                <button 
                  onClick={() => openAccPopup(acc)} 
                  className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                >
                  <Eye size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Note Popup */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        showDocPopup ? "opacity-100 z-50" : "opacity-0 pointer-events-none"
      }`}>
        <div className={`bg-white rounded-lg p-6 max-w-md w-full transition-transform duration-300 ${
          showDocPopup ? "scale-100" : "scale-95"
        }`}>
          {selectedItem && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{selectedItem.name}</h2>
                <button 
                  onClick={closeDocPopup}
                  className="text-gray-500 hover:text-red-500"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Description:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedItem.description}</p>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={closeDocPopup}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Account Popup */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300 ${
        showAccPopup ? "opacity-100 z-50" : "opacity-0 pointer-events-none"
      }`}>
        <div className={`bg-white rounded-lg p-6 max-w-md w-full transition-transform duration-300 ${
          showAccPopup ? "scale-100" : "scale-95"
        }`}>
          {selectedItem && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Account Details</h2>
                <button 
                  onClick={closeAccPopup}
                  className="text-gray-500 hover:text-red-500"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="border-t pt-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-1">Account Number:</h3>
                  <p className="text-gray-700 bg-gray-100 p-2 rounded">{selectedItem.accountNumber}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Password:</h3>
                  <p className="text-gray-700 bg-gray-100 p-2 rounded font-mono">{selectedItem.password}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button 
                  onClick={closeAccPopup}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}