"use client";
import { useState, useEffect } from "react";
import { auth, db } from "./lib/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp, query, collection, where, orderBy, getDocs, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import Header from "./Header";
import RoleSelection from "./RoleSelection";
import SearchCaretakers from "./SearchCaretakers";
import PendingRequests from "./PendingRequests";
import ConnectedCaretakers from "./ConnectedCaretakers";
import UploadedMemories from "./UploadedMemories";
import UploadForm from "./UploadForm";
import { uploadToPinata } from "./pinata";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleSelection, setRoleSelection] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserData(userData);
          setUserRole(userData.role);
          if (!userData.role) setRoleSelection(true);
        } else {
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email,
            photoURL: user.photoURL || null,
            appName: "Alzheimer's Care App",
            createdAt: serverTimestamp(),
            connections: [],
            pendingRequests: [],
            outgoingRequests: []
          });
          setRoleSelection(true);
        }
      } else {
        setUser(null);
        setUserRole(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && userRole) {
      fetchConnections();
      fetchFiles();
    }
  }, [user, userRole]);

  const handleRoleSelection = async (role: string) => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { role }, { merge: true });
    setUserRole(role);
    setRoleSelection(false);
  };

  const fetchConnections = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const userData = userSnap.data();
    setUserData(userData);
    const connections = userData.connections || [];
    const connectedUsersData = [];
    for (const uid of connections) {
      const connectedUserRef = doc(db, "users", uid);
      const connectedUserSnap = await getDoc(connectedUserRef);
      if (connectedUserSnap.exists()) {
        connectedUsersData.push({
          uid,
          ...connectedUserSnap.data()
        });
      }
    }
    setConnectedUsers(connectedUsersData);
    const pendingRequestsData = [];
    for (const uid of (userData.pendingRequests || [])) {
      const requestUserRef = doc(db, "users", uid);
      const requestUserSnap = await getDoc(requestUserRef);
      if (requestUserSnap.exists()) {
        pendingRequestsData.push({
          uid,
          ...requestUserSnap.data()
        });
      }
    }
    setPendingRequests(pendingRequestsData);
  };

  const fetchFiles = async () => {
    if (!user || !userRole) return;
    let q;
    if (userRole === "patient") {
      q = query(
        collection(db, "uploads"), 
        where("userId", "==", user.uid),
        orderBy("uploadedAt", "desc")
      );
    } else if (userRole === "caretaker") {
      const userConnections = userData?.connections || [];
      if (userConnections.length === 0) {
        setUploadedFiles([]);
        return;
      }
      q = query(
        collection(db, "uploads"),
        where("userId", "in", userConnections),
        orderBy("uploadedAt", "desc")
      );
    }
    if (!q) return;
    const querySnapshot = await getDocs(q);
    const files = [];
    for (const docSnap of querySnapshot.docs) {
      const fileData = docSnap.data();
      const uploaderDocRef = doc(db, "users", fileData.userId);
      const uploaderSnap = await getDoc(uploaderDocRef);
      let uploaderData = null;
      if (uploaderSnap.exists()) {
        uploaderData = {
          displayName: (uploaderSnap.data() as any).displayName,
          email: (uploaderSnap.data() as any).email,
          photoURL: (uploaderSnap.data() as any).photoURL,
          role: (uploaderSnap.data() as any).role
        };
      }
      files.push({
        id: docSnap.id,
        ...fileData,
        uploader: uploaderData
      });
    }
    setUploadedFiles(files);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };
  
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !user) return;
  
    setLoading(true);
    try {
      const pinataResponse = await uploadToPinata(file);
      const fileData = {
        userId: user.uid,
        title,
        description,
        fileUrl: `https://gateway.pinata.cloud/ipfs/${pinataResponse.IpfsHash}`,
        fileName: file.name,
        fileType: file.type,
        uploadedAt: serverTimestamp()
      };
  
      await setDoc(doc(collection(db, "uploads")), fileData);
  
      setFile(null);
      setTitle("");
      setDescription("");
      setPreview("");
  
      fetchFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;
    
    setIsSearching(true);
    try {
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", userRole === "patient" ? "caretaker" : "patient")
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const results = [];
      
      for (const docSnap of querySnapshot.docs) {
        const userData = docSnap.data();
        if (userData.uid === user.uid) continue;
        if (connectedUsers.some(u => u.uid === userData.uid)) continue;
        
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        const currentUserData = userDocSnap.data() as any;
        if (
          currentUserData?.outgoingRequests?.includes(userData.uid) ||
          currentUserData?.pendingRequests?.includes(userData.uid)
        ) continue;
        
        const displayName = userData.displayName?.toLowerCase() || "";
        const email = userData.email?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        
        if (displayName.includes(query) || email.includes(query)) {
          results.push({
            uid: userData.uid,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL,
            role: userData.role
          });
        }
      }
      
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for users:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const sendConnectionRequest = async (recipientUid: string) => {
    if (!user) return;
    
    try {
      const recipientRef = doc(db, "users", recipientUid);
      await updateDoc(recipientRef, {
        pendingRequests: arrayUnion(user.uid)
      });
      
      const currentUserRef = doc(db, "users", user.uid);
      await updateDoc(currentUserRef, {
        outgoingRequests: arrayUnion(recipientUid)
      });
      
      setSearchResults(prev => 
        prev.filter(result => result.uid !== recipientUid)
      );
    } catch (error) {
      console.error("Error sending connection request:", error);
    }
  };
  
  const acceptConnectionRequest = async (senderUid: string) => {
    if (!user) return;
    
    try {
      const currentUserRef = doc(db, "users", user.uid);
      await updateDoc(currentUserRef, {
        connections: arrayUnion(senderUid),
        pendingRequests: arrayRemove(senderUid)
      });
      
      const senderRef = doc(db, "users", senderUid);
      await updateDoc(senderRef, {
        connections: arrayUnion(user.uid),
        outgoingRequests: arrayRemove(user.uid)
      });
      
      fetchConnections();
    } catch (error) {
      console.error("Error accepting connection request:", error);
    }
  };
  
  const rejectConnectionRequest = async (senderUid: string) => {
    if (!user) return;
    
    try {
      const currentUserRef = doc(db, "users", user.uid);
      await updateDoc(currentUserRef, {
        pendingRequests: arrayRemove(senderUid)
      });
      
      const senderRef = doc(db, "users", senderUid);
      await updateDoc(senderRef, {
        outgoingRequests: arrayRemove(user.uid)
      });
      
      fetchConnections();
    } catch (error) {
      console.error("Error rejecting connection request:", error);
    }
  };
  
  const removeConnection = async (connectionUid: string) => {
    if (!user) return;
    
    try {
      const currentUserRef = doc(db, "users", user.uid);
      await updateDoc(currentUserRef, {
        connections: arrayRemove(connectionUid)
      });
      
      const connectionRef = doc(db, "users", connectionUid);
      await updateDoc(connectionRef, {
        connections: arrayRemove(user.uid)
      });
      
      fetchConnections();
    } catch (error) {
      console.error("Error removing connection:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Header user={user} userRole={userRole} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {roleSelection && user && (
          <RoleSelection handleRoleSelection={handleRoleSelection} />
        )}
        {!roleSelection && user && (
          <div>
            {userRole === "patient" && (
              <>
                <UploadForm
                  file={file}
                  setFile={setFile}
                  title={title}
                  setTitle={setTitle}
                  description={description}
                  setDescription={setDescription}
                  handleUpload={handleUpload}
                  preview={preview}
                  loading={loading}
                  handleFileChange={handleFileChange}
                />
                <SearchCaretakers
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleSearch={handleSearch}
                  isSearching={isSearching}
                  searchResults={searchResults}
                  sendConnectionRequest={sendConnectionRequest}
                />
              </>
            )}
            <PendingRequests
              pendingRequests={pendingRequests}
              acceptConnectionRequest={acceptConnectionRequest}
              rejectConnectionRequest={rejectConnectionRequest}
            />
            <ConnectedCaretakers
              connectedUsers={connectedUsers}
              removeConnection={removeConnection}
              title={userRole === "patient" ? "Connected Caretakers" : "Connected Patients"}
            />
            <UploadedMemories uploadedFiles={uploadedFiles} />
          </div>
        )}
        
        {/* Charity Section - Only Visible if User is Logged In */}
        {user && (
          <div className="mt-6 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Charity Section
            </h2>
            <div className="flex flex-wrap gap-4">
              <Link href="/charity">
                <button className="btn text-lg px-6 py-3">Charity Home</button>
              </Link>
              <Link href="/charity/docs">
                <button className="btn text-lg px-6 py-3">Charity Documents</button>
              </Link>
              <Link href="/charity/biodata">
                <button className="btn text-lg px-6 py-3">Charity Biodata</button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}