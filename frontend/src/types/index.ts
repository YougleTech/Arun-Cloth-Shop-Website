// API Response Types
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  is_active: boolean;
  products_count: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  category_name: string;
  main_image: string | null;
  material: string;
  gsm: number;
  primary_color: string;
  available_colors_list: string[];
  price_per_meter: string;
  wholesale_price: string;
  minimum_order_quantity: number;
  is_available: boolean;
  is_featured: boolean;
  is_in_stock: boolean;
  tags: string;
  stock_quantity: number;
}

export interface ProductDetail extends Product {
  description: string;
  category: Category;
  images: ProductImage[];
  width: string;
  colors_available: string;
  usage: string;
  care_instructions: string;
  meta_title: string;
  meta_description: string;
  reviews_count: number;
  average_rating: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductReview {
  id: string;
  customer_name: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export interface FilterOptions {
  materials: string[];
  usages: string[];
  tags: string[];
  price_range: {
    min_price: number;
    max_price: number;
  };
  gsm_range: {
    min_gsm: number;
    max_gsm: number;
  };
}

export interface SearchResults {
  results: Product[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DashboardStats {
  total_products: number;
  total_categories: number;
  featured_products: number;
  out_of_stock: number;
}

// Form Types
export interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
  fabric_type?: string;
  quantity?: number;
}

export interface QuoteRequest extends ContactForm {
  fabric_type: string;
  quantity: number;
  usage: string;
  preferred_colors: string[];
  delivery_location: string;
  urgency: 'low' | 'medium' | 'high';
}