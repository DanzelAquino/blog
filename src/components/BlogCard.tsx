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
  deleteLoading?: boolean;
}

const BlogCard: React.FC<BlogCardProps> = ({ 
  blog, 
  showActions = false,
  onEdit,
  onDelete,
  deleteLoading = false
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

  // Truncate content for preview
  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  return (
    <article className="blog-card">
      {blog.image_url && (
        <div className="blog-card-image">
          <img 
            src={blog.image_url} 
            alt={blog.title}
            className="blog-image"
            loading="lazy"
          />
        </div>
      )}
      
      <div className="blog-card-content-wrapper">
        <div className="blog-card-header">
          <div className="blog-card-header-content">
            <h3 className="blog-card-title">{blog.title}</h3>
            <div className="blog-card-date">
              {formatDate(blog.created_at)}
              {blog.updated_at !== blog.created_at && (
                <span className="blog-card-updated">(Updated)</span>
              )}
            </div>
          </div>
          
          {isOwner && showActions && (
            <div className="blog-card-actions">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="btn btn-primary btn-sm"
                  disabled={deleteLoading}
                  aria-label={`Edit ${blog.title}`}
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="btn btn-danger btn-sm"
                  disabled={deleteLoading}
                  aria-label={`Delete ${blog.title}`}
                >
                  {deleteLoading ? (
                    <span className="deleting-text">Deleting...</span>
                  ) : (
                    'Delete'
                  )}
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="blog-card-content">
          <p>{truncateContent(blog.content)}</p>
        </div>
        
        <div className="blog-card-footer">
          <Link 
            to={`/blogs/${blog.id}`} 
            className="blog-card-read-more"
            aria-label={`Read full article: ${blog.title}`}
          >
            Read full article
            <svg 
              className="read-more-icon"
              width="16" 
              height="16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          {isOwner && !showActions && (
            <div className="blog-card-owner-actions">
              <Link 
                to={`/edit/${blog.id}`} 
                className="owner-link"
                aria-label={`Edit ${blog.title}`}
              >
                Edit
              </Link>
              <Link 
                to={`/blogs/${blog.id}`} 
                className="owner-link"
                aria-label={`View ${blog.title}`}
              >
                View
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;