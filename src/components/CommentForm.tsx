import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import LoadingSpinner from './LoadingSpinner';
import ImageUpload from './ImageUpload';
import FormErrorMessage from './FormErrorMessage';

interface CommentFormProps {
  onSubmit: (data: { 
    content: string; 
    image?: File; 
    removeImage?: boolean;
    existingImageUrl?: string;
  }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  submitText?: string;
  initialContent?: string;
  existingImageUrl?: string;
}

const commentSchema = yup.object({
  content: yup
    .string()
    .required('Comment is required')
    .min(1, 'Comment must be at least 1 character')
    .max(1000, 'Comment must not exceed 1000 characters'),
});

type CommentFormData = yup.InferType<typeof commentSchema> & {
  image?: File;
  removeImage?: boolean;
  existingImageUrl?: string;
};

const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  loading = false,
  error,
  onClearError,
  submitText = 'Post Comment',
  initialContent = '',
  existingImageUrl,
}) => {
  const [imageError, setImageError] = useState<string>('');
  const [imageRemoved, setImageRemoved] = useState<boolean>(false);
  const [showImageUpload, setShowImageUpload] = useState<boolean>(false);
  const [hasImageInUpload, setHasImageInUpload] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CommentFormData>({
    resolver: yupResolver(commentSchema),
    mode: 'onBlur',
    defaultValues: {
      content: initialContent,
      existingImageUrl: existingImageUrl || '',
      removeImage: false,
    },
  });

  const currentImageUrl = watch('existingImageUrl');
  const imageFile = watch('image');

  useEffect(() => {
    if (existingImageUrl) {
      setShowImageUpload(true);
      setHasImageInUpload(true);
      setValue('existingImageUrl', existingImageUrl);
      setImageRemoved(false);
    } else {
      setValue('existingImageUrl', '');
      setImageRemoved(false);
    }
  }, [existingImageUrl, setValue]);

  useEffect(() => {
    if (initialContent) {
      setValue('content', initialContent);
    }
  }, [initialContent, setValue]);

  useEffect(() => {
    const hasImage = !!imageFile || (!!existingImageUrl && !imageRemoved);
    setHasImageInUpload(hasImage);
  }, [imageFile, existingImageUrl, imageRemoved]);

  const validateImage = (file: File | null): string => {
    if (!file) return '';

    if (file.size > 5 * 1024 * 1024) {
      return 'File size is too large (max 5MB)';
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Unsupported file format. Use JPG, PNG, GIF, or WEBP';
    }

    return '';
  };

  const handleImageChange = (file: File | null) => {
    const error = validateImage(file);
    setImageError(error);

    if (file) {
      setValue('removeImage', false);
      setImageRemoved(false);
      if (currentImageUrl) {
        setValue('existingImageUrl', '');
      }
    }

    if (error) {
      setValue('image', undefined);
    } else {
      setValue('image', file || undefined);
    }
  };

  const handleRemoveExisting = () => {
    console.log("CommentForm: Setting removeImage to true");
    setValue('removeImage', true);
    setValue('image', undefined);
    setImageRemoved(true);
    setShowImageUpload(true);
  };

  const handleToggleImageUpload = () => {
    if (showImageUpload && !hasImageInUpload) {
      setShowImageUpload(false);
    } else if (!showImageUpload) {
      setShowImageUpload(true);
    }
  };

  const handleFormSubmit = async (data: CommentFormData) => {
    console.log("CommentForm onSubmit:", {
      image: data.image,
      existingImageUrl: data.existingImageUrl,
      removeImage: data.removeImage,
    });

    if (imageError) {
      return;
    }

    try {
      await onSubmit({ 
        content: data.content, 
        image: data.image,
        removeImage: data.removeImage,
        existingImageUrl: data.existingImageUrl
      });
      
      if (!initialContent) {
        reset({
          content: '',
          image: undefined,
          existingImageUrl: undefined,
          removeImage: false,
        });
        setImageError('');
        setImageRemoved(false);
        setShowImageUpload(false);
        setHasImageInUpload(false);
      }
    } catch (err) {
      console.error('Comment submission failed:', err);
    }
  };

  const CameraIcon = ({ color = 'currentColor', size = 16 }: { color?: string, size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const CheckIcon = ({ color = 'currentColor', size = 16 }: { color?: string, size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const HideIcon = ({ color = 'currentColor', size = 16 }: { color?: string, size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth="2"
      />
      <path
        d="M9 9L15 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 9L9 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '16px',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: `1px solid ${errors.content ? '#f87171' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit',
      resize: 'vertical' as 'vertical',
      minHeight: '80px',
    },
    error: {
      color: '#dc2626',
      fontSize: '14px',
      marginTop: '4px',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
    },
    imageToggleButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: hasImageInUpload ? '#10b981' : (showImageUpload ? '#6b7280' : '#f3f4f6'),
      color: hasImageInUpload ? 'white' : (showImageUpload ? 'white' : '#4b5563'),
      padding: '8px 16px',
      borderRadius: '6px',
      border: `1px solid ${hasImageInUpload ? '#10b981' : (showImageUpload ? '#6b7280' : '#d1d5db')}`,
      cursor: hasImageInUpload ? 'default' : 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
      height: '40px',
      opacity: hasImageInUpload ? 1 : 1,
    },
    imageToggleButtonHover: {
      backgroundColor: hasImageInUpload ? '#10b981' : (showImageUpload ? '#4b5563' : '#e5e7eb'),
      borderColor: hasImageInUpload ? '#10b981' : (showImageUpload ? '#4b5563' : '#9ca3af'),
    },
    submitButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s',
      height: '40px',
    },
    submitButtonDisabled: {
      backgroundColor: '#93c5fd',
      cursor: 'not-allowed',
    },
    submitButtonHover: {
      backgroundColor: '#1d4ed8',
    },
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  };

  const [isImageToggleHovered, setIsImageToggleHovered] = useState(false);
  const [isSubmitButtonHovered, setIsSubmitButtonHovered] = useState(false);

  const getImageButtonText = () => {
    if (hasImageInUpload) return 'Image Added';
    if (!showImageUpload) return 'Add Image';
    return 'Hide Image Upload';
  };

  const getImageButtonIcon = () => {
    if (hasImageInUpload) {
      return <CheckIcon color="white" size={16} />;
    }
    if (!showImageUpload) {
      return <CameraIcon color="#4b5563" size={16} />;
    }
    return <HideIcon color="white" size={16} />;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={styles.form}>
      <div>
        <textarea
          placeholder="Write your comment here..."
          style={styles.textarea}
          {...register('content')}
          disabled={loading}
        />
        {errors.content && (
          <p style={styles.error}>{errors.content.message}</p>
        )}
      </div>

      {showImageUpload && (
        <ImageUpload
          onImageChange={handleImageChange}
          onRemoveExisting={handleRemoveExisting}
          existingImageUrl={imageRemoved ? undefined : existingImageUrl}
          error={imageError}
          optional={true}
        />
      )}

      <input type="hidden" {...register('removeImage')} />
      <input type="hidden" {...register('existingImageUrl')} />

      {error && <FormErrorMessage message={error} onDismiss={onClearError} />}

      <div style={styles.formActions}>
        <button
          type="button"
          onClick={handleToggleImageUpload}
          onMouseEnter={() => setIsImageToggleHovered(true)}
          onMouseLeave={() => setIsImageToggleHovered(false)}
          style={{
            ...styles.imageToggleButton,
            ...(isImageToggleHovered && !hasImageInUpload ? styles.imageToggleButtonHover : {}),
          }}
          disabled={hasImageInUpload}
        >
          <div style={styles.iconWrapper}>
            {getImageButtonIcon()}
          </div>
          {getImageButtonText()}
        </button>

        <button
          type="submit"
          disabled={isSubmitting || loading || !!imageError}
          onMouseEnter={() => setIsSubmitButtonHovered(true)}
          onMouseLeave={() => setIsSubmitButtonHovered(false)}
          style={{
            ...styles.submitButton,
            ...(isSubmitButtonHovered && !isSubmitting && !loading && !imageError 
              ? styles.submitButtonHover 
              : {}),
            ...((isSubmitting || loading || imageError) ? styles.submitButtonDisabled : {})
          }}
        >
          {isSubmitting || loading ? (
            <>
              <LoadingSpinner size="small" />
              {submitText.includes('Update') ? 'Updating...' : 'Posting...'}
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm;