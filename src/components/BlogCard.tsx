import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Blog } from '../types';
import { useAuth } from '../hooks/useAuth';

interface BlogCardProps {
  blog: Blog;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  showActions = false,
  onEdit,
  onDelete 
}) => {
  const { userId } = useAuth();
  const isOwner = userId === blog.user_id;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const styles = {
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '20px',
      transition: 'box-shadow 0.2s',
    },
    cardHover: {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px',
    },
    date: {
      fontSize: '14px',
      color: '#6b7280',
      display: 'flex',
      alignItems: 'center',
    },
    updated: {
      fontSize: '12px',
      color: '#9ca3af',
      marginLeft: '8px',
      fontStyle: 'italic',
    },
    actions: {
      display: 'flex',
      gap: '8px',
    },
    content: {
      color: '#4b5563',
      marginBottom: '16px',
      lineHeight: '1.6',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical' as 'vertical',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '16px',
      borderTop: '1px solid #e5e7eb',
    },
    readMore: {
      color: '#2563eb',
      fontWeight: '500',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
    },
    readMoreIcon: {
      marginLeft: '4px',
    },
    ownerActions: {
      display: 'flex',
      gap: '12px',
    },
    ownerLink: {
      fontSize: '14px',
      color: '#6b7280',
      textDecoration: 'none',
    },
  };

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = styles.card.boxShadow;
      }}
    >
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>{blog.title}</h3>
          <div style={styles.date}>
            {formatDate(blog.created_at)}
            {blog.updated_at !== blog.created_at && (
              <span style={styles.updated}>(Updated)</span>
            )}
          </div>
        </div>
        
        {isOwner && showActions && (
          <div style={styles.actions}>
            {onEdit && (
              <button
                onClick={onEdit}
                className="btn btn-primary"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="btn btn-danger"
                style={{ fontSize: '14px', padding: '6px 12px' }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <p style={styles.content}>{blog.content}</p>
      
      <div style={styles.footer}>
        <Link to={`/blogs/${blog.id}`} style={styles.readMore}>
          Read full article
          <svg 
            style={styles.readMoreIcon}
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
        
        {isOwner && !showActions && (
          <div style={styles.ownerActions}>
            <Link to={`/edit/${blog.id}`} style={styles.ownerLink}>
              Edit
            </Link>
            <Link to={`/blogs/${blog.id}`} style={styles.ownerLink}>
              View
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogCard;