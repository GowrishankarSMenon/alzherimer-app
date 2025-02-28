"use client";

import { useState } from "react";
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
  // State for sorting
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // State for image modal
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageTitle, setImageTitle] = useState<string>("");

  // Sort the files based on title - safely handle undefined/null
  const sortedFiles = Array.isArray(uploadedFiles)
    ? [...uploadedFiles].sort((a, b) => (a.title || "").localeCompare(b.title || ""))
    : [];

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Open image modal
  const openImageModal = (imageUrl: string, title: string) => {
    setSelectedImage(imageUrl);
    setImageTitle(title);
    setZoomLevel(1); // Reset zoom level when opening a new image
  };

  // Close image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3)); // Max zoom 3x
  };

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5)); // Min zoom 0.5x
  };

  return (
    <div className="mt-10 px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Uploaded Memories</h2>
        <button
          onClick={toggleSortOrder}
          className="flex items-center gap-2 px-5 py-3 text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label={`Sort by title ${sortOrder === "asc" ? "descending" : "ascending"}`}
        >
          <span>Sort by Title</span>
          {sortOrder === "asc" ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedFiles.map((file) => (
          <div
            key={file.id}
            className={`p-5 rounded-lg shadow-lg transition hover:shadow-xl ${
              file.uploader.role === "caretaker" ? "bg-green-100 dark:bg-green-800" : "bg-blue-100 dark:bg-blue-800"
            }`}
          >
            <h3 className="text-xl font-semibold mb-2">{file.title}</h3>
            <p className="text-md text-gray-700 dark:text-gray-300 mb-3">{file.description}</p>
            <div className="cursor-pointer overflow-hidden" onClick={() => openImageModal(file.fileUrl, file.title)}>
              <img
                src={file.fileUrl || "/placeholder.svg"}
                alt={file.title}
                className="w-full h-auto mb-3 rounded-lg hover:opacity-90 transition-opacity"
              />
              <div className="text-center text-md text-gray-600 dark:text-gray-400">Click image to view full size</div>
            </div>
            <p className="text-md text-gray-500 dark:text-gray-300 mt-3">
              Uploaded by: {file.uploader.displayName || file.uploader.email}
            </p>
          </div>
        ))}
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-6"
          onClick={closeImageModal}
          style={{ animation: "fadeIn 0.3s ease-in-out" }}
        >
          {/* Title Bar at the Top */}
          <div className="absolute top-0 left-0 w-full bg-black bg-opacity-90 text-white text-center py-4">
            <h3 className="text-2xl font-bold">{imageTitle}</h3>
          </div>

          {/* Image Container */}
          <div
            className="relative max-w-5xl w-full max-h-screen overflow-hidden bg-white dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center p-6"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scaleIn 0.3s ease-out" }}
          >
            {/* Zoom & Close Buttons */}
            <div className="absolute top-6 right-6 flex gap-3 z-10">
              <button
                onClick={zoomIn}
                className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <ZoomIn className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
              <button
                onClick={zoomOut}
                className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <ZoomOut className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
              <button
                onClick={closeImageModal}
                className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                <X className="h-6 w-6 text-gray-900 dark:text-gray-100" />
              </button>
            </div>

            {/* Image */}
            <div className="overflow-auto flex items-center justify-center p-4">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt={imageTitle}
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
                className="cursor-move"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}