import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  function arrayBufferToBase64(buffer: ArrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }
  try {
    console.log("Received WebAuthn credentials:", req.body); // Debugging step

    const { userId, credential } = req.body;
    if (!userId || !credential) {
      return res.status(400).json({ error: "Missing userId or credential data" });
    }

    // Convert ArrayBuffer to Base64 (since Firestore doesn't store binary data)
    const credentialId = arrayBufferToBase64(credential.rawId);

    await setDoc(doc(db, "webauthnCredentials", userId), {
      userId,
      credentialId,
      publicKey: arrayBufferToBase64(credential.response.attestationObject),
      signCount: credential.response?.signCount || 0,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error storing credentials:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
