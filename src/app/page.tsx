"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { auth, signInWithGoogle, logOut, db } from "./lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { addDoc, setDoc, doc, getDoc, serverTimestamp, query, where, getDocs, collection } from "firebase/firestore";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleSelection, setRoleSelection] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
  
        // Check if user exists in Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (!userSnap.exists()) {
          // Store user data when signing in for the first time
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            appName: "Alzheimer's Care App",
            createdAt: serverTimestamp(),
          });
        }
  
        const role = await fetchUserRole(user.uid);
        setUserRole(role);
        if (!role) setRoleSelection(true);
      } else {
        setUser(null);
        setUserRole(null);
      }
    });
  
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && userRole) {
      fetchFiles();
    }
  }, [user, userRole]);

  const fetchUserRole = async (uid: string) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().role : null;
  };

  const handleRoleSelection = async (role: string) => {
    if (!user) return;
    
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      role,
      appName: "Alzheimer's Care App",
      createdAt: serverTimestamp(),
    });
  
    setUserRole(role);
    setRoleSelection(false);
    fetchFiles();
  };

  const fetchFiles = async () => {
    if (!user || !userRole) return;

    let q;
    if (userRole === "caretaker") {
      q = query(collection(db, "uploads"));
    } else {
      q = query(collection(db, "uploads"), where("userId", "==", user.uid));
    }

    const querySnapshot = await getDocs(q);
    const files = querySnapshot.docs.map((doc) => doc.data().fileUrl);

    setUploadedFiles(files);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user || !userRole) return alert("Please select a file and sign in.");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: "2891dcd4032fb6adc0f9",
          pinata_secret_api_key: "f8f21623df832f745def2f7f827cd01f6f31a95a57578e1434b30190c5abd9d0",
        },
      });

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
      await addDoc(collection(db, "uploads"), {
        userId: user.uid,
        fileUrl: ipfsUrl,
        uploadedAt: serverTimestamp(),
        role: userRole,
      });

      setUploadedFiles((prev) => [ipfsUrl, ...prev]);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Upload Files to IPFS (Pinata)</h1>

        <div className="flex flex-col items-center mb-6">
          {user ? (
            <div className="flex flex-col items-center">
              <p className="text-lg font-medium">Welcome, {user.displayName}</p>
              <button onClick={logOut} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">Log Out</button>
            </div>
          ) : (
            <button onClick={signInWithGoogle} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Sign in with Google</button>
          )}

          {roleSelection && (
            <div className="mt-4">
              <p className="text-lg font-medium">Select your role:</p>
              <button onClick={() => handleRoleSelection("patient")} className="mt-2 px-4 py-2 bg-green-500 text-white rounded">Patient</button>
              <button onClick={() => handleRoleSelection("caretaker")} className="mt-2 ml-2 px-4 py-2 bg-purple-500 text-white rounded">Caretaker</button>
            </div>
          )}
        </div>

        {user && userRole && (
          <div className="flex flex-col items-center mb-6">
            <input type="file" onChange={handleFileChange} className="mt-4" />
            <button 
              onClick={handleUpload} 
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded" 
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        )}

        <div className="w-full">
          <h2 className="mt-8 text-xl font-semibold">Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No uploaded files.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {uploadedFiles.map((url, index) => (
                <li key={index} className="break-words">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
