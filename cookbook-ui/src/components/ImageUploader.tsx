import React, { useRef, useState } from "react";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import ImageIcon from "@mui/icons-material/Image";

interface ImageData {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
}

interface ImageUploaderProps {
  onImageUploaded: (image: ImageData) => void;
  initialImageUrl?: string;
  recipeId?: string;
}

const uploadImage = async (
  formData: FormData,
  recipeId?: string,
): Promise<{ success: boolean; image: ImageData }> => {
  let endpoint = recipeId
    ? `/api/recipes/${recipeId}/image`
    : "/api/images/temp";
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error uploading image");
  }
  return response.json();
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageUploaded,
  initialImageUrl,
  recipeId,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string>(initialImageUrl || "");
  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending, error } = useMutation({
    mutationFn: (formData: FormData) => uploadImage(formData, recipeId),
    onSuccess: (data) => {
      if (data.success) {
        setPreview(data.image.path);
        onImageUploaded(data.image);
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

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    mutate(formData);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <form onSubmit={handleUpload}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="outlined"
            component="label"
            startIcon={<ImageIcon />}
            disabled={isPending}
            sx={{ minWidth: 120 }}
          >
            {file ? "Change Image" : "Select Image"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {file && (
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isPending}
              sx={{ minWidth: 120 }}
            >
              Upload
            </Button>
          )}
        </Stack>
        {isPending && <LinearProgress sx={{ mt: 2 }} />}
        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {(error as Error).message}
          </Typography>
        )}
        {preview && (
          <Box sx={{ mt: 2 }}>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxHeight: 180,
                borderRadius: 8,
                border: "1px solid #eee",
                boxShadow: "0 2px 8px #0001",
              }}
            />
          </Box>
        )}
      </form>
    </Box>
  );
};

export default ImageUploader;
