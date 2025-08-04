import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

// Types
interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  phone: string;
  company_name: string;
  business_type: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  profile_image: string | null;
  preferred_language: string;
  is_wholesale_customer: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: string;
  is_staff: boolean;
  last_login: string | null;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface LoginResponse {
  refresh: any;
  access: any;
  user: User;
  tokens: AuthTokens;
}

interface RegisterResponse {
  refresh: any;
  access: any;
  user: User;
  tokens: AuthTokens;
}

interface RefreshTokenResponse {
  access: string;
}

interface UpdateProfileResponse {
  user: User;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_TOKENS':
      return { ...state, tokens: action.payload };
    default:
      return state;
  }
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api';

class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'An error occurred');
    }

    return data as T;
  }

  async register(userData: any): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/accounts/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request<LoginResponse>('/accounts/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout(refreshToken: string): Promise<void> {
    await this.request('/accounts/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.request<RefreshTokenResponse>('/auth/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  }

  async getProfile(accessToken: string): Promise<User> {
    return this.request<User>('/accounts/profile/me/', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async updateProfile(accessToken: string, profileData: any): Promise<UpdateProfileResponse> {
    return this.request<UpdateProfileResponse>('/accounts/profile/update_profile/', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(accessToken: string, passwordData: any): Promise<void> {
    await this.request('/accounts/profile/change_password/', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.request('/accounts/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await this.request('/accounts/reset-password/', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: password,
        new_password_confirm: password,
      }),
    });
  }

  async checkAvailability(field: string, value: string): Promise<any> {
    const params = new URLSearchParams({ [field]: value });
    return this.request(`/accounts/check-availability/?${params}`);
  }
}

const authService = new AuthService();

interface AuthContextType {
  state: AuthState;
  actions: {
    login: (email: string, password: string) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: any) => Promise<void>;
    changePassword: (passwordData: any) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    checkAvailability: (field: string, value: string) => Promise<any>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'auth_user',
  TOKENS: 'auth_tokens',
};

const storage = {
  getUser: (): User | null => {
    try {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  getTokens: (): AuthTokens | null => {
    try {
      const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      return null;
    }
  },
  setTokens: (tokens: AuthTokens) => {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

useEffect(() => {
  const user = storage.getUser();
  const tokens = storage.getTokens();

  console.log("🔐 Rehydrating Auth from storage:", { user, tokens }); // ✅ Debug

  if (user && tokens) {
    dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
  }
}, []);

  useEffect(() => {
    if (!state.tokens) return;

    const refreshTokenTimer = setInterval(async () => {
      try {
        const response = await authService.refreshToken(state.tokens!.refresh);
        const newTokens = { access: response.access, refresh: state.tokens!.refresh };

        dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
        storage.setTokens(newTokens);
      } catch (error) {
        console.error('Token refresh failed:', error);
        dispatch({ type: 'LOGOUT' });
        storage.clear();
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(refreshTokenTimer);
  }, [state.tokens]);

const login = async (email: string, password: string) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const response = await authService.login(email, password);

    console.log("🔐 Login response from backend:", response);

    const authData = {
      user: response.user,
      tokens: {
        access: response.access,    // ✅ wrap manually
        refresh: response.refresh,
      },
    };

    dispatch({ type: 'LOGIN_SUCCESS', payload: authData });

    console.log("💾 Saving tokens to storage:", authData.tokens);
    storage.setUser(authData.user);
    storage.setTokens(authData.tokens);

    console.log("📦 Tokens in localStorage after save:", storage.getTokens());
  } catch (error: any) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

const register = async (userData: any) => {
  try {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    const response = await authService.register(userData);

    const authData = {
      user: response.user,
      tokens: {
        access: response.access,   // ✅ wrap manually
        refresh: response.refresh,
      },
    };

    dispatch({ type: 'LOGIN_SUCCESS', payload: authData });
    storage.setUser(authData.user);
    storage.setTokens(authData.tokens);
  } catch (error: any) {
    dispatch({ type: 'SET_ERROR', payload: error.message });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

  const logout = async () => {
    try {
      if (state.tokens) {
        await authService.logout(state.tokens.refresh);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      storage.clear();
    }
  };

  const updateUser = async (userData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!state.tokens) throw new Error('Not authenticated');

      const response = await authService.updateProfile(state.tokens.access, userData);
      dispatch({ type: 'UPDATE_USER', payload: response.user });
      storage.setUser(response.user);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (passwordData: any) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      if (!state.tokens) throw new Error('Not authenticated');
      await authService.changePassword(state.tokens.access, passwordData);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      await authService.forgotPassword(email);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetPassword = async (token: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      await authService.resetPassword(token, password);
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const checkAvailability = async (field: string, value: string) => {
    return authService.checkAvailability(field, value);
  };

  const contextValue: AuthContextType = {
    state,
    actions: {
      login,
      register,
      logout,
      updateUser,
      changePassword,
      forgotPassword,
      resetPassword,
      checkAvailability,
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
