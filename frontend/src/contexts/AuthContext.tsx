import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

/* ---------- Types ---------- */
interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  display_name: string;
  phone: number;
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
  is_admin: boolean;
  last_login: string | null;
}

interface AuthTokens { access: string; refresh: string; }

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  rehydrated: boolean;
}

interface LoginResponse {
  refresh?: string;
  access?: string;
  user: User;
  tokens?: AuthTokens; // tolerate both shapes
}

interface RegisterResponse extends LoginResponse {}

interface RefreshTokenResponse { access: string; }
interface UpdateProfileResponse { user: User; }

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'SET_REHYDRATED'; payload: boolean };

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  rehydrated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'SET_ERROR': return { ...state, error: action.payload };
    case 'LOGIN_SUCCESS':
      return { ...state, user: action.payload.user, tokens: action.payload.tokens, isAuthenticated: true, loading: false, error: null };
    case 'LOGOUT':
      return { ...state, user: null, tokens: null, isAuthenticated: false, loading: false, error: null };
    case 'UPDATE_USER': return { ...state, user: action.payload };
    case 'UPDATE_TOKENS': return { ...state, tokens: action.payload };
    case 'SET_REHYDRATED': return { ...state, rehydrated: action.payload };
    default: return state;
  }
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://arun.yougletech.com/api';

/* ---------- Better error type ---------- */
class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/* ---------- Service ---------- */
class AuthService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    };

    try {
      const response = await fetch(url, config);
      const text = await response.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = text; }

      if (!response.ok) {
        const detail =
          (data && typeof data === 'object' && (data.detail ||
            (Array.isArray(data?.non_field_errors) && data.non_field_errors[0]) ||
            data.error || data.message)) || '';
        throw new ApiError(detail || 'Request failed', response.status, data);
      }
      return data as T;
    } catch (err: any) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('Network error', 0, null);
    }
  }

  register(userData: any): Promise<RegisterResponse> {
    return this.request('/accounts/register/', { method: 'POST', body: JSON.stringify(userData) });
  }

  login(email: string, password: string): Promise<LoginResponse> {
    return this.request('/accounts/login/', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  logout(refreshToken: string): Promise<void> {
    return this.request('/accounts/logout/', { method: 'POST', body: JSON.stringify({ refresh: refreshToken }) });
  }

  // ✅ matches backend route
  refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return this.request('/accounts/token/refresh/', { method: 'POST', body: JSON.stringify({ refresh: refreshToken }) });
  }

  getProfile(accessToken: string): Promise<User> {
    return this.request('/accounts/profile/me/', { headers: { Authorization: `Bearer ${accessToken}` } });
  }

  updateProfile(accessToken: string, profileData: any): Promise<UpdateProfileResponse> {
    const isFormData = profileData instanceof FormData;
    return this.request('/accounts/profile/update_profile/', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${accessToken}`, ...(isFormData ? {} : { 'Content-Type': 'application/json' }) },
      body: profileData,
    });
  }

  changePassword(accessToken: string, passwordData: any): Promise<void> {
    return this.request('/accounts/profile/change_password/', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify(passwordData),
    });
  }

  forgotPassword(email: string): Promise<void> {
    return this.request('/accounts/forgot-password/', { method: 'POST', body: JSON.stringify({ email }) });
  }

  resetPassword(token: string, password: string): Promise<void> {
    return this.request('/accounts/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: password, new_password_confirm: password }),
    });
  }

  checkAvailability(field: string, value: string): Promise<any> {
    const params = new URLSearchParams({ [field]: value });
    return this.request(`/accounts/check-availability/?${params}`);
  }

  /* ✅ NEW: email verification helpers */
  resendActivation(email: string): Promise<{ message: string }> {
    return this.request('/accounts/resend-activation/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  verifyEmail(token: string): Promise<{ message: string }> {
    return this.request('/accounts/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}

const authService = new AuthService();

/* ---------- Context ---------- */
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
    /* ✅ NEW */
    resendActivation: (email: string) => Promise<any>;
    verifyEmail: (token: string) => Promise<any>;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- Local storage ---------- */
const STORAGE_KEYS = { USER: 'auth_user', TOKENS: 'auth_tokens' };

const storage = {
  getUser: (): User | null => { try { const s = localStorage.getItem(STORAGE_KEYS.USER); return s ? JSON.parse(s) : null; } catch { return null; } },
  setUser: (u: User) => localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u)),
  getTokens: (): AuthTokens | null => { try { const s = localStorage.getItem(STORAGE_KEYS.TOKENS); return s ? JSON.parse(s) : null; } catch { return null; } },
  setTokens: (t: AuthTokens) => localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(t)),
  clear: () => { localStorage.removeItem(STORAGE_KEYS.USER); localStorage.removeItem(STORAGE_KEYS.TOKENS); },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Rehydrate
  useEffect(() => {
    const user = storage.getUser();
    const tokens = storage.getTokens();
    if (user && tokens) dispatch({ type: 'LOGIN_SUCCESS', payload: { user, tokens } });
    dispatch({ type: 'SET_REHYDRATED', payload: true });
  }, []);

  // Auto refresh every 30m
  useEffect(() => {
    if (!state.tokens) return;
    const timer = setInterval(async () => {
      try {
        const res = await authService.refreshToken(state.tokens!.refresh);
        const newTokens = { access: res.access, refresh: state.tokens!.refresh };
        dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
        storage.setTokens(newTokens);
      } catch (e) {
        console.error('Token refresh failed:', e);
        dispatch({ type: 'LOGOUT' });
        storage.clear();
      }
    }, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, [state.tokens]);

  /* ---------- Actions (rethrow errors) ---------- */
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const res = await authService.login(email, password);
      const tokens: AuthTokens =
        (res.tokens as AuthTokens) || { access: res.access!, refresh: res.refresh! };
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.user, tokens } });
      storage.setUser(res.user);
      storage.setTokens(tokens);
    } catch (err) {
      // Rethrow so forms can show specific message
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const register = async (userData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const res = await authService.register(userData);
      const tokens: AuthTokens =
        (res.tokens as AuthTokens) || { access: res.access!, refresh: res.refresh! };
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: res.user, tokens } });
      storage.setUser(res.user);
      storage.setTokens(tokens);
    } catch (err) {
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try { if (state.tokens) await authService.logout(state.tokens.refresh); }
    catch (e) { console.error('Logout error:', e); }
    finally { dispatch({ type: 'LOGOUT' }); storage.clear(); }
  };

  const updateUser = async (userData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      if (!state.tokens) throw new Error('Not authenticated');
      const res = await authService.updateProfile(state.tokens.access, userData);
      dispatch({ type: 'UPDATE_USER', payload: res.user });
      storage.setUser(res.user);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Update failed' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (passwordData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      if (!state.tokens) throw new Error('Not authenticated');
      await authService.changePassword(state.tokens.access, passwordData);
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Change password failed' });
      throw err;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const forgotPassword = async (email: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try { await authService.forgotPassword(email); }
    catch (err: any) { dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Failed' }); throw err; }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const resetPassword = async (token: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try { await authService.resetPassword(token, password); }
    catch (err: any) { dispatch({ type: 'SET_ERROR', payload: err?.message ?? 'Failed' }); throw err; }
    finally { dispatch({ type: 'SET_LOADING', payload: false }); }
  };

  const checkAvailability = (field: string, value: string) => authService.checkAvailability(field, value);

  /* ✅ NEW: passthrough actions for email verification */
  const resendActivation = (email: string) => authService.resendActivation(email);
  const verifyEmail = (token: string) => authService.verifyEmail(token);

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
      resendActivation,   // ✅
      verifyEmail,        // ✅
    },
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export default AuthContext;
