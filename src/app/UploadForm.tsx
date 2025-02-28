import React from 'react';
import { uploadToPinata } from './pinata';

interface UploadFormProps {
  file: File | null;
  setFile: (file: File | null) => void;
  title: string;
  setTitle: (title: string) => void;
  description: string;
  setDescription: (description: string) => void;
  handleUpload: (e: React.FormEvent) => void;
  preview: string | null;
  loading: boolean;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadForm: React.FC<UploadFormProps> = ({
  file,
  setFile,
  title,
  setTitle,
  description,
  setDescription,
  handleUpload,
  preview,
  loading,
  handleFileChange
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl text-[#ed6325] font-semibold mb-4">Upload a Memory</h2>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4"
        />
        {preview && <img src={preview} alt="Preview" className="mb-4 w-full h-auto" />}
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Title" 
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description" 
          className="w-full px-4 py-2 border rounded-lg mb-4"
        />
        <button 
          type="submit"
          className={`px-4 py-2 bg-[#ed6325] text-white rounded hover:bg-[#d75c23] transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;