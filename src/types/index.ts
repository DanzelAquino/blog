export interface AuthUser {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface SignUpCredentials {
  email: string;
  password: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateBlogData {
  title: string;
  content: string;
}

export interface UpdateBlogData extends CreateBlogData {
  id: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BlogCardProps {
  blog: Blog;
  onEdit?: (blog: Blog) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export interface BlogFormProps {
  initialData?: CreateBlogData;
  onSubmit: (data: CreateBlogData) => Promise<void>;
  loading?: boolean;
  submitText?: string;
}

export interface SupabaseUser {
  id: string;
  email?: string;
  created_at?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BlogFormData {
  title: string;
  content: string;
}

export interface ValidationErrors {
  [key: string]: string;
}