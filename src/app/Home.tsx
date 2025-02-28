"use client";
import { useState, useEffect } from "react";
import { logOut, signInWithGoogle, auth, db } from "./lib/firebaseConfig";
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
import {
  ChevronRightIcon,
  CloudArrowUpIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import PersonList from "@/components/PersonList";

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
      <div className="contents-main flex gap-6">
      <main
  className={`${
    userRole === "patient" ? "w-[70%] max-w-7xl" : "mx-auto"
  } px-4 sm:px-6 lg:px-8`}
>

        {roleSelection && user && (
          <RoleSelection handleRoleSelection={handleRoleSelection} />
        )}

        {!user ? (
          /* ---------------------------- Landing Content ---------------------------- */
          <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center pt-12 pb-24 space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
                Preserving Memories,<br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Empowering Care
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A compassionate platform connecting Alzheimer's patients with their caregivers through shared memories and secure communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={signInWithGoogle} className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
                  Get Started
                </button>

                <button className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg text-base font-medium hover:bg-indigo-50 transition-all shadow-sm">
                  Learn More
                </button>
              </div>
            </section>

            {/* Features Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
              {[
                { icon: CloudArrowUpIcon, title: 'Memory Preservation', text: 'Securely store and organize precious memories with advanced encryption' },
                { icon: UserGroupIcon, title: 'Caretaker Network', text: 'Connect with trusted caregivers and family members' },
                { icon: ShieldCheckIcon, title: 'Secure Sharing', text: 'IPFS-based storage with blockchain security features' },
                { icon: ClockIcon, title: 'Memory Triggers', text: 'Automated reminders and memory prompts' }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  <feature.icon className="h-10 w-10 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.text}</p>
                </div>
              ))}
            </section>

            {/* How It Works */}
            <section className="py-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
                <p className="text-gray-600 max-w-xl mx-auto">A simple three-step process to preserve and share memories</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {['Upload Memories', 'Connect Caretakers', 'Share Securely'].map((step, idx) => (
                  <div key={step} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <span className="text-lg font-semibold">{idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{step}</h3>
                    <p className="text-gray-600 text-sm mb-4">Secure upload process with automatic metadata tagging and organization</p>
                    <button className="text-indigo-600 flex items-center gap-1.5 text-sm font-medium hover:text-indigo-700">

                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-indigo-600 text-white py-16 rounded-xl">
              <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-4">Start Preserving Memories Today</h2>
                <p className="text-gray-200 mb-8">Join thousands of families already benefiting from our secure memory preservation platform</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={signInWithGoogle} // added onClick handler here
                    className="bg-white text-indigo-600 px-6 py-3 rounded-lg text-base font-medium hover:bg-indigo-50 transition-all shadow-sm">
                    Sign Up Free
                  </button>
                  <button
                    className="border border-white text-white px-6 py-3 rounded-lg text-base font-medium hover:bg-white/10 transition-all">
                    Watch Demo
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ---------------------------- Dashboard Content ---------------------------- */
          <div className="py-8 space-y-8">
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
          </div>
        )}
        {user && (
  <div className="mt-10 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
    <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-6">
      🌟 Charity Section
    </h2>
    <p className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl mx-auto mb-8">
      Explore charity-related resources and contribute to making a difference.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 place-items-center">
      <Link href="/charity">
        <button className="btn text-lg px-6 py-3 w-full sm:w-auto bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all">
          Charity Home
        </button>
      </Link>
      <Link href="/charity/docs">
        <button className="btn text-lg px-6 py-3 w-full sm:w-auto bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all">
          Charity Documents
        </button>
      </Link>
      <Link href="/charity/biodata">
        <button className="btn text-lg px-6 py-3 w-full sm:w-auto bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-all">
          Charity Biodata
        </button>
      </Link>
    </div>
  </div>
)}
      </main>
      {userRole==="patient" && (
        <PersonList/>
      )}
      </div>
      {/* Footer */}
      {!user && (
        <footer className="border-t border-gray-200 bg-white mt-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              &copy; 2025 HackAthena competition.
            </p>
            </div>
        </footer>
      )}
    </div>
  );
}