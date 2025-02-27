import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    // Get files uploaded by the user
    const userFilesQuery = query(collection(db, "files"), where("userId", "==", userId));
    const userFilesSnap = await getDocs(userFilesQuery);

    // Get files shared with the user (assuming caretaker-user mapping exists)
    const sharedFilesQuery = query(collection(db, "files"), where("caretakerId", "==", userId));
    const sharedFilesSnap = await getDocs(sharedFilesQuery);

    // Combine results
    const files = [
      ...userFilesSnap.docs.map((doc) => doc.data().ipfsUrl),
      ...sharedFilesSnap.docs.map((doc) => doc.data().ipfsUrl),
    ];

    res.status(200).json({ files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
}
