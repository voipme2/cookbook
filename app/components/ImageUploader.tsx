import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (url: string, filename: string) => void;
  currentImage?: string;
  onRemoveImage?: () => void;
}

export function ImageUploader({
  onImageUpload,
  currentImage,
  onRemoveImage,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onImageUpload(data.url, data.filename);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      setError(errorMessage);
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onRemoveImage?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <label className="block font-bold mb-2">Recipe Image</label>

      {preview ? (
        <div className="space-y-3">
          <div className="relative border-2 border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800">
            <img
              src={preview}
              alt="Recipe preview"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              disabled={uploading}
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Click the X to remove this image, or upload a new one below.
          </p>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
        >
          <Upload className="mx-auto mb-2 text-gray-400 dark:text-slate-500" size={32} />
          <p className="text-gray-700 dark:text-slate-300 font-semibold mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            JPEG, PNG, WebP, or GIF (Max 5MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <span>Uploading image...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 dark:bg-red-950 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Hidden input to store the image path for form submission */}
      <input type="hidden" name="image" id="imageInput" />
    </div>
  );
}

