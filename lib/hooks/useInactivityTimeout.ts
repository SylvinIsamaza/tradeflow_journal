import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
// import { clearTokens } from '@/lib/api/axios';

// Default timeout: 1 hour (in milliseconds)
const DEFAULT_TIMEOUT = 60 * 60 * 1000;

/**
 * Hook to handle user inactivity timeout
 * Logs out the user after the specified timeout period of inactivity
 */
export function useInactivityTimeout(timeoutMs: number = DEFAULT_TIMEOUT) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    // clearTokens();
    router.push('/login');
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(handleLogout, timeoutMs);
  }, [handleLogout, timeoutMs]);

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer]);

  // Return methods to manually extend or clear the timer
  return {
    resetTimer,
    clearTimer: () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    },
  };
}

export default useInactivityTimeout;