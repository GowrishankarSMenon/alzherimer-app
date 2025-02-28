"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

// Ensure the ABI contains the addMedicalRecord function
console.log(Abi.abi);

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your contract address
const CONTRACT_ABI = Abi.abi;

export default function MedicalRecords() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  interface MedicalRecord {
    diagnosis: string;
    treatment: string;
    prescribedMedication: string;
    date: number;
    doctorName: string;
  }

  const [records, setRecords] = useState<MedicalRecord[]>([]);
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
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-sky-800 mb-2">🏥 Medical Records</h1>
        <p className="text-slate-600 text-lg">Secure Patient Health History</p>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        {!account ? (
          <div className="text-center">
            <button
              className="bg-sky-600 hover:bg-sky-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-md"
              onClick={connectWallet}
            >
              Connect MetaMask to Continue
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Add New Medical Record</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    Diagnosis
                  </label>
                  <input
                    type="text"
                    value={form.diagnosis}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter diagnosis..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    Treatment
                  </label>
                  <input
                    type="text"
                    value={form.treatment}
                    onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter treatment..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    Medication
                  </label>
                  <input
                    type="text"
                    value={form.prescribedMedication}
                    onChange={(e) => setForm({ ...form, prescribedMedication: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter prescribed medications..."
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">
                    Doctor's Name
                  </label>
                  <input
                    type="text"
                    value={form.doctorName}
                    onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    placeholder="Enter doctor's name..."
                  />
                </div>

                <button
                  onClick={addRecord}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-lg font-medium text-lg transition-colors mt-4"
                >
                  Save Medical Record
                </button>
              </div>
            </div>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Medical History</h2>
              
              <div className="space-y-8">
                {records.map((record, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 w-full">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-sky-800">{record.diagnosis}</h3>
                        <p className="text-slate-600"><span className="font-medium">Treatment:</span> {record.treatment}</p>
                        <p className="text-slate-600"><span className="font-medium">Medication:</span> {record.prescribedMedication}</p>
                        <p className="text-slate-600"><span className="font-medium">Date:</span> {new Date(Number(record.date) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                        <p className="text-slate-600"><span className="font-medium">Doctor:</span> {record.doctorName}</p>
                      </div>
                    </div>
                    {index !== records.length - 1 && (
                      <div className="flex justify-center my-2">
                        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {account && (
        <div className="text-center mt-8 text-slate-500">
          Connected account: <span className="font-mono text-slate-700">{account}</span>
        </div>
      )}
    </div>
  );
}
