import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Category, Product, FilterOptions, DashboardStats } from '../types';
import { apiService } from '../services/api';

// State interface
interface AppState {
  categories: Category[];
  featuredProducts: Product[];
  latestProducts: Product[];
  filterOptions: FilterOptions | null;
  dashboardStats: DashboardStats | null;
  loading: {
    categories: boolean;
    featuredProducts: boolean;
    latestProducts: boolean;
    filterOptions: boolean;
    dashboardStats: boolean;
  };
  error: {
    categories: string | null;
    featuredProducts: string | null;
    latestProducts: string | null;
    filterOptions: string | null;
    dashboardStats: string | null;
  };
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: { key: keyof AppState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { key: keyof AppState['error']; error: string | null } }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_FEATURED_PRODUCTS'; payload: Product[] }
  | { type: 'SET_LATEST_PRODUCTS'; payload: Product[] }
  | { type: 'SET_FILTER_OPTIONS'; payload: FilterOptions }
  | { type: 'SET_DASHBOARD_STATS'; payload: DashboardStats };

// Initial state
const initialState: AppState = {
  categories: [],
  featuredProducts: [],
  latestProducts: [],
  filterOptions: null,
  dashboardStats: null,
  loading: {
    categories: false,
    featuredProducts: false,
    latestProducts: false,
    filterOptions: false,
    dashboardStats: false,
  },
  error: {
    categories: null,
    featuredProducts: null,
    latestProducts: null,
    filterOptions: null,
    dashboardStats: null,
  },
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
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
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_FEATURED_PRODUCTS':
      return { ...state, featuredProducts: action.payload };
    case 'SET_LATEST_PRODUCTS':
      return { ...state, latestProducts: action.payload };
    case 'SET_FILTER_OPTIONS':
      return { ...state, filterOptions: action.payload };
    case 'SET_DASHBOARD_STATS':
      return { ...state, dashboardStats: action.payload };
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  actions: {
    loadCategories: () => Promise<void>;
    loadFeaturedProducts: () => Promise<void>;
    loadLatestProducts: () => Promise<void>;
    loadFilterOptions: () => Promise<void>;
    loadDashboardStats: () => Promise<void>;
    refreshData: () => Promise<void>;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Helper function for async actions
  const createAsyncAction = <T,>(
    key: keyof AppState['loading'],
    apiCall: () => Promise<T>,
    successAction: (data: T) => AppAction
  ) => {
    return async () => {
      dispatch({ type: 'SET_LOADING', payload: { key, loading: true } });
      dispatch({ type: 'SET_ERROR', payload: { key, error: null } });
      
      try {
        const data = await apiCall();
        dispatch(successAction(data));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An error occurred';
        dispatch({ type: 'SET_ERROR', payload: { key, error: errorMessage } });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key, loading: false } });
      }
    };
  };

  // Actions
  const loadCategories = createAsyncAction(
    'categories',
    async () => {
      const response = await apiService.getCategories();
      return response.results;
    },
    (data) => ({ type: 'SET_CATEGORIES', payload: data })
  );

  const loadFeaturedProducts = createAsyncAction(
    'featuredProducts',
    () => apiService.getFeaturedProducts(),
    (data) => ({ type: 'SET_FEATURED_PRODUCTS', payload: data })
  );

  const loadLatestProducts = createAsyncAction(
    'latestProducts',
    () => apiService.getLatestProducts(),
    (data) => ({ type: 'SET_LATEST_PRODUCTS', payload: data })
  );

  const loadFilterOptions = createAsyncAction(
    'filterOptions',
    () => apiService.getFilterOptions(),
    (data) => ({ type: 'SET_FILTER_OPTIONS', payload: data })
  );

  const loadDashboardStats = createAsyncAction(
    'dashboardStats',
    () => apiService.getDashboardStats(),
    (data) => ({ type: 'SET_DASHBOARD_STATS', payload: data })
  );

  const refreshData = async () => {
    await Promise.all([
      loadCategories(),
      loadFeaturedProducts(),
      loadLatestProducts(),
      loadFilterOptions(),
      loadDashboardStats(),
    ]);
  };

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  const contextValue: AppContextType = {
    state,
    actions: {
      loadCategories,
      loadFeaturedProducts,
      loadLatestProducts,
      loadFilterOptions,
      loadDashboardStats,
      refreshData,
    },
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;