import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { useAuth } from '../hooks/useAuth';
import BlogCard from '../components/BlogCard';
import FormErrorMessage from '../components/FormErrorMessage';
import { Blog } from '../types';

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const {
    blogs,
    loading,
    error,
    totalPages,
    getBlogs,
    clearBlogError,
    removeBlog,
  } = useBlog();
  
  const { isAuthenticated, userId } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    getBlogs(currentPage);
  }, [getBlogs, currentPage]);

  const handleDelete = async (blogId: string, blogTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await removeBlog(blogId);
      getBlogs(currentPage);
    } catch (err) {
      console.error('Failed to delete blog:', err);
    }
  };

  const handleEdit = (blogId: string) => {
    navigate(`/edit/${blogId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    setCurrentPage(pageNum);
  };

  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    header: {
      marginBottom: '32px',
    },
    headerTop: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '16px',
      marginBottom: '16px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
    },
    createButton: {
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '24px',
      marginBottom: '40px',
    },
    emptyState: {
      textAlign: 'center' as 'center',
      padding: '60px 20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    emptyIcon: {
      fontSize: '48px',
      marginBottom: '16px',
      color: '#9ca3af',
    },
    emptyTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px',
    },
    emptyText: {
      fontSize: '14px',
      color: '#6b7280',
      maxWidth: '400px',
      margin: '0 auto 24px',
      lineHeight: '1.5',
    },
    pagination: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      gap: '16px',
      marginTop: '40px',
      paddingTop: '24px',
      borderTop: '1px solid #e5e7eb',
    },
    pageInfo: {
      fontSize: '14px',
      color: '#6b7280',
      textAlign: 'center' as 'center',
    },
    paginationControls: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
    },
    pageButton: {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      color: '#374151',
      cursor: 'pointer',
      fontSize: '14px',
    },
    pageButtonActive: {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb',
    },
    pageButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '400px',
    },
  };

  if (loading && blogs.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>All Blog Posts</h1>
            <p style={styles.subtitle}>
              Discover articles, stories, and insights from our community
            </p>
          </div>
          {isAuthenticated && (
            <div>
              <Link
                to="/create"
                className="btn btn-primary"
                style={styles.createButton}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Blog
              </Link>
            </div>
          )}
        </div>

        {error && (
          <div style={{ marginBottom: '24px' }}>
            <FormErrorMessage 
              message={error} 
              onDismiss={clearBlogError} 
            />
          </div>
        )}
      </div>

      {blogs.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📝</div>
          <h3 style={styles.emptyTitle}>No blogs yet</h3>
          <p style={styles.emptyText}>
            {isAuthenticated 
              ? "You haven't created any blog posts yet. Start sharing your thoughts with the world!"
              : "Be the first to create a blog post! Sign in to get started."
            }
          </p>
          {isAuthenticated ? (
            <Link
              to="/create"
              className="btn btn-primary"
            >
              Create Your First Blog
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn btn-primary"
            >
              Sign In to Get Started
            </Link>
          )}
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {blogs.map((blog: Blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                showActions={userId === blog.user_id}
                onEdit={() => handleEdit(blog.id)}
                onDelete={() => handleDelete(blog.id, blog.title)}
                deleteLoading={false}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <div style={styles.pageInfo}>
                Showing page {currentPage} of {totalPages}
              </div>
              
              <div style={styles.paginationControls}>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1 || loading}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === 1 || loading ? styles.pageButtonDisabled : {})
                  }}
                >
                  Previous
                </button>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        style={{
                          ...styles.pageButton,
                          ...(currentPage === pageNum ? styles.pageButtonActive : {})
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || loading}
                  style={{
                    ...styles.pageButton,
                    ...(currentPage === totalPages || loading ? styles.pageButtonDisabled : {})
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogList;