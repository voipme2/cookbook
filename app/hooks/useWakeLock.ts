import { useEffect, useState, useRef } from 'react';

export interface UseWakeLockReturn {
  isActive: boolean;
  isSupported: boolean;
  toggle: () => Promise<void>;
  error: string | null;
}

/**
 * Hook to manage Screen Wake Lock API for keeping device screen on.
 * Falls back to periodic activity for browsers without support.
 */
export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const fallbackIntervalRef = useRef<number | null>(null);

  // Check browser support
  useEffect(() => {
    const supported = 'wakeLock' in navigator;
    setIsSupported(supported);
  }, []);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive) {
        // Page is hidden, release wake lock
        releaseWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isActive) {
        releaseWakeLock();
      }
    };
  }, []);

  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      if (fallbackIntervalRef.current !== null) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      setIsActive(false);
      setError(null);
    } catch (err) {
      console.error('Error releasing wake lock:', err);
    }
  };

  const acquireWakeLock = async () => {
    try {
      if (isSupported && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setIsActive(true);
          setError(null);

          // Re-acquire wake lock if page becomes visible again
          const handleVisibilityChange = async () => {
            if (!document.hidden && isActive && !wakeLockRef.current) {
              try {
                wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
              } catch (err) {
                console.error('Error re-acquiring wake lock:', err);
              }
            }
          };

          wakeLockRef.current.addEventListener('release', () => {
            document.addEventListener('visibilitychange', handleVisibilityChange);
          });

          return;
        } catch (err) {
          console.error('Wake Lock API error:', err);
          // Fall through to fallback method
        }
      }

      // Fallback: Use periodic activity to keep page active
      setIsActive(true);
      setError('Limited support - using fallback mode');

      fallbackIntervalRef.current = window.setInterval(() => {
        // Minimal vibration to maintain activity (1ms)
        if ('vibrate' in navigator) {
          (navigator as any).vibrate(1);
        }
      }, 30000); // Every 30 seconds

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to activate cook mode: ${errorMessage}`);
      setIsActive(false);
    }
  };

  const toggle = async () => {
    if (isActive) {
      await releaseWakeLock();
    } else {
      await acquireWakeLock();
    }
  };

  return {
    isActive,
    isSupported,
    toggle,
    error,
  };
}

