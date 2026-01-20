import React from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Blog } from "../types";
import { useAuth } from "../hooks/useAuth";

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
  deleteLoading = false,
}) => {
  const { userId } = useAuth();
  const isOwner = userId === blog.user_id;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  const styles = {
    card: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column" as "column",
      height: "100%",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    cardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.15)",
    },
    imageContainer: {
      width: "100%",
      height: "200px",
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: "100%",
      objectFit: "cover" as "cover",
      transition: "transform 0.3s ease",
    },
    imageHover: {
      transform: "scale(1.05)",
    },
    contentWrapper: {
      padding: "24px",
      display: "flex",
      flexDirection: "column" as "column",
      flexGrow: 1,
    },
    header: {
      display: "flex",
      flexDirection: "column" as "column",
      gap: "12px",
      marginBottom: "16px",
    },
    headerTop: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "16px",
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      color: "#111827",
      margin: 0,
      lineHeight: 1.3,
      display: "-webkit-box",
      WebkitLineClamp: 2,
      WebkitBoxOrient: "vertical" as "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    metaContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "8px",
    },
    metaLeft: {
      display: "flex",
      flexDirection: "column" as "column",
      gap: "4px",
    },
    dateInfo: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      color: "#6b7280",
    },
    updatedBadge: {
      fontSize: "12px",
      color: "#9ca3af",
      fontStyle: "italic",
      padding: "2px 6px",
      backgroundColor: "#f3f4f6",
      borderRadius: "4px",
    },
    commentCount: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
      color: "#6b7280",
    },
    commentIcon: {
      flexShrink: 0,
    },
    actionsContainer: {
      display: "flex",
      gap: "8px",
      marginLeft: "auto",
    },
    editButton: {
      padding: "6px 12px",
      backgroundColor: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 500,
      transition: "background-color 0.2s",
    },
    editButtonHover: {
      backgroundColor: "#1d4ed8",
    },
    deleteButton: {
      padding: "6px 12px",
      backgroundColor: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: 500,
      transition: "background-color 0.2s",
    },
    deleteButtonHover: {
      backgroundColor: "#b91c1c",
    },
    deleteButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    content: {
      color: "#4b5563",
      marginBottom: "16px",
      lineHeight: 1.6,
      flexGrow: 1,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrientation: "vertical" as "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: "16px",
      borderTop: "1px solid #e5e7eb",
      marginTop: "auto",
    },
    readMoreLink: {
      color: "#2563eb",
      fontWeight: 500,
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "14px",
      transition: "color 0.2s",
    },
    readMoreLinkHover: {
      color: "#1d4ed8",
      textDecoration: "underline",
    },
    readMoreIcon: {
      transition: "transform 0.2s",
    },
    readMoreIconHover: {
      transform: "translateX(2px)",
    },
    bottomActions: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    ownerLinks: {
      display: "flex",
      gap: "12px",
    },
    ownerLink: {
      fontSize: "14px",
      color: "#6b7280",
      textDecoration: "none",
      transition: "color 0.2s",
    },
    ownerLinkHover: {
      color: "#2563eb",
      textDecoration: "underline",
    },
    smallCommentCount: {
      display: "flex",
      alignItems: "center",
      gap: "4px",
      fontSize: "13px",
      color: "#6b7280",
      padding: "4px 8px",
      backgroundColor: "#f3f4f6",
      borderRadius: "12px",
    },
    commentCountFooter: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "13px",
      color: "#6b7280",
      marginTop: "12px",
      padding: "4px 8px",
      backgroundColor: "#f3f4f6",
      borderRadius: "6px",
      alignSelf: "flex-start",
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);
  const [isEditHovered, setIsEditHovered] = React.useState(false);
  const [isDeleteHovered, setIsDeleteHovered] = React.useState(false);
  const [isReadMoreHovered, setIsReadMoreHovered] = React.useState(false);
  const [isOwnerLinkHovered, setIsOwnerLinkHovered] = React.useState(false);

  return (
    <article
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="blog-card"
    >
      {blog.image_url && (
        <div style={styles.imageContainer}>
          <img
            src={blog.image_url}
            alt={blog.title}
            style={{
              ...styles.image,
              ...(isHovered ? styles.imageHover : {}),
            }}
            className="blog-image"
            loading="lazy"
          />
        </div>
      )}

      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <div style={styles.headerTop}>
            <h3 style={styles.title}>{blog.title}</h3>
            {isOwner && showActions && (
              <div style={styles.actionsContainer}>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    onMouseEnter={() => setIsEditHovered(true)}
                    onMouseLeave={() => setIsEditHovered(false)}
                    disabled={deleteLoading}
                    aria-label={`Edit ${blog.title}`}
                    style={{
                      ...styles.editButton,
                      ...(isEditHovered ? styles.editButtonHover : {}),
                    }}
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    onMouseEnter={() => setIsDeleteHovered(true)}
                    onMouseLeave={() => setIsDeleteHovered(false)}
                    disabled={deleteLoading}
                    aria-label={`Delete ${blog.title}`}
                    style={{
                      ...styles.deleteButton,
                      ...(isDeleteHovered ? styles.deleteButtonHover : {}),
                      ...(deleteLoading ? styles.deleteButtonDisabled : {}),
                    }}
                  >
                    {deleteLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span
                          style={{
                            width: "12px",
                            height: "12px",
                            border: "2px solid rgba(255, 255, 255, 0.3)",
                            borderTopColor: "white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        />
                        Deleting...
                      </span>
                    ) : (
                      "Delete"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          <div style={styles.metaContainer}>
            <div style={styles.metaLeft}>
              <div style={styles.dateInfo}>
                <span>{formatDate(blog.created_at)}</span>
                {blog.updated_at !== blog.created_at && (
                  <span style={styles.updatedBadge}>Updated</span>
                )}
              </div>
              <div style={styles.commentCount}>
                <svg
                  style={styles.commentIcon}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>
                  {blog.comment_count || 0} comment
                  {(blog.comment_count || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.content}>
          <p>{truncateContent(blog.content)}</p>
        </div>

        <div style={styles.footer}>
          <Link
            to={`/blogs/${blog.id}`}
            onMouseEnter={() => setIsReadMoreHovered(true)}
            onMouseLeave={() => setIsReadMoreHovered(false)}
            style={{
              ...styles.readMoreLink,
              ...(isReadMoreHovered ? styles.readMoreLinkHover : {}),
            }}
            aria-label={`Read full article: ${blog.title}`}
          >
            Read full article
            <svg
              style={{
                ...styles.readMoreIcon,
                ...(isReadMoreHovered ? styles.readMoreIconHover : {}),
              }}
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>

          {isOwner && !showActions && (
            <div style={styles.bottomActions}>
              <div style={styles.ownerLinks}>
                <Link
                  to={`/edit/${blog.id}`}
                  onMouseEnter={() => setIsOwnerLinkHovered(true)}
                  onMouseLeave={() => setIsOwnerLinkHovered(false)}
                  style={{
                    ...styles.ownerLink,
                    ...(isOwnerLinkHovered ? styles.ownerLinkHover : {}),
                  }}
                  aria-label={`Edit ${blog.title}`}
                >
                  Edit
                </Link>
                <Link
                  to={`/blogs/${blog.id}`}
                  onMouseEnter={() => setIsOwnerLinkHovered(true)}
                  onMouseLeave={() => setIsOwnerLinkHovered(false)}
                  style={{
                    ...styles.ownerLink,
                    ...(isOwnerLinkHovered ? styles.ownerLinkHover : {}),
                  }}
                  aria-label={`View ${blog.title}`}
                >
                  View
                </Link>
              </div>

              <div style={styles.smallCommentCount}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{blog.comment_count || 0}</span>
              </div>
            </div>
          )}

          {!isOwner && !showActions && (blog.comment_count || 0) > 0 && (
            <div style={styles.commentCountFooter}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>
                {blog.comment_count || 0}{" "}
                {(blog.comment_count || 0) === 1 ? "comment" : "comments"}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
