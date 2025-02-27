import { getAuth } from "firebase/auth";

export async function registerWithFingerprint() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to register fingerprint.");
    return;
  }

  if (!window.PublicKeyCredential) {
    alert("WebAuthn is not supported in this browser.");
    return;
  }

  try {
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge: new Uint8Array(32), // Normally, this should come from the server
      rp: {
        name: "Your App Name", // Replace dynamically below
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(user.uid), // Firebase User ID
        name: user.email || "unknown@example.com", // Firebase User Email
        displayName: user.displayName || "User",
      },
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform", // Use built-in fingerprint scanner
        requireResidentKey: false,
        userVerification: "preferred",
      },
      timeout: 60000,
      attestation: "none",
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (credential) {
      console.log("Fingerprint registered successfully:", credential);
      alert("Fingerprint registered successfully!");
    }
  } catch (error) {
    console.error("Fingerprint registration failed:", error);
    alert("Fingerprint registration failed!");
  }
}

export async function loginWithFingerprint() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to use fingerprint login.");
    return;
  }

  if (!window.PublicKeyCredential) {
    alert("WebAuthn is not supported in this browser.");
    return;
  }

  try {
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge: new Uint8Array(32), // Normally, this should come from the server
      rpId: window.location.hostname,
      allowCredentials: [],
      userVerification: "preferred",
      timeout: 60000,
    };

    const credential = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (credential) {
      console.log("Fingerprint login successful:", credential);
      alert("Fingerprint login successful!");
    }
  } catch (error) {
    console.error("Fingerprint login failed:", error);
    alert("Fingerprint login failed!");
  }
}
