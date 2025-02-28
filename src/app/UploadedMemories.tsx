"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, X, ZoomIn, ZoomOut } from "lucide-react";

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

export default function UploadedMemories({ uploadedFiles = [] }: UploadedMemoriesProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fileTitle, setFileTitle] = useState<string>("");
  const [fileTypes, setFileTypes] = useState<{ [url: string]: string }>({});

  // 🔹 Sorting logic (ascending or descending)
  const sortedFiles = [...uploadedFiles].sort((a, b) =>
    sortOrder === "asc"
      ? (a.title || "").localeCompare(b.title || "")
      : (b.title || "").localeCompare(a.title || "")
  );

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 🔹 Fetch file types using HEAD request
  useEffect(() => {
    const detectFileTypes = async () => {
      const types: { [url: string]: string } = {};
      for (const file of uploadedFiles) {
        types[file.fileUrl] = await getFileType(file.fileUrl);
      }
      setFileTypes(types);
    };
    detectFileTypes();
  }, [uploadedFiles]);

  // 🔹 Get file type using HTTP HEAD request
  const getFileType = async (url: string) => {
    try {
      const response = await fetch(url, { method: "HEAD" });
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("image")) return "image";
      if (contentType?.includes("video")) return "video";
      if (contentType?.includes("pdf")) return "pdf";

      return "unknown";
    } catch (error) {
      console.error("Error detecting file type:", error);
      return "unknown";
    }
  };

  const openFileModal = (fileUrl: string, title: string, type: string) => {
    setSelectedFile(decodeURIComponent(fileUrl));
    setSelectedFileType(type);
    setFileTitle(title);
    setZoomLevel(1);
  };

  const closeFileModal = () => {
    setSelectedFile(null);
    setSelectedFileType(null);
  };

  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.5, 0.5));

  return (
    <div className="mt-10 px-4">
      {/* 🔹 Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#ed6325] dark:text-gray-100">Uploaded Memories</h2>
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-5 py-3 text-lg bg-[#ed6325] dark:bg-gray-800 border border-[#d75c23] dark:border-gray-600 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label={`Sort by title ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <span>Sort by Title</span>
          {sortOrder === "asc" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* 🔹 Uploaded Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedFiles.map((file) => {
          const fileType = fileTypes[file.fileUrl] || "loading";
          const decodedUrl = decodeURIComponent(file.fileUrl);

          return (
            <div
              key={file.id}
              className={`p-5 rounded-lg shadow-lg transition hover:shadow-xl ${
                file.uploader.role === "caretaker" ? "bg-green-100 dark:bg-green-800" : "bg-blue-100 dark:bg-blue-800"
              }`}
            >
              <h3 className="text-xl font-semibold mb-2">{file.title}</h3>
              <p className="text-md text-gray-700 dark:text-gray-300 mb-3">{file.description}</p>

              {/* 🔹 Render Loading State */}
              {fileType === "loading" && <p className="text-gray-500 dark:text-gray-400">Detecting file type...</p>}

              {/* 🔹 Render Images */}
              {fileType === "image" && (
                <div className="cursor-pointer overflow-hidden" onClick={() => openFileModal(decodedUrl, file.title, fileType)}>
                  <img src={decodedUrl} alt={file.title} className="w-full h-auto mb-3 rounded-lg hover:opacity-90 transition-opacity" />
                  <div className="text-center text-md text-[#ed6325] dark:text-gray-400">
                    Click image to view full size
                  </div>
                </div>
              )}

              {/* 🔹 Render Videos */}
              {fileType === "video" && (
                <video controls className="w-full h-auto mb-3 rounded-lg">
                  <source src={decodedUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}

              {/* 🔹 Render PDFs */}
              {fileType === "pdf" && (
                <div className="text-center">
                  <a href={decodedUrl} target="_blank" rel="noopener noreferrer" className="text-[#ed6325] dark:text-blue-400 underline">
                    📄 View PDF
                  </a>
                </div>
              )}

              <p className="text-md text-[#ed6325] dark:text-gray-300 mt-3">
                Uploaded by: {file.uploader.displayName || file.uploader.email}
              </p>
            </div>
          );
        })}
      </div>

      {/* 🔹 Image Modal */}
      {selectedFile && selectedFileType === "image" && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-6"
          onClick={closeFileModal}
        >
          <div className="absolute top-0 left-0 w-full bg-black bg-opacity-90 text-white text-center py-4">
            <h3 className="text-2xl font-bold">{fileTitle}</h3>
          </div>

          <div
            className="relative max-w-5xl w-full max-h-screen overflow-hidden bg-white dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-6 right-6 flex gap-3 z-10">
              <button onClick={zoomIn} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <ZoomIn className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
              <button onClick={zoomOut} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <ZoomOut className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
              <button onClick={closeFileModal} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                <X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            <img src={selectedFile} alt={fileTitle} className="max-w-full max-h-80vh" />
          </div>
        </div>
      )}
    </div>
  );
}
