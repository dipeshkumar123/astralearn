import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile, AuthTokens, LoginRequest, RegisterRequest } from '@astralearn/shared';
import { apiService, setTokens, clearTokens, getTokens } from '@/utils/api';

interface AuthState {
  // State
  user: UserProfile | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post('/auth/login', credentials);
          const { user, tokens } = response.data;
          
          // Store tokens
          setTokens(tokens);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.post('/auth/register', userData);
          const { user, tokens } = response.data;
          
          // Store tokens
          setTokens(tokens);
          
          set({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { tokens } = get();
          
          if (tokens?.refreshToken) {
            await apiService.post('/auth/logout', {
              refreshToken: tokens.refreshToken,
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear tokens and state regardless of API call success
          clearTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      logoutAll: async () => {
        set({ isLoading: true });
        
        try {
          await apiService.post('/auth/logout-all');
        } catch (error) {
          console.error('Logout all error:', error);
        } finally {
          // Clear tokens and state regardless of API call success
          clearTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await apiService.post('/auth/refresh', {
            refreshToken: tokens.refreshToken,
          });
          
          const newTokens = response.data;
          setTokens(newTokens);
          
          set({
            tokens: newTokens,
          });
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const { user } = get();
        
        if (user) {
          set({
            user: { ...user, ...updates },
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        const { accessToken } = getTokens();
        
        if (!accessToken) {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
          });
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await apiService.get('/auth/me');
          const user = response.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Token is invalid, clear auth state
          clearTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.post('/auth/change-password', {
            currentPassword,
            newPassword,
          });
          
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password change failed',
          });
          throw error;
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.post('/auth/forgot-password', { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to send reset email',
          });
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.post('/auth/reset-password', {
            token,
            password,
          });
          
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Password reset failed',
          });
          throw error;
        }
      },

      verifyEmail: async (token: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.post('/auth/verify-email', { token });
          
          // Update user's email verification status
          const { user } = get();
          if (user) {
            set({
              user: { ...user, isEmailVerified: true },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Email verification failed',
          });
          throw error;
        }
      },

      resendVerificationEmail: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.post('/auth/resend-verification', { email });
          set({ isLoading: false });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to resend verification email',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
