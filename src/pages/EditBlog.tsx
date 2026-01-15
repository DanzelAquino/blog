import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "../hooks/useBlog";
import { useAuth } from "../hooks/useAuth";
import BlogForm from "../components/BlogForm";
import LoadingSpinner from "../components/LoadingSpinner";
import { BlogFormData } from "../utils/validationSchema";

const EditBlog: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentBlog,
    getBlogById,
    editBlog,
    loading,
    error,
    clearBlogError,
    clearBlog,
  } = useBlog();
  const { userId, isAuthenticated } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [initialData, setInitialData] = useState<Partial<BlogFormData>>({});

  const loadBlog = useCallback(async () => {
    if (!id) return;

    try {
      await getBlogById(id!);
    } catch (err) {
      console.error("Failed to load blog:", err);
      navigate("/blogs", { replace: true });
    }
  }, [id, getBlogById, navigate]);

  useEffect(() => {
    if (id) {
      loadBlog();
    }

    return () => {
      clearBlog();
    };
  }, [id, loadBlog, clearBlog]);

  useEffect(() => {
    if (currentBlog) {
      if (currentBlog.user_id === userId) {
        setIsAuthorized(true);
        setInitialData({
          title: currentBlog.title,
          content: currentBlog.content,
          existingImageUrl: currentBlog.image_url,
        });
      } else {
        setIsAuthorized(false);
      }
    }
  }, [currentBlog, userId]);

  const handleSubmit = async (data: BlogFormData) => {
    console.log("📝 EditBlog handleSubmit - Data received:", {
      id,
      title: data.title,
      hasImage: !!data.image,
      existingImageUrl: data.existingImageUrl, // This should be the original URL
      removeImage: data.removeImage,
    });

    if (!id) return;

    try {
      // Pass the original existingImageUrl from initialData, not from form data
      const imageToPass = data.removeImage ? null : data.image;

      const result = await editBlog({
        id,
        title: data.title,
        content: data.content,
        image: imageToPass,
        existingImageUrl: initialData.existingImageUrl, // Use original URL from initialData
        removeImage: data.removeImage,
      });

      console.log("✅ EditBlog editBlog result:", result);
      navigate("/blogs");
    } catch (err) {
      console.error("❌ Failed to update blog:", err);
    }
  };

  const styles = {
    page: {
      maxWidth: "800px",
      margin: "0 auto",
      padding: "40px 20px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "8px",
    },
    subtitle: {
      fontSize: "16px",
      color: "#6b7280",
    },
    denied: {
      textAlign: "center" as "center",
      padding: "60px 20px",
    },
    deniedTitle: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "16px",
      color: "#111827",
    },
    deniedText: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "24px",
      maxWidth: "400px",
      margin: "0 auto",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    },
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.page}>
        <div style={styles.denied}>
          <h2 style={styles.deniedTitle}>Access Denied</h2>
          <p style={styles.deniedText}>
            You need to be signed in to edit a blog post.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading && !currentBlog) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
        </div>
      </div>
    );
  }

  if (!isAuthorized && currentBlog) {
    return (
      <div style={styles.page}>
        <div style={styles.denied}>
          <h2 style={styles.deniedTitle}>Access Denied</h2>
          <p style={styles.deniedText}>
            You can only edit blogs that you have created.
          </p>
          <button
            onClick={() => navigate("/blogs")}
            className="btn btn-primary"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Edit Blog</h1>
        <p style={styles.subtitle}>
          Update your blog post to keep it fresh and engaging.
        </p>
      </div>

      <BlogForm
        onSubmit={handleSubmit}
        initialData={initialData}
        loading={loading}
        error={error}
        onClearError={clearBlogError}
        submitText="Update Blog"
      />
    </div>
  );
};

export default EditBlog;