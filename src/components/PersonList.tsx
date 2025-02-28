"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { FiPlus } from "react-icons/fi"; // Importing plus icon
import Abi from "../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;

export default function PersonList() {
  const [persons, setPersons] = useState<string[]>([]);
  const [profileImages, setProfileImages] = useState<{ [key: string]: string }>({});
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const newContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(newContract);
        fetchPersons(newContract);
      }
    };
    initContract();
  }, []);

  const fetchPersons = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getPersons();
      setPersons(data);
      fetchProfileImages(contractInstance, data);
    } catch (error) {
      console.error("Failed to fetch persons", error);
    }
  };

  const fetchProfileImages = async (contractInstance: ethers.Contract, persons: string[]) => {
    const images: { [key: string]: string } = {};
    for (const name of persons) {
      try {
        const imageUrl = await contractInstance.getProfileImage(name);
        images[name] = imageUrl || "/default-avatar.png"; // Use default avatar if empty
      } catch (error) {
        console.error(`Failed to fetch profile image for ${name}`, error);
        images[name] = "/default-avatar.png"; // Fallback in case of error
      }
    }
    setProfileImages(images);
  };

  return (
    <div className="w-[30%] max-w-3xl bg-gray-900 text-white p-4 flex flex-col min-h-screen">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4">Stored Persons</h2>

      {/* List of Persons */}
      <ul className="space-y-3 flex-grow overflow-y-auto">
        {persons.map((name, index) => (
          <li
            key={index}
            className="flex items-center space-x-3 p-2 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
            onClick={() => router.push(`/charity/memory/${name}`)}
          >
            {/* Circular User Image */}
            <Image
              src={profileImages[name] || "/default-avatar.png"}
              alt="User"
              width={40}
              height={40}
              className="rounded-full border border-gray-500 object-cover"
            />
            <span className="text-lg">{name}</span>
          </li>
        ))}
      </ul>

      {/* Add New User Button */}
      <button
        className="w-full mt-4 flex items-center justify-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition"
        onClick={() => router.push("/charity/memory")}
      >
        <FiPlus className="text-2xl mr-2" />
        <span className="text-lg">Add New User</span>
      </button>
    </div>
  );
}