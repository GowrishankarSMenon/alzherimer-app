import axios from 'axios';

export const PINATA_API_KEY = "39c9337b50241cf5c755";
export const PINATA_SECRET_API_KEY = "652d99ebeb0a35592ea6887824eab5b42fa149e49d08b705f1d282812c06958e";

export const uploadToPinata = async (file: File) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data',
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading file to Pinata:', error);
    throw error;
  }
};