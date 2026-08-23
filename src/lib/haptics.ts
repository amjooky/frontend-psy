/**
 * Native Haptic Feedback Utility for mobile browsers
 * Uses the Web Vibration API with safe fallback
 */

export const haptic = {
  // Light tap for button clicks, tab changes
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
  },

  // Medium tap for confirmations, toggles
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch {}
    }
  },

  // Success double-pulse for booking completed, session joined
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([15, 60, 25]);
      } catch {}
    }
  },

  // Warning pulse
  warning: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch {}
    }
  },

  // Soft rhythmic pulse for breathing exercise guidance
  pulse: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  },
};
