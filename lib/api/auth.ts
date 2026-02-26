import { publicClient, privateClient, clearTokens, setTokens, isAuthenticated } from './axios';
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

      const { access_token, refresh_token, expires_in, user } = response.data;
      
      setTokens(access_token, refresh_token, expires_in);
      
      return {
        success: true,
        user,
        tokens: { accessToken: access_token, refreshToken: refresh_token, expiresAt: Date.now() + expires_in * 1000 },
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

      const { access_token, refresh_token, expires_in, user } = response.data;

      setTokens(access_token, refresh_token, expires_in);

      return {
        success: true,
        user: user as User,
        tokens: { accessToken: access_token, refreshToken: refresh_token, expiresAt: Date.now() + expires_in * 1000 },
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
      clearTokens();
    }
  },

  async refreshToken(): Promise<AuthTokens | null> {
    try {
      const response = await publicClient.post<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>('/auth/refresh', {});

      const { access_token, refresh_token, expires_in } = response.data;
      setTokens(access_token, refresh_token, expires_in);

      return {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + expires_in * 1000,
      };
    } catch (error) {
      clearTokens();
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
      return response.data;
    } catch (error) {
      return null;
    }
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResult> {
    try {
      await privateClient.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Password change failed';
      return { success: false, error: message };
    }
  },

  // Setup 2FA
  async setup2FA(): Promise<{ success: boolean; secret?: string; qr_code_url?: string; backup_codes?: string[]; error?: string }> {
    try {
      const response = await privateClient.post<{
        secret: string;
        qr_code_url: string;
        backup_codes: string[];
      }>('/auth/2fa/setup');
      return {
        success: true,
        secret: response.data.secret,
        qr_code_url: response.data.qr_code_url,
        backup_codes: response.data.backup_codes,
      };
    } catch (error: any) {
      const message = error.response?.data?.detail || '2FA setup failed';
      return { success: false, error: message };
    }
  },

  // Enable 2FA
  async enable2FA(code: string): Promise<{ success: boolean; error?: string; backup_codes?: string[] }> {
    try {
      const response = await privateClient.post<{ success: boolean; message: string; backup_codes?: string[] }>('/auth/2fa/enable', {
        code,
      });
      return { success: true, backup_codes: response.data.backup_codes };
    } catch (error: any) {
      const message = error.response?.data?.detail || '2FA enable failed';
      return { success: false, error: message };
    }
  },

  // Disable 2FA
  async disable2FA(password: string): Promise<{ success: boolean; error?: string }> {
    try {
      await privateClient.post('/auth/2fa/disable', { password });
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || '2FA disable failed';
      return { success: false, error: message };
    }
  },

  // Deactivate account
  async deactivateAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      await privateClient.delete('/users/me');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Account deactivation failed';
      return { success: false, error: message };
    }
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return isAuthenticated();
  },

  // Get user notifications
  async getNotifications(): Promise<{ success: boolean; notifications?: any[]; error?: string }> {
    try {
      const response = await privateClient.get<any[]>('/auth/notifications');
      return { success: true, notifications: response.data };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to fetch notifications';
      return { success: false, error: message };
    }
  },

  // Mark notification as read
  async markNotificationRead(notificationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await privateClient.post(`/auth/notifications/${notificationId}/read`);
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to mark notification as read';
      return { success: false, error: message };
    }
  },

  // Mark all notifications as read
  async markAllNotificationsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      await privateClient.post('/auth/notifications/read-all');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to mark all notifications as read';
      return { success: false, error: message };
    }
  },
};

export default authApi;
