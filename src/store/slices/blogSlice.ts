import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { supabase } from "../../utils/supabase";
import {
  Blog,
  CreateBlogData,
  UpdateBlogData,
  Comment,
  CreateCommentData,
  UpdateCommentData,
} from "../../types";

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  comments: Comment[];
  commentsLoading: boolean;
  commentsError: string | null;
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  totalCount: 0,
  page: 1,
  pageSize: 9,
  totalPages: 0,
  comments: [],
  commentsLoading: false,
  commentsError: null,
};

export const fetchBlogs = createAsyncThunk(
  "blogs/fetchBlogs",
  async (page: number, { rejectWithValue, signal }) => {
    try {
      const pageSize = 9;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const {
        data: blogs,
        error: blogsError,
        count,
      } = await supabase
        .from("blogs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      if (blogsError) throw blogsError;

      const blogIds = blogs?.map((blog) => blog.id) || [];

      let commentCounts: Record<string, number> = {};

      if (blogIds.length > 0) {
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("blog_id")
          .in("blog_id", blogIds);

        if (commentsError) throw commentsError;

        commentCounts =
          commentsData?.reduce(
            (acc, comment) => {
              acc[comment.blog_id] = (acc[comment.blog_id] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          ) || {};
      }

      const blogsWithCommentCount =
        blogs?.map((blog) => ({
          ...blog,
          comment_count: commentCounts[blog.id] || 0,
        })) || [];

      return {
        blogs: blogsWithCommentCount,
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to fetch blogs");
    }
  },
);

const uploadImage = async (
  file: File,
  userId: string,
  blogId: string,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${blogId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);

  return data.publicUrl;
};

const extractFilePathFromUrl = (imageUrl: string): string | null => {
  if (!imageUrl) return null;

  try {
    const blogImagesIndex = imageUrl.indexOf("blog-images/");
    if (blogImagesIndex !== -1) {
      const result = imageUrl.substring(
        blogImagesIndex + "blog-images/".length,
      );
      return result;
    }

    console.warn("🔍 No blog-images/ found in URL");
    return null;
  } catch (error) {
    console.error("🔍 URL parse error:", error);
    return null;
  }
};

const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) {
    console.log("No image URL provided for deletion");
    return;
  }

  try {
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn("Could not extract file path from URL");
      return;
    }

    const { error } = await supabase.storage
      .from("blog-images")
      .remove([filePath]);

    if (error) {
      console.error("Failed to delete image from storage:", error.message);
    }
  } catch (error: any) {
    console.error("Exception during image deletion:", error.message);
  }
};

export const createBlog = createAsyncThunk(
  "blogs/createBlog",
  async (blogData: CreateBlogData, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const { data: blog, error } = await supabase
        .from("blogs")
        .insert([
          {
            title: blogData.title,
            content: blogData.content,
            user_id: userData.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      let imageUrl: string | undefined;
      if (blogData.image) {
        imageUrl = await uploadImage(blogData.image, userData.user.id, blog.id);

        const { data: updatedBlog, error: updateError } = await supabase
          .from("blogs")
          .update({ image_url: imageUrl })
          .eq("id", blog.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return updatedBlog;
      }

      return blog;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to create blog");
    }
  },
);

export const updateBlog = createAsyncThunk(
  "blogs/updateBlog",
  async (
    {
      id,
      title,
      content,
      image,
      existingImageUrl,
      removeImage = false,
    }: UpdateBlogData & { removeImage?: boolean },
    { rejectWithValue },
  ) => {
    console.log("🔄 updateBlog called:", {
      id,
      removeImage,
      hasImage: !!image,
      existingImageUrl,
    });

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const updateData: any = {
        title,
        content,
        updated_at: new Date().toISOString(),
      };

      if (removeImage && existingImageUrl) {
        await deleteImageFromStorage(existingImageUrl);
        updateData.image_url = null;
      } else if (image === null && existingImageUrl) {
        await deleteImageFromStorage(existingImageUrl);
        updateData.image_url = null;
      } else if (image instanceof File) {
        if (existingImageUrl) {
          await deleteImageFromStorage(existingImageUrl);
        }
        updateData.image_url = await uploadImage(image, userData.user.id, id);
      }

      const { data, error } = await supabase
        .from("blogs")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userData.user.id)
        .select()
        .single();

      if (error) throw error;
      console.log("✅ updateBlog successful");
      return data;
    } catch (error: any) {
      console.error("❌ updateBlog error:", error);
      return rejectWithValue(error.message || "Failed to update blog");
    }
  },
);

export const deleteBlog = createAsyncThunk(
  "blogs/deleteBlog",
  async (id: string, { rejectWithValue, signal, getState }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const state = getState() as { blogs: BlogState };
      const blog =
        state.blogs.blogs.find((b) => b.id === id) || state.blogs.currentBlog;

      if (blog?.image_url) {
        console.log("Deleting associated image for blog:", id);
        await deleteImageFromStorage(blog.image_url);
      }

      const { error } = await supabase
        .from("blogs")
        .delete()
        .eq("id", id)
        .eq("user_id", userData.user.id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to delete blog");
    }
  },
);

export const fetchBlogById = createAsyncThunk(
  "blogs/fetchBlogById",
  async (id: string, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to fetch blog");
    }
  },
);

export const fetchComments = createAsyncThunk(
  "blogs/fetchComments",
  async (blogId: string, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data: currentUser } = await supabase.auth.getUser();
      const currentUserId = currentUser.user?.id;

      const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("blog_id", blogId)
        .order("created_at", { ascending: false });

      if (commentsError) throw commentsError;

      const commentsWithOwnerFlag = comments.map((comment) => ({
        ...comment,
        isOwner: comment.user_id === currentUserId,
      }));

      return commentsWithOwnerFlag;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to fetch comments");
    }
  },
);

export const createComment = createAsyncThunk(
  "blogs/createComment",
  async (commentData: CreateCommentData, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      let imageUrl: string | undefined;
      if (commentData.image) {
        const fileExt = commentData.image.name.split(".").pop();
        const fileName = `comments/${userData.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, commentData.image);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);
        imageUrl = data.publicUrl;
      }

      const { data: comment, error } = await supabase
        .from("comments")
        .insert([
          {
            blog_id: commentData.blog_id,
            user_id: userData.user.id,
            user_email: userData.user.email,
            content: commentData.content,
            image_url: imageUrl,
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      return {
        ...comment,
        isOwner: true,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to create comment");
    }
  },
);

export const deleteComment = createAsyncThunk(
  "blogs/deleteComment",
  async (commentId: string, { rejectWithValue, signal, getState }) => {
    try {
      if (signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const state = getState() as { blogs: BlogState };
      const comment = state.blogs.comments.find((c) => c.id === commentId);

      if (comment?.image_url) {
        const blogImagesIndex = comment.image_url.indexOf("blog-images/");
        if (blogImagesIndex !== -1) {
          const filePath = comment.image_url.substring(
            blogImagesIndex + "blog-images/".length,
          );
          await supabase.storage.from("blog-images").remove([filePath]);
        }
      }

      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userData.user.id);

      if (error) throw error;
      return commentId;
    } catch (error: any) {
      if (error.name === "AbortError") {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || "Failed to delete comment");
    }
  },
);

export const updateComment = createAsyncThunk(
  "blogs/updateComment",
  async (
    {
      id,
      content,
      image,
      existingImageUrl,
      removeImage = false,
    }: UpdateCommentData & { existingImageUrl?: string; removeImage?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");

      const updateData: any = {
        content,
        updated_at: new Date().toISOString(),
      };

      if (removeImage && existingImageUrl) {
        console.log("Removing comment image (removeImage flag)");
        const blogImagesIndex = existingImageUrl.indexOf("blog-images/");
        if (blogImagesIndex !== -1) {
          const filePath = existingImageUrl.substring(
            blogImagesIndex + "blog-images/".length,
          );
          await supabase.storage.from("blog-images").remove([filePath]);
        }
        updateData.image_url = null;
      } else if (image instanceof File) {
        console.log("Uploading new comment image");
        if (existingImageUrl) {
          const blogImagesIndex = existingImageUrl.indexOf("blog-images/");
          if (blogImagesIndex !== -1) {
            const filePath = existingImageUrl.substring(
              blogImagesIndex + "blog-images/".length,
            );
            await supabase.storage.from("blog-images").remove([filePath]);
          }
        }
        updateData.image_url = await uploadCommentImage(
          image,
          userData.user.id,
          id,
        );
      }

      console.log("Updating comment with:", updateData);

      const { data, error } = await supabase
        .from("comments")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userData.user.id)
        .select("*")
        .single();

      if (error) throw error;

      return {
        ...data,
        user_email: userData.user.email || "Unknown User",
        isOwner: true,
      };
    } catch (error: any) {
      console.error("updateComment error:", error);
      return rejectWithValue(error.message || "Failed to update comment");
    }
  },
);

const uploadCommentImage = async (
  file: File,
  userId: string,
  commentId: string,
): Promise<string> => {
  const fileExt = file.name.split(".").pop();
  const fileName = `comments/${userId}/${commentId}-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("blog-images")
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("blog-images").getPublicUrl(fileName);

  return data.publicUrl;
};

const blogSlice = createSlice({
  name: "blogs",
  initialState,
  reducers: {
    setCurrentBlog: (state, action: PayloadAction<Blog | null>) => {
      state.currentBlog = action.payload;
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetBlogState: (state) => {
      state.blogs = [];
      state.currentBlog = null;
      state.loading = false;
      state.error = null;
      state.totalCount = 0;
      state.page = 1;
      state.totalPages = 0;
    },
    setComments: (state, action: PayloadAction<Comment[]>) => {
      state.comments = action.payload;
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentsError = null;
    },
    clearCommentsError: (state) => {
      state.commentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBlogs.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogs.fulfilled, (state, action) => {
      if (action.payload) {
        state.loading = false;
        state.blogs = action.payload.blogs;
        state.totalCount = action.payload.totalCount;
        state.page = action.payload.page;
        state.totalPages = action.payload.totalPages;
      }
    });
    builder.addCase(fetchBlogs.rejected, (state, action) => {
      if (action.payload !== null) {
        state.loading = false;
        state.error = action.payload as string;
      } else {
        state.loading = false;
      }
    });

    builder.addCase(createBlog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBlog.fulfilled, (state, action) => {
      if (action.payload) {
        state.loading = false;
        state.blogs.unshift(action.payload);
        state.totalCount += 1;
        state.totalPages = Math.ceil(state.totalCount / state.pageSize);
      }
    });
    builder.addCase(createBlog.rejected, (state, action) => {
      if (action.payload !== null) {
        state.loading = false;
        state.error = action.payload as string;
      } else {
        state.loading = false;
      }
    });

    builder.addCase(updateBlog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBlog.fulfilled, (state, action) => {
      if (action.payload) {
        state.loading = false;
        const index = state.blogs.findIndex(
          (blog) => blog.id === action.payload?.id,
        );
        if (index !== -1) {
          state.blogs[index] = action.payload;
        }
        state.currentBlog = action.payload;
      }
    });
    builder.addCase(updateBlog.rejected, (state, action) => {
      if (action.payload !== null) {
        state.loading = false;
        state.error = action.payload as string;
      } else {
        state.loading = false;
      }
    });

    builder.addCase(deleteBlog.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBlog.fulfilled, (state, action) => {
      if (action.payload) {
        state.loading = false;
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload);
        state.totalCount -= 1;
        state.totalPages = Math.ceil(state.totalCount / state.pageSize);
      }
    });
    builder.addCase(deleteBlog.rejected, (state, action) => {
      if (action.payload !== null) {
        state.loading = false;
        state.error = action.payload as string;
      } else {
        state.loading = false;
      }
    });

    builder.addCase(fetchBlogById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBlogById.fulfilled, (state, action) => {
      if (action.payload) {
        state.loading = false;
        state.currentBlog = action.payload;
      }
    });
    builder.addCase(fetchBlogById.rejected, (state, action) => {
      if (action.payload !== null) {
        state.loading = false;
        state.error = action.payload as string;
      } else {
        state.loading = false;
      }
    });
    builder.addCase(fetchComments.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(fetchComments.fulfilled, (state, action) => {
      state.commentsLoading = false;
      state.comments = action.payload;
    });
    builder.addCase(fetchComments.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.payload as string;
    });

    builder.addCase(createComment.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.commentsLoading = false;
      state.comments.unshift(action.payload);
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.payload as string;
    });

    builder.addCase(deleteComment.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(deleteComment.fulfilled, (state, action) => {
      state.commentsLoading = false;
      state.comments = state.comments.filter(
        (comment) => comment.id !== action.payload,
      );
    });
    builder.addCase(deleteComment.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.payload as string;
    });
    builder.addCase(updateComment.pending, (state) => {
      state.commentsLoading = true;
      state.commentsError = null;
    });
    builder.addCase(updateComment.fulfilled, (state, action) => {
      state.commentsLoading = false;
      const index = state.comments.findIndex(
        (comment) => comment.id === action.payload?.id,
      );
      if (index !== -1) {
        state.comments[index] = action.payload;
      }
    });
    builder.addCase(updateComment.rejected, (state, action) => {
      state.commentsLoading = false;
      state.commentsError = action.payload as string;
    });
  },
});

export const {
  setCurrentBlog,
  clearCurrentBlog,
  setPage,
  clearError,
  resetBlogState,
  setComments,
  clearComments,
  clearCommentsError,
} = blogSlice.actions;

export default blogSlice.reducer;
