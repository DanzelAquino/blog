import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import BlogDetail from '../components/BlogDetail';

const BlogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    currentBlog, 
    getBlogById, 
    removeBlog, 
    loading, 
    error, 
    clearBlogError,
    clearBlog 
  } = useBlog();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadBlog();
    }

    return () => {
      clearBlog();
    };
  }, [id]);

  const loadBlog = async () => {
    setIsLoading(true);
    try {
      await getBlogById(id!);
    } catch (err) {
      console.error('Failed to load blog:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (blogId: string) => {
    try {
      await removeBlog(blogId);
    } catch (err) {
      console.error('Failed to delete blog:', err);
      throw err;
    }
  };

  const handleRefresh = () => {
    if (id) {
      loadBlog();
    }
  };

  const styles = {
    page: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      minHeight: 'calc(100vh - 200px)',
    },
    backButton: {
      marginBottom: '24px',
    },
    backLink: {
      color: '#2563eb',
      fontWeight: '500',
      textDecoration: 'none',
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: '14px',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    backIcon: {
      marginRight: '8px',
      width: '16px',
      height: '16px',
    },
    errorContainer: {
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px',
    },
    errorContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    errorMessage: {
      display: 'flex',
      alignItems: 'center',
      color: '#dc2626',
    },
    errorIcon: {
      marginRight: '8px',
      width: '20px',
      height: '20px',
    },
    errorActions: {
      display: 'flex',
      gap: '16px',
    },
    errorButton: {
      background: 'none',
      border: 'none',
      color: '#2563eb',
      cursor: 'pointer',
      fontSize: '14px',
      padding: '4px 8px',
    },
    errorButtonDismiss: {
      color: '#dc2626',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
      fontSize: '16px',
      color: '#6b7280',
    },
  };

  if (isLoading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          Loading blog...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.backButton}>
        <button
          onClick={() => navigate('/blogs')}
          style={styles.backLink}
          type="button"
        >
          <svg 
            style={styles.backIcon} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Blogs
        </button>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorContent}>
            <div style={styles.errorMessage}>
              <svg 
                style={styles.errorIcon} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p>{error}</p>
            </div>
            <div style={styles.errorActions}>
              <button
                onClick={clearBlogError}
                style={{ ...styles.errorButton, ...styles.errorButtonDismiss }}
                type="button"
              >
                Dismiss
              </button>
              <button
                onClick={handleRefresh}
                style={styles.errorButton}
                type="button"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      <BlogDetail
        blog={currentBlog}
        loading={loading}
        error={error}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default BlogDetailPage;