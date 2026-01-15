import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { blogSchema, BlogFormData } from "../utils/validationSchema";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormErrorMessage from "./FormErrorMessage";
import LoadingSpinner from "./LoadingSpinner";
import ImageUpload from "./ImageUpload";

interface BlogFormProps {
  onSubmit: (data: BlogFormData) => Promise<void>;
  initialData?: Partial<BlogFormData>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  submitText?: string;
}

const BlogForm: React.FC<BlogFormProps> = ({
  onSubmit,
  initialData,
  loading = false,
  error,
  onClearError,
  submitText = "Publish",
}) => {
  const [imageError, setImageError] = useState<string>("");
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<BlogFormData>({
    resolver: yupResolver(blogSchema) as any,
    mode: "onBlur",
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      existingImageUrl: initialData?.existingImageUrl || "",
      removeImage: false,
    },
  });

  const existingImageUrl = watch("existingImageUrl");

  const validateImage = (file: File | null): string => {
    if (!file) return "";

    if (file.size > 5 * 1024 * 1024) {
      return "File size is too large (max 5MB)";
    }

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return "Unsupported file format. Use JPG, PNG, GIF, or WEBP";
    }

    return "";
  };

  const handleImageChange = (file: File | null) => {
    const error = validateImage(file);
    setImageError(error);

    if (file) {
      setValue("removeImage", false);
      setImageRemoved(false);
      if (existingImageUrl) {
        setValue("existingImageUrl", "");
      }
    }

    if (error) {
      setValue("image", undefined);
    } else {
      setValue("image", file || undefined);
    }
  };

  const handleRemoveExisting = () => {
    console.log("BlogForm: Setting removeImage to true");
    setValue("removeImage", true);
    setValue("image", undefined);
    setImageRemoved(true);
  };

  const handleFormSubmit = async (data: BlogFormData) => {
    console.log("BlogForm onSubmit:", {
      image: data.image,
      existingImageUrl: data.existingImageUrl,
      removeImage: data.removeImage,
    });

    if (imageError) {
      return;
    }

    try {
      await onSubmit(data);
      reset({
        title: "",
        content: "",
        image: undefined,
        existingImageUrl: undefined,
        removeImage: false,
      });
      setImageError("");
      setImageRemoved(false);
    } catch (err) {
      console.error("Form submission failed:", err);
    }
  };

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column" as "column",
      gap: "24px",
    },
    formActions: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "16px",
    },
    tips: {
      fontSize: "14px",
      color: "#6b7280",
      marginBottom: "16px",
    },
    tipsList: {
      marginLeft: "20px",
      marginTop: "8px",
    },
    submitButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={styles.form}>
      {error && <FormErrorMessage message={error} onDismiss={onClearError} />}

      <FormInput
        label="Title"
        name="title"
        type="text"
        placeholder="Enter a catchy title for your blog"
        register={register}
        error={errors.title}
        required
        disabled={loading}
      />

      <ImageUpload
        onImageChange={handleImageChange}
        onRemoveExisting={handleRemoveExisting}
        existingImageUrl={imageRemoved ? undefined : initialData?.existingImageUrl}
        error={imageError}
      />

      <FormTextarea
        label="Content"
        name="content"
        placeholder="Write your blog content here. You can use markdown formatting."
        rows={15}
        register={register}
        error={errors.content}
        required
        disabled={loading}
      />

      <input type="hidden" {...register("removeImage")} />
      <input type="hidden" {...register("existingImageUrl")} />

      <div style={styles.tips}>
        <p>Tips for great content:</p>
        <ul style={styles.tipsList}>
          <li>Start with an engaging introduction</li>
          <li>Use clear headings and paragraphs</li>
          <li>Add examples and stories</li>
          <li>End with a conclusion or call-to-action</li>
        </ul>
      </div>

      <div style={styles.formActions}>
        <button
          type="button"
          onClick={() => reset()}
          disabled={isSubmitting || loading}
          className="btn btn-secondary"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={isSubmitting || loading || !!imageError}
          className="btn btn-primary"
          style={styles.submitButton}
        >
          {isSubmitting || loading ? (
            <>
              <LoadingSpinner size="small" />
              Publishing...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;