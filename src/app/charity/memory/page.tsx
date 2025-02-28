"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import PersonList from "@/components/PersonList";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function MemoryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [persons, setPersons] = useState<{ name: string; profileImage: string }[]>([]);
  const [personName, setPersonName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      const names = await contractInstance.getPersons();
      const personsData = await Promise.all(
        names.map(async (name: string) => {
          const profileImage = await contractInstance.getProfileImage(name);
          return { name, profileImage };
        })
      );
      setPersons(personsData);
    } catch (error) {
      console.error("Failed to fetch persons", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed!");
      }
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Image upload failed", error);
      throw error;
    }
  };

  const addPerson = async () => {
    if (!contract || !account || !provider || !personName || !selectedFile) {
      alert("Please connect your wallet, enter a name, and select an image!");
      return;
    }
    try {
      const imageUrl = await uploadImage(selectedFile);
      if (!imageUrl) return;

      const signer = await provider!.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.addPerson(personName, imageUrl);
      await tx.wait();
      alert("Person Added!");
      setPersonName("");
      setSelectedFile(null);
      setPreviewUrl(null);
      fetchPersons(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="p-8 flex flex-col items-center bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">MemoryVault DApp</h1>
      {!account ? (
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={connectWallet}>
          Connect MetaMask
        </button>
      ) : (
        <p className="mb-4">Connected: {account}</p>
      )}
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-4">
        <input
          type="text"
          placeholder="Enter Person's Name"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full p-2 border rounded mb-2"
        />
        {previewUrl && <Image src={previewUrl} alt="Preview" width={96} height={96} className="object-cover mb-2 rounded-full" />}
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full" onClick={addPerson}>
          Add Person
        </button>
      </div>
      <div className="w-full max-w-md mt-6">
        <h2 className="text-xl font-bold mb-2">Stored Persons</h2>
        <ul className="bg-white shadow p-4 rounded">
          {persons.map(({ name, profileImage }, index) => (
            <li
              key={index}
              className="border-b py-2 cursor-pointer hover:bg-gray-200 flex items-center gap-2"
              onClick={() => router.push(`/charity/memory/${name}`)}
            >
              <Image src={profileImage} alt={name} width={40} height={40} className="w-10 h-10 rounded-full" />
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
