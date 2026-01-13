import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../hooks/useBlog';
import { useAuth } from '../hooks/useAuth';
import BlogForm from '../components/BlogForm';
import { BlogFormData } from '../utils/validationSchema';

const CreateBlog: React.FC = () => {
  const navigate = useNavigate();
  const { addBlog, loading, error, clearBlogError } = useBlog();
  const { isAuthenticated } = useAuth();

  const handleSubmit = async (data: BlogFormData) => {
    try {
      await addBlog(data);
      navigate('/blogs');
    } catch (err) {
      console.error('Failed to create blog:', err);
    }
  };

  const styles = {
    page: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '16px',
      color: '#6b7280',
    },
    denied: {
      textAlign: 'center' as 'center',
      padding: '60px 20px',
    },
    deniedTitle: {
      fontSize: '24px',
      fontWeight: '600',
      marginBottom: '16px',
      color: '#111827',
    },
    deniedText: {
      fontSize: '16px',
      color: '#6b7280',
      marginBottom: '24px',
      maxWidth: '400px',
      margin: '0 auto',
    },
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.denied}>
          <h2 style={styles.deniedTitle}>Access Denied</h2>
          <p style={styles.deniedText}>
            You need to be signed in to create a blog post.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Create New Blog</h1>
        <p style={styles.subtitle}>
          Share your thoughts, ideas, and stories with the world.
        </p>
      </div>

      <BlogForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
        onClearError={clearBlogError}
        submitText="Publish Blog"
      />
    </div>
  );
};

export default CreateBlog;