import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { blogSchema, BlogFormData } from '../utils/validationSchema';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import FormErrorMessage from './FormError';
import LoadingSpinner from './LoadingSpinner';

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
  submitText = 'Publish',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BlogFormData>({
    resolver: yupResolver(blogSchema),
    mode: 'onBlur',
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
    },
  });

  const handleFormSubmit = async (data: BlogFormData) => {
    try {
      await onSubmit(data);
      reset();
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '24px',
    },
    formActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '16px',
    },
    tips: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '16px',
    },
    tipsList: {
      marginLeft: '20px',
      marginTop: '8px',
    },
    submitButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={styles.form}>
      {error && (
        <FormErrorMessage 
          message={error} 
          onDismiss={onClearError} 
        />
      )}

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
          disabled={isSubmitting || loading}
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