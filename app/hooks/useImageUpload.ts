import { useState, useCallback, useEffect } from "react";

interface UseImageUploadOptions {
  initialImage?: string;
  inputId?: string;
}

interface UseImageUploadReturn {
  image: string;
  setImage: (url: string) => void;
  handleImageUpload: (url: string) => void;
  handleRemoveImage: () => void;
}

/**
 * Hook to manage image upload state and sync with hidden form input
 * Centralizes the image handling logic used in recipe create/edit forms
 */
export function useImageUpload({
  initialImage = "",
  inputId = "imageInput",
}: UseImageUploadOptions = {}): UseImageUploadReturn {
  const [image, setImage] = useState<string>(initialImage);

  // Sync hidden input with image state
  const syncHiddenInput = useCallback(
    (url: string) => {
      const imageInput = document.getElementById(inputId) as HTMLInputElement;
      if (imageInput) {
        imageInput.value = url;
      }
    },
    [inputId]
  );

  const handleImageUpload = useCallback(
    (url: string) => {
      setImage(url);
      syncHiddenInput(url);
    },
    [syncHiddenInput]
  );

  const handleRemoveImage = useCallback(() => {
    setImage("");
    syncHiddenInput("");
  }, [syncHiddenInput]);

  // Initialize hidden input with current image value on mount
  useEffect(() => {
    if (initialImage) {
      syncHiddenInput(initialImage);
    }
  }, [initialImage, syncHiddenInput]);

  return {
    image,
    setImage,
    handleImageUpload,
    handleRemoveImage,
  };
}
