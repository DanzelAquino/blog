import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBlog } from '../hooks/useBlog';
import BlogCard from '../components/BlogCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home: React.FC = () => {
  const { isAuthenticated, userEmail } = useAuth();
  const { blogs, loading, getBlogs } = useBlog();

  useEffect(() => {
    getBlogs(1);
  }, [getBlogs]);

  const styles = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    hero: {
      textAlign: 'center' as 'center',
      padding: '48px 0',
      backgroundColor: '#eff6ff',
      borderRadius: '16px',
      marginBottom: '48px',
    },
    heroTitle: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '16px',
    },
    heroSubtitle: {
      fontSize: '18px',
      color: '#4b5563',
      maxWidth: '600px',
      margin: '0 auto 32px',
      lineHeight: '1.6',
    },
    authMessage: {
      fontSize: '16px',
      color: '#374151',
      marginBottom: '24px',
    },
    authButtons: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center',
    },
    section: {
      marginBottom: '48px',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
    },
    viewAllLink: {
      color: '#2563eb',
      fontWeight: '500',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
    },
    loadingContainer: {
      textAlign: 'center' as 'center',
      padding: '48px',
    },
    emptyState: {
      textAlign: 'center' as 'center',
      padding: '48px',
      color: '#6b7280',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Blogs</h1>
        
        {isAuthenticated ? (
          <div>
            <p style={styles.authMessage}>
              Welcome back, <strong>{userEmail}</strong>!
            </p>
            <div style={styles.authButtons}>
              <Link to="/create" className="btn btn-primary">
                Create New Blog
              </Link>
              <Link to="/blogs" className="btn btn-secondary">
                View All Blogs
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.authButtons}>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary">
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Blog Posts</h2>
          <Link to="/blogs" style={styles.viewAllLink}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            <LoadingSpinner size="large" />
          </div>
        ) : blogs.length === 0 ? (
          <div style={styles.emptyState}>
            <p className="text-lg">No blogs yet. Be the first to create one!</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {blogs.slice(0, 3).map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;