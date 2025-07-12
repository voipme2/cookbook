# Cook Mode Feature

## Overview

The Cook Mode feature prevents your phone/tablet screen from turning off while you're following a recipe. This is especially useful when cooking, as you can keep the recipe visible without having to constantly tap the screen.

## How to Use

1. **Navigate to any recipe** in the cookbook
2. **Click the chef hat icon** (🍳) next to the recipe title
3. **Cook mode will activate** - you'll see an orange indicator
4. **Your screen will stay on** while following the recipe
5. **Click the chef hat again** to disable cook mode

## Browser Support

### ✅ Full Support (Screen Wake Lock API)
- **Chrome/Edge** (Android, Desktop)
- **Safari** (iOS 16.4+, macOS 13.3+)
- **Firefox** (Android, Desktop)

### ⚠️ Limited Support (Fallback Mode)
- **Older browsers** that don't support the Wake Lock API
- **Fallback behavior**: Keeps the page active but may not prevent screen sleep
- **Note**: You'll see a "Limited support" message

## Technical Details

### Wake Lock API
- Uses the modern [Screen Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
- Prevents the device from sleeping while active
- Automatically releases when the page becomes hidden or the user navigates away

### Fallback Method
- For unsupported browsers, uses a periodic activity method
- Keeps the page active but may not prevent screen sleep
- Uses minimal vibration (1ms) every 30 seconds to maintain activity

## Privacy & Battery

- **No data collection** - everything happens locally on your device
- **Automatic cleanup** - wake lock is released when you leave the page
- **Battery impact** - minimal, only prevents sleep while actively cooking
- **Privacy** - no tracking or data sent to servers

## Troubleshooting

### Cook mode not working?
1. **Check browser support** - try Chrome, Safari, or Firefox
2. **Ensure HTTPS** - Wake Lock API requires secure connection
3. **Check permissions** - some browsers may require user interaction first
4. **Try refreshing** - the page may need to be reloaded

### Screen still turns off?
1. **Check device settings** - some devices have aggressive sleep settings
2. **Try a different browser** - browser support varies
3. **Use fallback mode** - limited support is better than no support

## Development

The cook mode feature is implemented using:
- **Custom hook**: `useWakeLock()` in `frontend/src/hooks/useWakeLock.ts`
- **Component integration**: `ViewRecipe.tsx` component
- **Browser detection**: Automatic fallback for unsupported browsers 