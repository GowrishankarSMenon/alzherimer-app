"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
const CONTRACT_ABI = Abi.abi;

export default function MedicalRecords() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState({ 
    diagnosis: "", 
    treatment: "", 
    prescribedMedication: "", 
    date: "", 
    doctorName: "" 
  });

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

      await fetchRecords(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchRecords = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getMedicalRecords();
      setRecords(data);
    } catch (error) {
      console.error("Failed to fetch medical records", error);
    }
  };

  const addRecord = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addMedicalRecord(
        form.diagnosis,
        form.treatment,
        form.prescribedMedication,
        Math.floor(new Date(form.date).getTime() / 1000), // Convert to timestamp
        form.doctorName
      );

      await tx.wait();
      alert("Medical Record Added!");

      setForm({ diagnosis: "", treatment: "", prescribedMedication: "", date: "", doctorName: "" });
      fetchRecords(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Medical Records DApp</h1>

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
          placeholder="Diagnosis"
          value={form.diagnosis}
          onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Treatment"
          value={form.treatment}
          onChange={(e) => setForm({ ...form, treatment: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Prescribed Medication"
          value={form.prescribedMedication}
          onChange={(e) => setForm({ ...form, prescribedMedication: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="date"
          placeholder="Date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Doctor's Name"
          value={form.doctorName}
          onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
          className="w-full p-2 border rounded mb-2"
        />

        <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addRecord}>
          Add Medical Record
        </button>
      </div>

      <div className="w-full max-w-md mt-6">
        <h2 className="text-xl font-bold mb-2">Stored Medical Records</h2>
        <ul className="bg-white shadow p-4 rounded">
          {records.map((record, index) => (
            <li key={index} className="border-b py-2">
              <p className="font-semibold">Diagnosis: {record.diagnosis}</p>
              <p className="text-gray-600">Treatment: {record.treatment}</p>
              <p className="text-gray-600">Medication: {record.prescribedMedication}</p>
              <p className="text-gray-600">Date: {new Date(Number(record.date) * 1000).toLocaleDateString()}</p>
              <p className="text-gray-600">Doctor: {record.doctorName}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
