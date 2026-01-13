import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import BlogDetail from '../components/BlogDetail';
import FormErrorMessage from '../components/FormErrorMessage';

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

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="back-button">
        <button
          onClick={() => navigate('/blogs')}
          className="btn btn-secondary"
          type="button"
        >
          <svg 
            className="back-icon" 
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
        <FormErrorMessage 
          message={error} 
          onDismiss={clearBlogError} 
        />
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