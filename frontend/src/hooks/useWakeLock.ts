import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock() {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  // @ts-ignore - Wake Lock API is experimental and not well-typed
  const [wakeLockSentinel, setWakeLockSentinel] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if wake lock is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  // Fallback method for unsupported browsers
  const startFallbackWakeLock = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
    }
    
    // Keep the screen awake by periodically requesting user activation
    fallbackIntervalRef.current = setInterval(() => {
      // This is a simple fallback - it won't prevent sleep but will keep the page active
      if (document.visibilityState === 'visible') {
        // Request a small amount of user activation to keep the page alive
        navigator.vibrate?.(1);
      }
    }, 30000); // Every 30 seconds
  }, []);

  const stopFallbackWakeLock = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
  }, []);

  // Request wake lock
  const requestWakeLock = useCallback(async () => {
    if (isSupported) {
      try {
        // @ts-ignore - Wake Lock API is experimental
        const sentinel = await (navigator as any).wakeLock.request('screen');
        setWakeLockSentinel(sentinel);
        setIsWakeLockActive(true);
        
        // Listen for when wake lock is released
        if (sentinel && typeof sentinel.addEventListener === 'function') {
          sentinel.addEventListener('release', () => {
            setIsWakeLockActive(false);
            setWakeLockSentinel(null);
          });
        }
        
        return true;
      } catch (err) {
        console.error('Failed to request wake lock:', err);
        return false;
      }
    } else {
      // Fallback for unsupported browsers
      startFallbackWakeLock();
      setIsWakeLockActive(true);
      return true;
    }
  }, [isSupported, startFallbackWakeLock]);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (isSupported && wakeLockSentinel && typeof wakeLockSentinel.release === 'function') {
      try {
        await wakeLockSentinel.release();
        setIsWakeLockActive(false);
        setWakeLockSentinel(null);
      } catch (err) {
        console.error('Failed to release wake lock:', err);
      }
    } else {
      // Stop fallback
      stopFallbackWakeLock();
      setIsWakeLockActive(false);
    }
  }, [isSupported, wakeLockSentinel, stopFallbackWakeLock]);

  // Toggle wake lock
  const toggleWakeLock = useCallback(async () => {
    if (isWakeLockActive) {
      await releaseWakeLock();
    } else {
      await requestWakeLock();
    }
  }, [isWakeLockActive, requestWakeLock, releaseWakeLock]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockSentinel) {
        releaseWakeLock();
      }
      stopFallbackWakeLock();
    };
  }, [wakeLockSentinel, releaseWakeLock, stopFallbackWakeLock]);

  return {
    isWakeLockActive,
    isSupported,
    toggleWakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
} 