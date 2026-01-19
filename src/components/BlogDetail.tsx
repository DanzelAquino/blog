import React, { useState } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import { Blog } from "../types";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

interface BlogDetailProps {
  blog: Blog | null;
  loading: boolean;
  error: string | null;
  comments: any[];
  commentsLoading: boolean;
  commentsError: string | null;
  onDelete?: (id: string) => Promise<void>;
  onAddComment?: (content: string, image?: File) => Promise<void>;
  onEditComment?: (
    commentId: string,
    content: string,
    image?: File,
    removeImage?: boolean,
    existingImageUrl?: string,
  ) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  deleteLoadingId?: string;
}

const BlogDetail: React.FC<BlogDetailProps> = ({
  blog,
  loading,
  error,
  comments = [],
  commentsLoading = false,
  commentsError = null,
  onDelete,
  onAddComment,
  onEditComment,
  onDeleteComment,
  deleteLoadingId,
}) => {
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuth();
  const isOwner = blog && userId === blog.user_id;
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const commentsPerPage = 10;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM dd, yyyy • h:mm a");
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleDelete = async () => {
    if (!blog || !onDelete) return;

    if (
      window.confirm(
        "Are you sure you want to delete this blog? This action cannot be undone.",
      )
    ) {
      try {
        await onDelete(blog.id);
        navigate("/blogs");
      } catch (error) {
        console.error("Failed to delete blog:", error);
      }
    }
  };

  const handleAddComment = async (content: string, image?: File) => {
    if (!blog || !onAddComment) return;
    try {
      await onAddComment(content, image);
      setCommentsPage(1);
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleEditComment = async (
    commentId: string,
    content: string,
    image?: File,
    removeImage?: boolean,
  ) => {
    if (!blog || !onEditComment) return;

    setEditLoading(true);
    try {
      const comment = comments.find((c) => c.id === commentId);

      await onEditComment(
        commentId,
        content,
        image,
        removeImage,
        comment?.image_url,
      );
      setEditingCommentId(null);
    } catch (error) {
      console.error("Failed to edit comment:", error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleStartEdit = (commentId: string) => {
    setEditingCommentId(commentId);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) return;

    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await onDeleteComment(commentId);
        const currentPageComments = getCurrentPageComments();
        if (currentPageComments.length === 1 && commentsPage > 1) {
          setCommentsPage(commentsPage - 1);
        }
      } catch (error) {
        console.error("Failed to delete comment:", error);
      }
    }
  };

  const getCurrentPageComments = () => {
    const startIndex = (commentsPage - 1) * commentsPerPage;
    const endIndex = startIndex + commentsPerPage;
    return comments.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(comments.length / commentsPerPage);
  const currentPageComments = getCurrentPageComments();

  const handleNextPage = () => {
    if (commentsPage < totalPages) {
      setCommentsPage(commentsPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (commentsPage > 1) {
      setCommentsPage(commentsPage - 1);
    }
  };

  const goToPage = (pageNum: number) => {
    setCommentsPage(pageNum);
  };

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "400px",
    },
    errorContainer: {
      textAlign: "center" as const,
      padding: "60px 20px",
    },
    errorText: {
      color: "#dc2626",
      marginBottom: "16px",
      fontSize: "16px",
    },
    notFound: {
      textAlign: "center" as const,
      padding: "60px 20px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    notFoundTitle: {
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "16px",
      color: "#111827",
    },
    notFoundText: {
      fontSize: "16px",
      color: "#6b7280",
      marginBottom: "24px",
      lineHeight: "1.5",
    },
    notFoundLink: {
      color: "#2563eb",
      fontWeight: "500",
      textDecoration: "none",
      display: "inline-block",
      padding: "8px 16px",
      border: "1px solid #2563eb",
      borderRadius: "6px",
    },
    article: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    header: {
      padding: "32px",
      borderBottom: "1px solid #e5e7eb",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "16px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "bold",
      color: "#111827",
      marginBottom: "12px",
      lineHeight: "1.3",
    },
    dateInfo: {
      fontSize: "14px",
      color: "#6b7280",
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap" as const,
      gap: "8px",
    },
    updatedInfo: {
      fontSize: "14px",
      color: "#9ca3af",
      fontStyle: "italic",
    },
    actions: {
      display: "flex",
      gap: "12px",
      marginLeft: "16px",
    },
    imageContainer: {
      width: "100%",
      maxHeight: "400px",
      overflow: "hidden",
      marginBottom: "24px",
    },
    image: {
      width: "100%",
      height: "auto",
      maxHeight: "400px",
      objectFit: "cover" as const,
    },
    content: {
      padding: "32px",
    },
    contentText: {
      color: "#4b5563",
      lineHeight: "1.8",
      fontSize: "16px",
      whiteSpace: "pre-wrap" as const,
    },
    footer: {
      padding: "24px 32px",
      borderTop: "1px solid #e5e7eb",
      backgroundColor: "#f9fafb",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backLink: {
      color: "#2563eb",
      fontWeight: "500",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
    },
    backIcon: {
      marginRight: "8px",
      width: "16px",
      height: "16px",
    },
    ownerInfo: {
      fontSize: "14px",
      color: "#6b7280",
    },
    commentsSection: {
      marginTop: "40px",
    },
    commentsHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
      flexWrap: "wrap" as const,
      gap: "16px",
    },
    commentsTitle: {
      fontSize: "20px",
      fontWeight: "600",
      color: "#111827",
      margin: 0,
    },
    commentsCount: {
      fontSize: "14px",
      color: "#6b7280",
      backgroundColor: "#f3f4f6",
      padding: "4px 12px",
      borderRadius: "16px",
    },
    commentFormContainer: {
      backgroundColor: "white",
      padding: "24px",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "24px",
    },
    loginPrompt: {
      textAlign: "center" as const,
      padding: "20px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      marginBottom: "24px",
    },
    loginLink: {
      color: "#2563eb",
      fontWeight: "500",
      textDecoration: "none",
    },
    commentsList: {
      marginBottom: "24px",
    },
    noComments: {
      textAlign: "center" as const,
      padding: "32px",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      color: "#6b7280",
    },
    paginationContainer: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "12px",
      marginTop: "24px",
    },
    pageInfo: {
      fontSize: "14px",
      color: "#6b7280",
      textAlign: "center" as const,
    },
    paginationControls: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
      flexWrap: "wrap" as const,
    },
    pageButton: {
      padding: "8px 12px",
      border: "1px solid #d1d5db",
      borderRadius: "6px",
      backgroundColor: "white",
      color: "#374151",
      cursor: "pointer",
      fontSize: "14px",
      minWidth: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.2s",
    },
    pageButtonActive: {
      backgroundColor: "#2563eb",
      color: "white",
      borderColor: "#2563eb",
    },
    pageButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
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
                  style={{ fontSize: "14px", padding: "8px 16px" }}
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="btn btn-danger"
                  style={{ fontSize: "14px", padding: "8px 16px" }}
                  type="button"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {blog.image_url && (
          <div style={styles.imageContainer}>
            <img src={blog.image_url} alt={blog.title} style={styles.image} />
          </div>
        )}

        <div style={styles.content}>
          <div style={styles.contentText}>{blog.content}</div>
        </div>

        <div style={styles.footer}>
          <Link to="/blogs" style={styles.backLink}>
            <svg
              style={styles.backIcon}
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
          </Link>

          <div style={styles.ownerInfo}>
            {isOwner ? "Your blog post" : "Shared blog"}
          </div>
        </div>
      </article>

      <div style={styles.commentsSection}>
        <div style={styles.commentsHeader}>
          <h2 style={styles.commentsTitle}>Comments</h2>
          <div style={styles.commentsCount}>
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </div>
        </div>

        {isAuthenticated ? (
          <div style={styles.commentFormContainer}>
            <CommentForm
              onSubmit={async (data) => {
                if (blog) {
                  await handleAddComment(data.content, data.image);
                }
              }}
              loading={commentsLoading}
              error={commentsError}
              submitText="Post Comment"
            />
          </div>
        ) : (
          <div style={styles.loginPrompt}>
            <p>
              Please{" "}
              <Link to="/login" style={styles.loginLink}>
                sign in
              </Link>{" "}
              to leave a comment.
            </p>
          </div>
        )}

        <div style={styles.commentsList}>
          {commentsLoading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <LoadingSpinner size="medium" />
            </div>
          ) : currentPageComments.length > 0 ? (
            currentPageComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onDelete={
                  onDeleteComment
                    ? () => handleDeleteComment(comment.id)
                    : undefined
                }
                onEdit={
                  onEditComment
                    ? (id, content, image, removeImage) =>
                        handleEditComment(id, content, image, removeImage)
                    : undefined
                }
                onEditStart={handleStartEdit}
                onEditCancel={handleCancelEdit}
                isEditing={editingCommentId === comment.id}
                editLoading={editLoading && editingCommentId === comment.id}
                deleteLoading={deleteLoadingId === comment.id}
              />
            ))
          ) : (
            <div style={styles.noComments}>
              No comments yet. Be the first to comment!
            </div>
          )}

          {commentsError && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "6px",
                marginBottom: "16px",
              }}
            >
              {commentsError}
            </div>
          )}
        </div>

        {comments.length > commentsPerPage && (
          <div style={styles.paginationContainer}>
            <div style={styles.pageInfo}>
              Showing {((commentsPage - 1) * commentsPerPage) + 1}-
              {Math.min(commentsPage * commentsPerPage, comments.length)} of{" "}
              {comments.length} comments
            </div>
            
            <div style={styles.paginationControls}>
              <button
                onClick={handlePrevPage}
                disabled={commentsPage === 1}
                style={{
                  ...styles.pageButton,
                  ...(commentsPage === 1 ? styles.pageButtonDisabled : {})
                }}
              >
                Previous
              </button>
              
              <div style={{ display: "flex", gap: "4px" }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (commentsPage <= 3) {
                    pageNum = i + 1;
                  } else if (commentsPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = commentsPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      style={{
                        ...styles.pageButton,
                        ...(commentsPage === pageNum ? styles.pageButtonActive : {})
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={commentsPage === totalPages}
                style={{
                  ...styles.pageButton,
                  ...(commentsPage === totalPages ? styles.pageButtonDisabled : {})
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;