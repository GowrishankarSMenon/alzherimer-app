"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Abi from "../../../../blockchain/artifacts/contracts/CharityFund.sol/CharityFund.json";
import Chat from "@/components/Chat";
import { X, MessageSquare, ChevronLeft, ChevronRight, Book } from "lucide-react";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTRACT_ABI = Abi.abi;
const ENTRIES_PER_PAGE = 5;

export default function DiaryPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [entries, setEntries] = useState<{ day: string; dairy: string }[]>([]);
  const [newEntry, setNewEntry] = useState({ day: "", dairy: "" });
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showBookModal, setShowBookModal] = useState(false);
  const [bookPage, setBookPage] = useState(1);
  const [isPageTurning, setIsPageTurning] = useState(false);
  const [pageDirection, setPageDirection] = useState("right");

  // Keep original pagination logic
  const indexOfLastEntry = currentPage * ENTRIES_PER_PAGE;
  const indexOfFirstEntry = indexOfLastEntry - ENTRIES_PER_PAGE;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(entries.length / ENTRIES_PER_PAGE);
  
  // For book view
  const totalBookPages = entries.length;
  const currentBookEntry = entries[bookPage - 1] || { day: "", dairy: "" };

  // Add input validation for day
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setNewEntry({ ...newEntry, day: value });
  };

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
      fetchEntries(newContract);
    } catch (error) {
      console.error("Wallet Connection Failed", error);
      alert("Failed to connect wallet!");
    }
  };

  const fetchEntries = async (contractInstance: ethers.Contract) => {
    try {
      const data = await contractInstance.getDairyEntry();
      setEntries(data);
    } catch (error) {
      console.error("Failed to fetch diary entries", error);
    }
  };

  const addDiaryEntry = async () => {
    if (!contract || !account || !provider) {
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);

      const tx = await contractWithSigner.addDairyentry(newEntry.day, newEntry.dairy);
      await tx.wait();
      alert("Memory saved successfully!");

      setNewEntry({ day: "", dairy: "" });
      fetchEntries(contract);
    } catch (error) {
      console.error("Transaction Failed", error);
      alert("Failed to save memory. Please try again.");
    }
  };
  
  const navigateBookPage = (direction) => {
    setPageDirection(direction);
    setIsPageTurning(true);
    
    setTimeout(() => {
      if (direction === "left" && bookPage > 1) {
        setBookPage(prev => prev - 1);
      } else if (direction === "right" && bookPage < totalBookPages) {
        setBookPage(prev => prev + 1);
      }
      
      setTimeout(() => {
        setIsPageTurning(false);
      }, 300);
    }, 300);
  };

  const BookModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="relative flex flex-col items-center">
        <button 
          onClick={() => setShowBookModal(false)}
          className="absolute top-6 right-6 z-10 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg"
        >
          <X size={32} />
        </button>
        
        <div className={`
          flex items-center justify-center bg-white
          w-[90vw] max-w-[1200px] h-[80vh] rounded-2xl shadow-2xl transform 
          ${isPageTurning && pageDirection === "right" ? 'scale-95 rotate-3 opacity-80' : ''}
          ${isPageTurning && pageDirection === "left" ? 'scale-95 rotate-[-3deg] opacity-80' : ''}
          transition-all duration-300
        `}>
          {entries.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-gray-600 text-3xl">Your memory book is empty. Add your first memory!</p>
            </div>
          ) : (
            <div className="flex relative w-full h-full p-12">
              <div className="w-full flex flex-col">
                <div className="text-center mb-8">
                  <div className="inline-block px-8 py-3 bg-teal-600 text-white rounded-xl text-4xl">
                    Day {currentBookEntry.day}
                  </div>
                </div>
                <div className="flex-1 overflow-auto px-8 text-3xl text-gray-700 leading-relaxed">
                  {currentBookEntry.dairy}
                </div>
                <div className="text-right text-2xl text-gray-500 mt-4">
                  Page {bookPage} of {totalBookPages}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 flex items-center justify-between w-[600px]">
          <button 
            onClick={() => navigateBookPage("left")}
            disabled={bookPage === 1}
            className={`
              bg-teal-600 text-white p-6 rounded-full shadow-lg
              ${bookPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'}
              transition-all
            `}
          >
            <ChevronLeft size={40} />
          </button>
          
          <div className="text-white text-3xl">
            Page {bookPage} of {totalBookPages || 1}
          </div>
          
          <button 
            onClick={() => navigateBookPage("right")}
            disabled={bookPage === totalBookPages || entries.length === 0}
            className={`
              bg-teal-600 text-white p-6 rounded-full shadow-lg
              ${bookPage === totalBookPages || entries.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-teal-700'}
              transition-all
            `}
          >
            <ChevronRight size={40} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* AI Chat Panel */}
      <div 
        className={`h-full bg-gray-100 transition-all duration-300 ease-in-out ${
          isAIOpen ? "w-1/2" : "w-0 overflow-hidden"
        }`}
      >
        {isAIOpen && <Chat />}
      </div>

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isAIOpen ? "w-1/2" : "w-full"
        }`}
      >
        {/* Toggle Button */}
        <div className="p-6">
          <button 
            onClick={() => setIsAIOpen(!isAIOpen)}
            className="bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg"
            aria-label={isAIOpen ? "Close AI Assistant" : "Open AI Assistant"}
          >
            {isAIOpen ? <X size={32} /> : <MessageSquare size={32} />}
          </button>
        </div>

        <div className="p-8 flex flex-col items-center justify-center bg-white min-h-[calc(100vh-5rem)]">
          <h1 className="text-5xl font-bold mb-8 text-gray-800">My Memory Journal</h1>

          {!account ? (
            <button 
              className="bg-teal-600 hover:bg-teal-700 text-white text-2xl px-8 py-4 rounded-xl font-bold transition-colors shadow-md" 
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          ) : (
            <div className="mb-8 text-2xl text-gray-700">
              <span>Connected: </span>
              <span className="font-medium">{account}</span>
            </div>
          )}

          <div className="w-full max-w-2xl p-8 bg-gray-50 rounded-xl shadow-lg border-2 border-gray-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Write New Memory</h2>
            <div className="mb-6">
              <label className="block text-2xl text-gray-700 mb-3">Day Number:</label>
              <input
                type="text"
                placeholder="Enter day number (e.g., 1)"
                value={newEntry.day}
                onChange={handleDayChange}
                className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-0 bg-white"
              />
            </div>
            <div className="mb-6">
              <label className="block text-2xl text-gray-700 mb-3">Your Memory:</label>
              <textarea
                placeholder="Write about your day..."
                value={newEntry.dairy}
                onChange={(e) => setNewEntry({ ...newEntry, dairy: e.target.value })}
                className="w-full p-4 text-2xl border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-0 bg-white min-h-[200px]"
              />
            </div>
            <button 
              className="bg-teal-600 hover:bg-teal-700 text-white text-2xl px-6 py-4 rounded-xl w-full transition-colors font-bold shadow-md" 
              onClick={addDiaryEntry}
            >
              Save Memory
            </button>
          </div>

          {entries.length > 0 && (
            <button
              onClick={() => {
                setBookPage(1);
                setShowBookModal(true);
              }}
              className="mt-8 flex items-center gap-3 bg-teal-600 hover:bg-teal-700 text-white text-2xl px-8 py-4 rounded-xl transition-colors font-bold shadow-md"
            >
              <Book size={32} />
              View My Memories
            </button>
          )}
        </div>
      </div>
      
      {showBookModal && <BookModal />}
    </div>
  );
}