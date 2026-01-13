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

  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
    errorContainer: {
      textAlign: 'center' as 'center',
      padding: '60px 20px',
    },
    errorText: {
      color: '#dc2626',
      marginBottom: '16px',
      fontSize: '16px',
    },
    notFound: {
      textAlign: 'center' as 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    notFoundTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#111827',
    },
    notFoundText: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '24px',
      lineHeight: '1.5',
    },
    notFoundLink: {
      color: '#2563eb',
      fontWeight: '500',
      textDecoration: 'none',
      display: 'inline-block',
      padding: '8px 16px',
      border: '1px solid #2563eb',
      borderRadius: '6px',
    },
    article: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    header: {
      padding: '32px',
      borderBottom: '1px solid #e5e7eb',
    },
    headerTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '12px',
      lineHeight: '1.3',
    },
    dateInfo: {
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap' as 'wrap',
      gap: '8px',
    },
    updatedInfo: {
      fontSize: '14px',
      color: '#9ca3af',
      fontStyle: 'italic',
    },
    actions: {
      display: 'flex',
      gap: '12px',
      marginLeft: '16px',
    },
    content: {
      padding: '32px',
    },
    contentText: {
      color: '#4b5563',
      lineHeight: '1.8',
      fontSize: '16px',
      whiteSpace: 'pre-wrap' as 'pre-wrap',
    },
    footer: {
      padding: '24px 32px',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: '#f9fafb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backLink: {
      color: '#2563eb',
      fontWeight: '500',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
    },
    backIcon: {
      marginRight: '8px',
      width: '16px',
      height: '16px',
    },
    ownerInfo: {
      fontSize: '14px',
      color: '#6b7280',
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorText}>{error}</div>
        <Link to="/blogs" style={styles.notFoundLink}>
          Back to Blogs
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={styles.notFound}>
        <h2 style={styles.notFoundTitle}>Blog Not Found</h2>
        <p style={styles.notFoundText}>
          The blog you're looking for doesn't exist or has been removed.
        </p>
        <Link to="/blogs" style={styles.notFoundLink}>
          Browse all blogs
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <article style={styles.article}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <div style={{ flex: 1 }}>
              <h1 style={styles.title}>{blog.title}</h1>
              <div style={styles.dateInfo}>
                <span>Published on {formatDate(blog.created_at)}</span>
                {blog.updated_at !== blog.created_at && (
                  <span style={styles.updatedInfo}>
                    Last updated on {formatDate(blog.updated_at)}
                  </span>
                )}
              </div>
            </div>
            
            {isOwner && onDelete && (
              <div style={styles.actions}>
                <Link
                  to={`/edit/${blog.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  style={{ fontSize: '14px', padding: '8px 16px' }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.contentText}>
            {blog.content}
          </div>
        </div>

        <div style={styles.footer}>
          <Link
            to="/blogs"
            style={styles.backLink}
          >
            <svg style={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blogs
          </Link>
          
          <div style={styles.ownerInfo}>
            {isOwner ? 'Your blog post' : 'Shared blog'}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;