import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  fetchBlogById,
  setPage,
  clearCurrentBlog,
  clearError,
  resetBlogState,
} from '../store/slices/blogSlice';
import { CreateBlogData, UpdateBlogData } from '../types';

export const useBlog = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    blogs,
    currentBlog,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    totalPages,
  } = useAppSelector((state) => state.blogs);

  const getBlogs = useCallback(
    (pageNum: number = 1) => {
      dispatch(fetchBlogs(pageNum));
    },
    [dispatch]
  );

  const getBlogById = useCallback(
    async (id: string) => {
      try {
        return await dispatch(fetchBlogById(id)).unwrap();
      } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
          return null;
        }
        console.error('Failed to fetch blog:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const addBlog = useCallback(
    async (blogData: CreateBlogData) => {
      try {
        const result = await dispatch(createBlog(blogData)).unwrap();
        if (result) {
          navigate('/blogs');
        }
        return result;
      } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
          return null;
        }
        console.error('Failed to create blog:', error);
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const editBlog = useCallback(
    async (blogData: UpdateBlogData) => {
      try {
        const result = await dispatch(updateBlog(blogData)).unwrap();
        if (result) {
          navigate('/blogs');
        }
        return result;
      } catch (error) {
        console.error('Failed to update blog:', error);
        throw error;
      }
    },
    [dispatch, navigate]
  );

  const removeBlog = useCallback(
    async (id: string) => {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        return true;
      } catch (error) {
        if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
          return false;
        }
        console.error('Failed to delete blog:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const changePage = useCallback(
    (newPage: number) => {
      dispatch(setPage(newPage));
      dispatch(fetchBlogs(newPage));
    },
    [dispatch]
  );

  const clearBlog = useCallback(() => {
    dispatch(clearCurrentBlog());
  }, [dispatch]);

  const clearBlogError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const resetBlog = useCallback(() => {
    dispatch(resetBlogState());
  }, [dispatch]);

  return {
    // State
    blogs,
    currentBlog,
    loading,
    error,
    
    // Pagination
    page,
    pageSize,
    totalCount,
    totalPages,
    
    // Actions
    getBlogs,
    getBlogById,
    addBlog,
    editBlog,
    removeBlog,
    changePage,
    clearBlog,
    clearBlogError,
    resetBlog,
    
    // Helpers
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};