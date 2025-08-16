import type {
  BlogCategory,
  BlogComment,
  BlogPost,
  Category,
  CreateBlogPost,
  DashboardStats,
  FilterOptions,
  PaginatedResponse,
  Product,
  ProductDetail,
  ProductReview,
  SearchResults,
  UpdateBlogPost
} from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://arun.yougletech.com/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Categories API
  async getCategories(): Promise<PaginatedResponse<Category>> {
    return this.request<PaginatedResponse<Category>>('/categories/');
  }

  async getCategory(id: string): Promise<Category> {
    return this.request<Category>(`/categories/${id}/`);
  }

  async getCategoryProducts(
    id: string,
    filters: {
      material?: string;
      gsm_min?: number;
      gsm_max?: number;
      price_min?: number;
      price_max?: number;
      usage?: string;
      color?: string;
      sort_by?: string;
    } = {}
  ): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/categories/${id}/products/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Product[]>(endpoint);
  }

  // Products API
  async getProducts(
    filters: {
      category?: string;
      material?: string;
      usage?: string;
      tags?: string;
      is_featured?: boolean;
      price_min?: number;
      price_max?: number;
      gsm_min?: number;
      gsm_max?: number;
      color?: string;
      in_stock?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    } = {}
  ): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/products/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<Product>>(endpoint);
  }

  async getProduct(slug: string): Promise<ProductDetail> {
    return this.request<ProductDetail>(`/products/${slug}/`);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/featured/');
  }

  async getLatestProducts(): Promise<Product[]> {
    return this.request<Product[]>('/products/latest/');
  }

  async getProductReviews(slug: string): Promise<ProductReview[]> {
    return this.request<ProductReview[]>(`/products/${slug}/reviews/`);
  }

  async addProductReview(
    slug: string,
    review: {
      customer_name: string;
      customer_email: string;
      rating: number;
      review_text: string;
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/products/${slug}/add_review/`, {
      method: 'POST',
      body: JSON.stringify(review),
    });
  }

  // Search API
  async searchProducts(query: string): Promise<SearchResults> {
    const queryParams = new URLSearchParams({ q: query });
    return this.request<SearchResults>(`/search/?${queryParams}`);
  }

  // Filter Options API
  async getFilterOptions(): Promise<FilterOptions> {
    return this.request<FilterOptions>('/products/filter_options/');
  }

  // Dashboard Stats API
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats/');
  }

  // Utility methods for common use cases
  async getProductsByMaterial(material: string): Promise<Product[]> {
    const response = await this.getProducts({ material });
    return response.results;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const response = await this.getProducts({ category: categoryId });
    return response.results;
  }

  async getInStockProducts(): Promise<Product[]> {
    const response = await this.getProducts({ in_stock: true });
    return response.results;
  }

  // Blog API
  async getBlogPosts(
    filters: {
      category?: string;
      tag?: string;
      is_featured?: boolean;
      is_published?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    } = {}
  ): Promise<PaginatedResponse<BlogPost>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/blog/posts/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<BlogPost>>(endpoint);
  }

  async getBlogPost(slug: string): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog/posts/${slug}/`);
  }

  async getFeaturedBlogPosts(): Promise<BlogPost[]> {
    return this.request<BlogPost[]>('/blog/posts/featured/');
  }

  async getLatestBlogPosts(): Promise<BlogPost[]> {
    return this.request<BlogPost[]>('/blog/posts/latest/');
  }

  async getBlogCategories(): Promise<PaginatedResponse<BlogCategory>> {
    return this.request<PaginatedResponse<BlogCategory>>('/blog/categories/');
  }

  async getBlogCategory(slug: string): Promise<BlogCategory> {
    return this.request<BlogCategory>(`/blog/categories/${slug}/`);
  }

  async getBlogComments(postSlug: string): Promise<BlogComment[]> {
    return this.request<BlogComment[]>(`/blog/posts/${postSlug}/comments/`);
  }

  async addBlogComment(
    postSlug: string,
    comment: {
      author_name: string;
      author_email: string;
      content: string;
    }
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blog/posts/${postSlug}/add_comment/`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Admin Blog API
  async getAdminBlogPosts(
    filters: {
      category?: string;
      tag?: string;
      is_featured?: boolean;
      is_published?: boolean;
      search?: string;
      ordering?: string;
      page?: number;
    } = {}
  ): Promise<PaginatedResponse<BlogPost>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = `/blog/admin/posts/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<PaginatedResponse<BlogPost>>(endpoint, {
      headers: this.getAuthHeaders(),
    });
  }

  async getAdminBlogPost(id: string): Promise<BlogPost> {
    return this.request<BlogPost>(`/blog/admin/posts/${id}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  async createBlogPost(postData: CreateBlogPost): Promise<BlogPost> {
    const formData = new FormData();
    
    Object.entries(postData).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => formData.append('tags', tag));
      } else if (key === 'featured_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.request<BlogPost>('/blog/admin/posts/create/', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
  }

  async updateBlogPost(postData: UpdateBlogPost): Promise<BlogPost> {
    const { id, ...updateData } = postData;
    const formData = new FormData();
    
    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => formData.append('tags', tag));
      } else if (key === 'featured_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    return this.request<BlogPost>(`/blog/admin/posts/${id}/update/`, {
      method: 'PATCH',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });
  }

  async deleteBlogPost(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blog/admin/posts/${id}/delete/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  async createBlogCategory(categoryData: {
    name: string;
    description: string;
    is_active: boolean;
  }): Promise<BlogCategory> {
    return this.request<BlogCategory>('/blog/admin/categories/', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
  }

  async updateBlogCategory(id: string, categoryData: Partial<{
    name: string;
    description: string;
    is_active: boolean;
  }>): Promise<BlogCategory> {
    return this.request<BlogCategory>(`/blog/admin/categories/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    });
  }

  async deleteBlogCategory(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/blog/admin/categories/${id}/`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): Record<string, string> {
    try {
      const tokensStr = localStorage.getItem('auth_tokens');
      if (tokensStr) {
        const tokens = JSON.parse(tokensStr);
        return tokens.access ? { Authorization: `Bearer ${tokens.access}` } : {};
      }
    } catch (error) {
      console.error('Error parsing auth tokens:', error);
    }
    return {};
  }
}

export const apiService = new ApiService();
export default apiService;