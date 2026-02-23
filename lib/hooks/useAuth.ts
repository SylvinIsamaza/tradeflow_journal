import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { isAuthenticated } from '@/lib/api/axios';
import { LoginCredentials, User } from '@/types';

// Query keys
export const authKeys = {
  currentUser: ['auth', 'currentUser'] as const,
};

// ============================================
// Auth Hooks
// ============================================

// Login mutation
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate and refetch user
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
        router.push('/');
      }
    },
  });
}

// Register mutation
export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, name }: { email: string; password: string; name?: string }) =>
      authApi.register(email, password, name),
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: authKeys.currentUser });
        router.push('/');
      }
    },
  });
}

// Logout mutation
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
    },
  });
}

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: () => authApi.getCurrentUser(),
    enabled: isAuthenticated(), // Only fetch if authenticated
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Check if user is authenticated
export function useIsAuthenticated() {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}

// Change password mutation
export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      // After password change, user needs to re-login
      queryClient.clear();
    },
  });
}

// Request password reset mutation
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => authApi.requestPasswordReset(email),
  });
}

// Reset password mutation
export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: { token: string; newPassword: string; confirmPassword: string }) =>
      authApi.resetPassword(data.token, data.newPassword),
    onSuccess: (data) => {
      if (data.success) {
        router.push('/login');
      }
    },
  });
}

export default useLogin;