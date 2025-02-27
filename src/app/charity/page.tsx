"use client";

declare global {
  interface Window {
    ethereum: any;
  }
}

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import Chat from "@/components/Chat";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace after deploying
const CONTRACT_ABI = Abi.abi;

export default function Charity() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [amount, setAmount] = useState<string>("");

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
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const contributeFunds = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.contribute(amount, {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      alert("Contribution Successful!");
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Transaction Failed!");
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Black Screen */}
      <div className="w-1/2"> 
      <Chat></Chat>
      </div>
      {/* Right Content Section */}
      <div className="w-1/2 flex flex-col items-center justify-center bg-gray-100 p-10">
        <h1 className="text-3xl font-bold mb-6">Charity Fund DApp</h1>
        {!account ? (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
          >
            Connect MetaMask
          </button>
        ) : (
          <p className="text-lg font-semibold mb-4">Connected: {account}</p>
        )}

        <input
          type="number"
          placeholder="Amount in ETH"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={contributeFunds}
          className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
        >
          Contribute
        </button>
      </div>
    </div>
  );
}
