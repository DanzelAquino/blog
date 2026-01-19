import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBlog } from "../hooks/useBlog";
import BlogDetail from "../components/BlogDetail";
import FormErrorMessage from "../components/FormErrorMessage";

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
    clearBlog,
    comments,
    commentsLoading,
    commentsError,
    getComments,
    addComment,
    editComment,
    removeComment,
    clearCommentsList,
    clearCommentError,
  } = useBlog();
  const [isLoading, setIsLoading] = useState(true);

  const loadBlogAndComments = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await getBlogById(id);
      await getComments(id);
    } catch (err) {
      console.error("Failed to load blog:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, getBlogById, getComments]);

  useEffect(() => {
    if (id) {
      loadBlogAndComments();
    }

    return () => {
      clearBlog();
      clearCommentsList();
    };
  }, [id, loadBlogAndComments, clearBlog, clearCommentsList]);

  const handleDelete = async (blogId: string) => {
    try {
      await removeBlog(blogId);
    } catch (err) {
      console.error("Failed to delete blog:", err);
      throw err;
    }
  };

  const handleAddComment = async (content: string, image?: File) => {
    if (!id) return;

    try {
      await addComment({
        blog_id: id,
        content,
        image,
      });
      clearCommentError();
    } catch (err) {
      console.error("Failed to add comment:", err);
      throw err;
    }
  };

  const handleEditComment = async (
    commentId: string,
    content: string,
    image?: File,
    removeImage?: boolean,
    existingImageUrl?: string,
  ) => {
    try {
      await editComment({
        id: commentId,
        content,
        image,
        existingImageUrl, 
        removeImage,
      });
    } catch (err) {
      console.error("Failed to edit comment:", err);
      throw err;
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await removeComment(commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      throw err;
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
          onClick={() => navigate("/blogs")}
          className="btn btn-secondary"
          type="button"
        >
          <svg
            className="back-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Blogs
        </button>
      </div>

      {error && <FormErrorMessage message={error} onDismiss={clearBlogError} />}

      <BlogDetail
        blog={currentBlog}
        loading={loading}
        error={error}
        comments={comments}
        commentsLoading={commentsLoading}
        commentsError={commentsError}
        onDelete={handleDelete}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onEditComment={handleEditComment}
      />
    </div>
  );
};

export default BlogDetailPage;