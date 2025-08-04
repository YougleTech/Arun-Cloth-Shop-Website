import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { useAuth } from './AuthContext';

// Types
interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    main_image: string | null;
    material: string;
    gsm: number;
    primary_color: string;
    available_colors_list: string[];
    price_per_meter: string;
    wholesale_price: string;
    minimum_order_quantity: number;
    stock_quantity: number;
    category_name: string;
  };
  quantity: number;
  unit_price: string;
  wholesale_price: string;
  total_price: string;
  wholesale_total_price: string;
  preferred_colors: string;
  special_instructions: string;
  created_at: string;
  updated_at: string;
}

interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  total_amount: string;
  total_wholesale_amount: string;
  created_at: string;
  updated_at: string;
}

interface CartSummary {
  items_count: number;
  subtotal: string;
  discount_amount: string;
  tax_amount: string;
  shipping_cost: string;
  total_amount: string;
  is_wholesale_order: boolean;
  wholesale_discount_percent: string;
}

interface SavedItem {
  id: string;
  product: any;
  quantity: number;
  notes: string;
  created_at: string;
}

interface CartState {
  cart: Cart | null;
  cartSummary: CartSummary | null;
  savedItems: SavedItem[];
  loading: {
    cart: boolean;
    addItem: boolean;
    updateItem: boolean;
    removeItem: boolean;
    summary: boolean;
    savedItems: boolean;
  };
  error: {
    cart: string | null;
    addItem: string | null;
    updateItem: string | null;
    removeItem: string | null;
    summary: string | null;
    savedItems: string | null;
  };
}

type CartAction =
  | { type: 'SET_LOADING'; payload: { key: keyof CartState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof CartState['error']; error: string | null } }
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_CART_SUMMARY'; payload: CartSummary }
  | { type: 'SET_SAVED_ITEMS'; payload: SavedItem[] }
  | { type: 'CLEAR_CART' };

// Initial state
const initialState: CartState = {
  cart: null,
  cartSummary: null,
  savedItems: [],
  loading: {
    cart: false,
    addItem: false,
    updateItem: false,
    removeItem: false,
    summary: false,
    savedItems: false,
  },
  error: {
    cart: null,
    addItem: null,
    updateItem: null,
    removeItem: null,
    summary: null,
    savedItems: null,
  },
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.loading,
        },
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.error,
        },
      };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'SET_CART_SUMMARY':
      return { ...state, cartSummary: action.payload };
    case 'SET_SAVED_ITEMS':
      return { ...state, savedItems: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null, cartSummary: null };
    default:
      return state;
  }
}

// Cart Service
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api';

class CartService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
const config: RequestInit = {
  ...options,
  headers: {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  },
};

    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }
    
    return data;
  }

  async getCart(token: string): Promise<Cart> {
    return this.request('/cart/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async addToCart(token: string, productId: string, quantity: number, preferredColors?: string, specialInstructions?: string): Promise<{ cart: Cart; message: string }> {
    return this.request('/cart/add_item/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        product_id: productId,
        quantity,
        preferred_colors: preferredColors || '',
        special_instructions: specialInstructions || '',
      }),
    });
  }

  async updateCartItem(token: string, itemId: string, quantity: number, preferredColors?: string, specialInstructions?: string): Promise<{ cart: Cart; message: string }> {
    return this.request('/cart/update_item/', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        item_id: itemId,
        quantity,
        preferred_colors: preferredColors,
        special_instructions: specialInstructions,
      }),
    });
  }

  async removeFromCart(token: string, itemId: string): Promise<{ cart: Cart; message: string }> {
    return this.request('/cart/remove_item/', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item_id: itemId }),
    });
  }

  async clearCart(token: string): Promise<{ cart: Cart; message: string }> {
    return this.request('/cart/clear/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async saveForLater(token: string, itemId: string): Promise<{ message: string }> {
    return this.request('/cart/save_for_later/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ item_id: itemId }),
    });
  }

  async getCartSummary(token: string): Promise<CartSummary> {
    return this.request('/cart/summary/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getSavedItems(token: string): Promise<SavedItem[]> {
    return this.request('/saved-items/', {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async moveToCart(token: string, savedItemId: string): Promise<{ message: string; cart_item_id: string }> {
    return this.request(`/saved-items/${savedItemId}/move_to_cart/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async removeSavedItem(token: string, savedItemId: string): Promise<void> {
    return this.request(`/saved-items/${savedItemId}/`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
  }
}

const cartService = new CartService();

// Context
interface CartContextType {
  state: CartState;
  actions: {
    loadCart: () => Promise<void>;
    addToCart: (productId: string, quantity: number, preferredColors?: string, specialInstructions?: string) => Promise<void>;
    updateCartItem: (itemId: string, quantity: number, preferredColors?: string, specialInstructions?: string) => Promise<void>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    saveForLater: (itemId: string) => Promise<void>;
    loadCartSummary: () => Promise<void>;
    loadSavedItems: () => Promise<void>;
    moveToCart: (savedItemId: string) => Promise<void>;
    removeSavedItem: (savedItemId: string) => Promise<void>;
  };
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();

  // Helper function for async actions
  const createAsyncAction = <T,>(
    key: keyof CartState['loading'],
    apiCall: () => Promise<T>,
    successAction?: (data: T) => void
  ) => {
    return async () => {
      if (!authState.isAuthenticated || !authState.tokens) {
        dispatch({ type: 'SET_ERROR', payload: { key, error: 'Not authenticated' } });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: { key, loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key, error: null } });
      
      try {
        const data = await apiCall();
        if (successAction) {
          successAction(data);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        dispatch({ type: 'SET_ERROR', payload: { key, error: errorMessage } });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key, loading: false } });
      }
    };
  };

  // Actions
const loadCart = createAsyncAction(
  'cart',
  async () => {
    const data = await cartService.getCart(authState.tokens!.access);
    console.log("🛒 Cart API Response:", data); // 🔍 ADD THIS
    return data;
  },
  (data) => {
    console.log("📥 loadCart dispatching SET_CART with:", data); // 🔍 ADD THIS TOO
    dispatch({ type: 'SET_CART', payload: data });
  }
);

  const addToCart = async (productId: string, quantity: number, preferredColors?: string, specialInstructions?: string) => {
    if (!authState.isAuthenticated || !authState.tokens) {
      dispatch({ type: 'SET_ERROR', payload: { key: 'addItem', error: 'Not authenticated' } });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'addItem', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'addItem', error: null } });
    
    try {
      const response = await cartService.addToCart(authState.tokens.access, productId, quantity, preferredColors, specialInstructions);
      dispatch({ type: 'SET_CART', payload: response.cart });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: { key: 'addItem', error: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'addItem', loading: false } });
    }
  };

  const updateCartItem = async (itemId: string, quantity: number, preferredColors?: string, specialInstructions?: string) => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    dispatch({ type: 'SET_LOADING', payload: { key: 'updateItem', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'updateItem', error: null } });
    
    try {
      const response = await cartService.updateCartItem(authState.tokens.access, itemId, quantity, preferredColors, specialInstructions);
      dispatch({ type: 'SET_CART', payload: response.cart });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: { key: 'updateItem', error: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'updateItem', loading: false } });
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    dispatch({ type: 'SET_LOADING', payload: { key: 'removeItem', loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'removeItem', error: null } });
    
    try {
      const response = await cartService.removeFromCart(authState.tokens.access, itemId);
      dispatch({ type: 'SET_CART', payload: response.cart });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      dispatch({ type: 'SET_ERROR', payload: { key: 'removeItem', error: errorMessage } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'removeItem', loading: false } });
    }
  };

  const clearCart = async () => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    try {
      await cartService.clearCart(authState.tokens.access);
      dispatch({ type: 'CLEAR_CART' });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const saveForLater = async (itemId: string) => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    try {
      await cartService.saveForLater(authState.tokens.access, itemId);
      await loadCart();
      await loadSavedItems();
    } catch (error) {
      console.error('Error saving for later:', error);
    }
  };

  const loadCartSummary = createAsyncAction(
    'summary',
    () => cartService.getCartSummary(authState.tokens!.access),
    (data) => dispatch({ type: 'SET_CART_SUMMARY', payload: data })
  );

  const loadSavedItems = createAsyncAction(
    'savedItems',
    () => cartService.getSavedItems(authState.tokens!.access),
    (data) => dispatch({ type: 'SET_SAVED_ITEMS', payload: data })
  );

  const moveToCart = async (savedItemId: string) => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    try {
      await cartService.moveToCart(authState.tokens.access, savedItemId);
      await loadCart();
      await loadSavedItems();
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  const removeSavedItem = async (savedItemId: string) => {
    if (!authState.isAuthenticated || !authState.tokens) return;

    try {
      await cartService.removeSavedItem(authState.tokens.access, savedItemId);
      await loadSavedItems();
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  // Load cart when user logs in
useEffect(() => {
  if (authState.isAuthenticated && authState.tokens) {
    console.log("✅ loadCart triggered");
    loadCart();
    loadSavedItems();
  } else {
    console.log("❌ Not authenticated, skipping cart load");
  }
}, [authState.isAuthenticated, authState.tokens]);

  const contextValue: CartContextType = {
    state,
    actions: {
      loadCart,
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      saveForLater,
      loadCartSummary,
      loadSavedItems,
      moveToCart,
      removeSavedItem,
    },
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

// Hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;