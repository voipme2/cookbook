'use client';

import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Image as LucideImage } from "lucide-react";
import { api } from "@/lib/api";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  initialImageUrl?: string;
  recipeId?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUpload,
  initialImageUrl,
  recipeId,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(initialImageUrl || "");
  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (file: File) => {
      if (recipeId) {
        return api.uploadRecipeImage(recipeId, file);
      } else {
        return api.uploadImage(file);
      }
    },
    onSuccess: (data) => {
      if (data.success) {
        const imageUrl = recipeId 
          ? api.getImageUrl(`${recipeId}.jpg`)
          : api.getTempImageUrl(data.image.filename);
        setPreview(imageUrl);
        onImageUpload(imageUrl);
        setFile(null);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = () => {
    if (!file) return;
    mutate(file);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200">
          <LucideImage size={20} />
          <span>{file ? "Change Image" : "Select Image"}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        {file && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Upload
          </button>
        )}
      </div>
      {isPending && (
        <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
        </div>
      )}
      {error && (
        <p className="mt-2 text-red-600 dark:text-red-400 text-sm">
          {(error as Error).message}
        </p>
      )}
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 