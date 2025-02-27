import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyDMUx6OGLNwzEqP79apE6dd6YvZUeyha3o",
  authDomain: "test-alzheimer-fb767.firebaseapp.com",
  projectId: "test-alzheimer-fb767",
  storageBucket: "test-alzheimer-fb767.appspot.com",
  messagingSenderId: "274524552548",
  appId: "1:274524552548:web:a169b1414864419e760e71",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// Google Sign-In
const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error: any) {
      if (error.code === "auth/cancelled-popup-request") {
        console.warn("Google Sign-In popup was closed before completion.");
      } else {
        console.error("Google Sign-In Error:", error);
      }
      return null;
    }
  };


  

// Logout Function
const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

export { auth, db, storage, signInWithGoogle, logOut };
