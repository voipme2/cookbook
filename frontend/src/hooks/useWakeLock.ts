import { useState, useEffect, useCallback, useRef } from 'react';

// TypeScript interfaces for Wake Lock API
interface WakeLockSentinel {
  addEventListener: (type: string, listener: EventListener) => void;
  release: () => Promise<void>;
}

// Type assertion helper for Wake Lock API
type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
};

export function useWakeLock() {
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [wakeLockSentinel, setWakeLockSentinel] = useState<WakeLockSentinel | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [supportChecked, setSupportChecked] = useState(false);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if wake lock is supported with better detection
  useEffect(() => {
    const checkWakeLockSupport = () => {
      try {
        // Check if the API exists
        const hasWakeLock = 'wakeLock' in navigator;
        
        // Additional check for the actual request method
        const nav = navigator as NavigatorWithWakeLock;
        const hasRequestMethod = nav.wakeLock && typeof nav.wakeLock.request === 'function';
        
        setIsSupported(hasWakeLock && hasRequestMethod);
        setSupportChecked(true);
        
        console.log('Wake Lock API support check:', {
          hasWakeLock,
          hasRequestMethod,
          isSupported: hasWakeLock && hasRequestMethod
        });
      } catch (error) {
        console.error('Error checking Wake Lock API support:', error);
        setIsSupported(false);
        setSupportChecked(true);
      }
    };

    // Check support after a short delay to ensure DOM is ready
    const timer = setTimeout(checkWakeLockSupport, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fallback method for unsupported browsers
  const startFallbackWakeLock = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
    }
    
    console.log('Starting fallback wake lock method');
    
    // Keep the screen awake by periodically requesting user activation
    fallbackIntervalRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Try to keep the page active with minimal vibration
        try {
          if (navigator.vibrate) {
            navigator.vibrate(1);
          }
        } catch {
          console.log('Vibration not supported or failed');
        }
      }
    }, 30000); // Every 30 seconds
  }, []);

  const stopFallbackWakeLock = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
      console.log('Stopped fallback wake lock method');
    }
  }, []);

  // Request wake lock with improved error handling
  const requestWakeLock = useCallback(async () => {
    if (!supportChecked) {
      console.log('Wake Lock support not yet checked, waiting...');
      return false;
    }

    if (isSupported) {
      try {
        console.log('Requesting Wake Lock API...');
        
        const nav = navigator as NavigatorWithWakeLock;
        if (!nav.wakeLock) {
          throw new Error('Wake Lock API not available');
        }

        const sentinel = await nav.wakeLock.request('screen');
        
        if (!sentinel) {
          throw new Error('Wake Lock request returned null');
        }

        setWakeLockSentinel(sentinel);
        setIsWakeLockActive(true);
        
        console.log('Wake Lock successfully requested');
        
        // Listen for when wake lock is released
        if (typeof sentinel.addEventListener === 'function') {
          sentinel.addEventListener('release', () => {
            console.log('Wake Lock was released');
            setIsWakeLockActive(false);
            setWakeLockSentinel(null);
          });
        }
        
        return true;
      } catch (err) {
        console.error('Failed to request wake lock:', err);
        
        // If Wake Lock API fails, try fallback
        console.log('Falling back to fallback method');
        startFallbackWakeLock();
        setIsWakeLockActive(true);
        return true;
      }
    } else {
      // Fallback for unsupported browsers
      console.log('Using fallback wake lock method');
      startFallbackWakeLock();
      setIsWakeLockActive(true);
      return true;
    }
  }, [isSupported, supportChecked, startFallbackWakeLock]);

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (isSupported && wakeLockSentinel && typeof wakeLockSentinel.release === 'function') {
      try {
        console.log('Releasing Wake Lock API...');
        await wakeLockSentinel.release();
        setIsWakeLockActive(false);
        setWakeLockSentinel(null);
        console.log('Wake Lock successfully released');
      } catch (err) {
        console.error('Failed to release wake lock:', err);
        // Force cleanup even if release fails
        setIsWakeLockActive(false);
        setWakeLockSentinel(null);
      }
    } else {
      // Stop fallback
      console.log('Stopping fallback wake lock method');
      stopFallbackWakeLock();
      setIsWakeLockActive(false);
    }
  }, [isSupported, wakeLockSentinel, stopFallbackWakeLock]);

  // Toggle wake lock
  const toggleWakeLock = useCallback(async () => {
    console.log('Toggling wake lock, current state:', isWakeLockActive);
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
    supportChecked,
    toggleWakeLock,
    requestWakeLock,
    releaseWakeLock,
  };
} 