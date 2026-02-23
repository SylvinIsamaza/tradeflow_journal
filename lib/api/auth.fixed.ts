import { publicClient, privateClient, clearAuthState, setAuthState, isAuthenticated } from './axios';
import { User, AuthTokens, LoginCredentials, AuthResult } from '@/types';

// ============================================
// Auth API Service (Cookie-based)
// ============================================

export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await publicClient.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
        user: User;
        requires_two_factor?: boolean;
        user_id?: string;
      }>('/auth/login', {
        email: credentials.username, // Backend expects 'email' field
        password: credentials.password,
        two_factor_code: credentials.twoFactorCode,
      });

      // Check if 2FA is required
      if (response.data.requires_two_factor) {
        return {
          success: false,
          requiresTwoFactor: true,
          user: { id: response.data.user_id || '', email: '' } as User,
        };
      }

      const { user } = response.data;
      
      // Backend sets httpOnly cookies automatically
      // Just update auth state
      setAuthState(true);
      
      return {
        success: true,
        user,
        // Don't return tokens since they're in httpOnly cookies
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      return { success: false, error: message };
    }
  },

  // Register
  async register(email: string, password: string, name?: string): Promise<AuthResult> {
    try {
      const response = await publicClient.post<{
        id: string;
        email: string;
        name?: string;
        role: string;
        createdAt: string;
      }>('/auth/register', { email, password, name });

      const user = response.data;

      // After registration, user needs to login
      // Backend doesn't auto-login on registration
      return {
        success: true,
        user: user as User,
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      return { success: false, error: message };
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await privateClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuthState();
    }
  },

  // Refresh token (handled automatically by axios interceptor)
  async refreshToken(): Promise<AuthTokens | null> {
    try {
      // Backend reads refresh_token from httpOnly cookie
      await publicClient.post('/auth/refresh', {});
      setAuthState(true);
      return null; // Tokens are in httpOnly cookies
    } catch (error) {
      clearAuthState();
      return null;
    }
  },

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      await publicClient.post('/auth/password-reset-request', { email });
      return { success: true };
    } catch (error: any) {
      // Don't reveal if email exists
      return { success: true };
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<AuthResult> {
    try {
      await publicClient.post('/auth/password-reset', {
        token,
        new_password: newPassword,
      });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Password reset failed';
      return { success: false, error: message };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await privateClient.get<User>('/users/me');
      setAuthState(true);
      return response.data;
    } catch (error) {
      clearAuthState();
      return null;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      await privateClient.post('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Password change failed';
      return { success: false, error: message };
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return isAuthenticated();
  },
};

export default authApi;
