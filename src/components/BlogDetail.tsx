import React from 'react';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { Blog } from '../types';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

interface BlogDetailProps {
  blog: Blog | null;
  loading: boolean;
  error: string | null;
  onDelete?: (id: string) => Promise<void>;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ 
  blog, 
  loading, 
  error,
  onDelete 
}) => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const isOwner = blog && userId === blog.user_id;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDelete = async () => {
    if (!blog || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await onDelete(blog.id);
        navigate('/blogs');
      } catch (error) {
        console.error('Failed to delete blog:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="blog-detail-loading-container">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-detail-error-container">
        <div className="blog-detail-error-text">{error}</div>
        <Link to="/blogs" className="blog-detail-not-found-link">
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-detail-not-found">
        <h2 className="blog-detail-not-found-title">Blog Not Found</h2>
        <p className="blog-detail-not-found-text">
          The blog you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/blogs" className="blog-detail-not-found-link">
          Browse all blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-detail-container">
      <article className="blog-detail-article">
        <div className="blog-detail-header">
          <div className="blog-detail-header-top">
            <div style={{ flex: 1 }}>
              <h1 className="blog-detail-title">{blog.title}</h1>
              <div className="blog-detail-date-info">
                <span>Published on {formatDate(blog.created_at)}</span>
                {blog.updated_at !== blog.created_at && (
                  <span className="blog-detail-updated-info">
                    Last updated on {formatDate(blog.updated_at)}
                  </span>
                )}
              </div>
            </div>
            
            {isOwner && onDelete && (
              <div className="blog-detail-actions">
                <Link
                  to={`/edit/${blog.id}`}
                  className="btn btn-primary blog-detail-edit-btn"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger blog-detail-delete-btn"
                  type="button"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {blog.image_url && (
          <div className="blog-detail-image-container">
            <img 
              src={blog.image_url} 
              alt={blog.title}
              className="blog-detail-image"
            />
          </div>
        )}

        <div className="blog-detail-content">
          <div className="blog-detail-content-text">
            {blog.content}
          </div>
        </div>

        <div className="blog-detail-footer">
          <Link
            to="/blogs"
            className="blog-detail-back-link"
          >
            <svg className="blog-detail-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
          
          <div className="blog-detail-owner-info">
            {isOwner ? 'Your blog post' : 'Shared blog'}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;