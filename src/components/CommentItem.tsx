import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Comment } from '../types';
import { useAuth } from '../hooks/useAuth';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: Comment;
  onDelete?: (id: string) => Promise<void>;
  onEdit?: (id: string, content: string, image?: File, removeImage?: boolean) => Promise<void>;
  onEditStart?: (commentId: string) => void;
  onEditCancel?: () => void;
  isEditing?: boolean;
  editLoading?: boolean;
  deleteLoading?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onDelete,
  onEdit,
  onEditStart,
  onEditCancel,
  isEditing = false,
  editLoading = false,
  deleteLoading = false,
}) => {
  const { userId } = useAuth();
  const isOwner = userId === comment.user_id;
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleEditSubmit = async (data: { content: string; image?: File; removeImage?: boolean }) => {
    if (onEdit) {
      await onEdit(comment.id, data.content, data.image, data.removeImage);
    }
  };

  const handleDelete = async () => {
    if (onDelete && window.confirm('Are you sure you want to delete this comment?')) {
      await onDelete(comment.id);
    }
    setShowMenu(false);
  };

  const handleStartEdit = () => {
    if (onEditStart) {
      onEditStart(comment.id);
    }
    setShowMenu(false);
  };

  const styles = {
    container: {
      padding: '16px',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '12px',
      backgroundColor: 'white',
      position: 'relative' as 'relative',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    userAvatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      backgroundColor: '#2563eb',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    userDetails: {
      display: 'flex',
      flexDirection: 'column' as 'column',
    },
    userEmail: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#111827',
    },
    commentDate: {
      fontSize: '12px',
      color: '#6b7280',
    },
    actions: {
      display: 'flex',
      gap: '8px',
    },
    cancelButton: {
      padding: '4px 8px',
      fontSize: '12px',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      backgroundColor: '#6b7280',
      color: 'white',
      transition: 'background-color 0.2s',
    },
    cancelButtonHover: {
      backgroundColor: '#4b5563',
    },
    menuButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#6b7280',
      transition: 'background-color 0.2s',
    },
    menuButtonHover: {
      backgroundColor: '#f3f4f6',
    },
    menuDropdown: {
      position: 'absolute' as 'absolute',
      top: '40px',
      right: '16px',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      minWidth: '120px',
    },
    menuItem: {
      padding: '8px 12px',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left' as 'left',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color: '#374151',
    },
    menuItemHover: {
      backgroundColor: '#f9fafb',
    },
    editMenuItem: {
      color: '#2563eb',
    },
    deleteMenuItem: {
      color: '#dc2626',
    },
    content: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '12px',
      whiteSpace: 'pre-wrap' as 'pre-wrap',
    },
    imageContainer: {
      marginTop: '12px',
    },
    image: {
      maxWidth: '100%',
      maxHeight: '300px',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
    },
    editingForm: {
      marginTop: '12px',
    },
  };

  const [isMenuButtonHovered, setIsMenuButtonHovered] = useState(false);
  const [isEditItemHovered, setIsEditItemHovered] = useState(false);
  const [isDeleteItemHovered, setIsDeleteItemHovered] = useState(false);
  const [isCancelButtonHovered, setIsCancelButtonHovered] = useState(false);

  if (isEditing) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {comment.user_email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userDetails}>
              <span style={styles.userEmail}>{comment.user_email || 'User'}</span>
              <span style={styles.commentDate}>{formatDate(comment.created_at)}</span>
            </div>
          </div>
          <div style={styles.actions}>
            <button
              type="button"
              onClick={onEditCancel}
              onMouseEnter={() => setIsCancelButtonHovered(true)}
              onMouseLeave={() => setIsCancelButtonHovered(false)}
              disabled={editLoading}
              style={{
                ...styles.cancelButton,
                ...(isCancelButtonHovered ? styles.cancelButtonHover : {}),
                ...(editLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
              }}
            >
              Cancel
            </button>
          </div>
        </div>
        
        <div style={styles.editingForm}>
          <CommentForm
            onSubmit={handleEditSubmit}
            loading={editLoading}
            initialContent={comment.content}
            existingImageUrl={comment.image_url}
            submitText="Update Comment"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.userInfo}>
          <div style={styles.userAvatar}>
            {comment.user_email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div style={styles.userDetails}>
            <span style={styles.userEmail}>{comment.user_email || 'User'}</span>
            <span style={styles.commentDate}>{formatDate(comment.created_at)}</span>
          </div>
        </div>
        
        {isOwner && (onDelete || onEditStart) && (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              onMouseEnter={() => setIsMenuButtonHovered(true)}
              onMouseLeave={() => setIsMenuButtonHovered(false)}
              style={{
                ...styles.menuButton,
                ...(isMenuButtonHovered ? styles.menuButtonHover : {})
              }}
              aria-label="Comment options"
            >
              <svg 
                width="16" 
                height="16" 
                fill="currentColor" 
                viewBox="0 0 16 16"
              >
                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
              </svg>
            </button>
            
            {showMenu && (
              <div style={styles.menuDropdown}>
                {onEditStart && (
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    onMouseEnter={() => setIsEditItemHovered(true)}
                    onMouseLeave={() => setIsEditItemHovered(false)}
                    style={{
                      ...styles.menuItem,
                      ...styles.editMenuItem,
                      ...(isEditItemHovered ? styles.menuItemHover : {})
                    }}
                    disabled={editLoading}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                    </svg>
                    Edit
                  </button>
                )}
                
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    onMouseEnter={() => setIsDeleteItemHovered(true)}
                    onMouseLeave={() => setIsDeleteItemHovered(false)}
                    style={{
                      ...styles.menuItem,
                      ...styles.deleteMenuItem,
                      ...(isDeleteItemHovered ? styles.menuItemHover : {})
                    }}
                    disabled={deleteLoading}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                    </svg>
                    {deleteLoading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={styles.content}>{comment.content}</div>
      
      {comment.image_url && (
        <div style={styles.imageContainer}>
          <img 
            src={comment.image_url} 
            alt="Comment attachment" 
            style={styles.image}
          />
        </div>
      )}
    </div>
  );
};

export default CommentItem;