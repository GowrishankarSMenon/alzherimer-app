interface UploadedFile {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  uploader: {
    role: string;
    displayName?: string;
    email: string;
  };
}

interface UploadedMemoriesProps {
  uploadedFiles: UploadedFile[];
}

export default function UploadedMemories({ uploadedFiles }: UploadedMemoriesProps) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Uploaded Memories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploadedFiles.map((file) => (
            <div 
              key={file.id} 
              className={`p-4 rounded-lg shadow ${file.uploader.role === 'caretaker' ? 'bg-green-100' : 'bg-blue-100'}`}
            >
              <h3 className="font-bold text-lg mb-1">{file.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{file.description}</p>
              <img src={file.fileUrl} alt={file.title} className="w-full h-auto mb-2" />
              <p className="text-xs text-gray-400">Uploaded by: {file.uploader.displayName || file.uploader.email}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }