import { useWakeLock } from '~/hooks/useWakeLock';

interface CookModeButtonProps {
  className?: string;
}

export function CookModeButton({ className = '' }: CookModeButtonProps) {
  const { isActive, isSupported, toggle, error } = useWakeLock();

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={toggle}
        title={isActive ? 'Cook mode is active - tap to disable' : 'Enable cook mode (keeps screen on while cooking)'}
        className={`
          px-3 py-2 rounded-lg transition-all duration-200
          flex items-center gap-2
          ${isActive
            ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }
          ${className}
        `}
      >
        <span className="text-lg">🍳</span>
        <span className="text-sm font-medium">
          {isActive ? 'Cook Mode' : 'Cook Mode'}
        </span>
        {isActive && (
          <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
        )}
      </button>
      {error && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

