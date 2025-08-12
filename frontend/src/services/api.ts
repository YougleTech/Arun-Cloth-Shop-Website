import type {
  Category,
  DashboardStats,
  FilterOptions,
  PaginatedResponse,
  Product,
  ProductDetail,
  ProductReview,
  SearchResults
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
}

export const apiService = new ApiService();
export default apiService;