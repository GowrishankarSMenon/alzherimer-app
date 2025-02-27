import { create } from "ipfs-http-client";
import fs from "fs";

// Connect to an IPFS node (Infura, Local Node, etc.)
const ipfs = create({ url: "https://ipfs.infura.io:5001/api/v0" });

// Function to upload file to IPFS
export const uploadToIPFS = async (filePath: string) => {
  try {
    const file = fs.readFileSync(filePath);
    const { path } = await ipfs.add(file);
    console.log(`Uploaded to IPFS: ${path}`);
    return path; // Return the IPFS hash
  } catch (error) {
    console.error("IPFS Upload Failed:", error);
  }
};

// Function to retrieve file from IPFS
export const retrieveFromIPFS = async (ipfsHash: string) => {
  try {
    const url = `https://ipfs.io/ipfs/${ipfsHash}`;
    console.log(`Retrieve from IPFS: ${url}`);
    return url; // This is the direct link to access the file
  } catch (error) {
    console.error("IPFS Retrieval Failed:", error);
  }
};
