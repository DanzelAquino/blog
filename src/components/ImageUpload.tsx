import React, { useState, useRef } from "react";

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  onRemoveExisting?: () => void;
  existingImageUrl?: string;
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageChange,
  onRemoveExisting,
  existingImageUrl,
  error,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingImageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    onImageChange(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type.startsWith("image/")) {
      handleFileChange(file);
    }
  };

  const handleRemoveImage = () => {
    if (existingImageUrl && onRemoveExisting) {
      console.log("ImageUpload: Setting removeImage flag and clearing preview");
      onRemoveExisting();
      setPreviewUrl(null);
    } else {
      handleFileChange(null);
    }
  };

  const styles = {
    container: {
      marginBottom: "24px",
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "500",
      color: "#374151",
    },
    uploadArea: {
      border: `2px dashed ${
        isDragging ? "#2563eb" : error ? "#f87171" : "#d1d5db"
      }`,
      borderRadius: "8px",
      padding: "32px",
      textAlign: "center" as "center",
      cursor: "pointer",
      backgroundColor: isDragging ? "#eff6ff" : "#f9fafb",
      transition: "all 0.2s",
    },
    uploadContent: {
      display: "flex",
      flexDirection: "column" as "column",
      alignItems: "center",
      gap: "12px",
    },
    uploadIcon: {
      fontSize: "32px",
      color: "#9ca3af",
    },
    uploadText: {
      fontSize: "14px",
      color: "#6b7280",
    },
    uploadButton: {
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.2s",
    },
    uploadButtonHover: {
      backgroundColor: "#1d4ed8",
    },
    previewContainer: {
      marginTop: "16px",
      width: "100%",
    },
    previewImage: {
      maxWidth: "100%",
      maxHeight: "300px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "12px",
    },
    previewActions: {
      display: "flex",
      gap: "8px",
      justifyContent: "center",
    },
    removeButton: {
      backgroundColor: "#dc2626",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.2s",
    },
    removeButtonHover: {
      backgroundColor: "#b91c1c",
    },
    changeButton: {
      backgroundColor: "#6b7280",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.2s",
    },
    changeButtonHover: {
      backgroundColor: "#4b5563",
    },
    removalNote: {
      fontSize: "12px",
      color: "#dc2626",
      marginTop: "8px",
      fontStyle: "italic",
      textAlign: "center" as "center",
    },
    error: {
      color: "#dc2626",
      fontSize: "14px",
      marginTop: "4px",
    },
    fileInput: {
      display: "none",
    },
  };

  const [isUploadHovered, setIsUploadHovered] = useState(false);
  const [isRemoveHovered, setIsRemoveHovered] = useState(false);
  const [isChangeHovered, setIsChangeHovered] = useState(false);

  return (
    <div style={styles.container}>
      <label style={styles.label}>Blog Image (Optional)</label>

      <div
        style={styles.uploadArea}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div style={styles.uploadContent}>
          {previewUrl ? (
            <div style={styles.previewContainer}>
              <img src={previewUrl} alt="Preview" style={styles.previewImage} />
              <div style={styles.previewActions}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                  onMouseEnter={() => setIsRemoveHovered(true)}
                  onMouseLeave={() => setIsRemoveHovered(false)}
                  style={{
                    ...styles.removeButton,
                    ...(isRemoveHovered ? styles.removeButtonHover : {})
                  }}
                >
                  Remove Image
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  onMouseEnter={() => setIsChangeHovered(true)}
                  onMouseLeave={() => setIsChangeHovered(false)}
                  style={{
                    ...styles.changeButton,
                    ...(isChangeHovered ? styles.changeButtonHover : {})
                  }}
                >
                  Change Image
                </button>
              </div>
              {existingImageUrl && (
                <div style={styles.removalNote}>
                  Image will be permanently deleted when you save changes
                </div>
              )}
            </div>
          ) : (
            <>
              <div style={styles.uploadIcon}>📁</div>
              <p style={styles.uploadText}>
                Drag & drop an image here, or click to select
              </p>
              <button
                type="button"
                onMouseEnter={() => setIsUploadHovered(true)}
                onMouseLeave={() => setIsUploadHovered(false)}
                style={{
                  ...styles.uploadButton,
                  ...(isUploadHovered ? styles.uploadButtonHover : {})
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Image
              </button>
              <p style={styles.uploadText}>
                Supports JPG, PNG, GIF, WEBP (Max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        style={styles.fileInput}
      />

      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
};

export default ImageUpload;