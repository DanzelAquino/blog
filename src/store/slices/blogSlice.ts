import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabase';
import { Blog, CreateBlogData, UpdateBlogData } from '../../types';

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
};

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (page: number, { rejectWithValue, signal }) => {
    try {
      const pageSize = 9;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { data, error, count } = await supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        blogs: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || 'Failed to fetch blogs');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blogs/createBlog',
  async (blogData: CreateBlogData, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('blogs')
        .insert([{
          title: blogData.title,
          content: blogData.content,
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blogs/updateBlog',
  async ({ id, title, content }: UpdateBlogData, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('blogs')
        .update({
          title,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blogs/deleteBlog',
  async (id: string, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id)
        .eq('user_id', userData.user.id);

      if (error) throw error;
      return id;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || 'Failed to delete blog');
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id: string, { rejectWithValue, signal }) => {
    try {
      if (signal.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return rejectWithValue(null);
      }
      return rejectWithValue(error.message || 'Failed to fetch blog');
    }
  }
);

const blogSlice = createSlice({
  name: 'blogs',
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
        const index = state.blogs.findIndex(blog => blog.id === action.payload?.id);
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
        state.blogs = state.blogs.filter(blog => blog.id !== action.payload);
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
  },
});

export const { 
  setCurrentBlog, 
  clearCurrentBlog, 
  setPage, 
  clearError,
  resetBlogState 
} = blogSlice.actions;

export default blogSlice.reducer;