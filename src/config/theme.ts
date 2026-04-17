// ═══════════════════════════════════════════════════════════════
// SMART KISAN BHARAT - CROP CLINIC
// Universal Theme Configuration
// Primary Color: #0d9c5c (Vibrant Green)
// ═══════════════════════════════════════════════════════════════

export const theme = {
  // Primary Brand Colors
  colors: {
    primary: {
      main: '#0d9c5c',
      rgb: 'rgb(13, 156, 92)',
      hsl: 'hsl(153, 85%, 33%)',
      light: '#10b56d',
      lighter: '#14ce7e',
      lightest: '#e6f9f1',
      dark: '#0a7d49',
      darker: '#085e36',
      darkest: '#053d24',
    },
    
    // Gradient Variations
    gradients: {
      primary: 'linear-gradient(135deg, #0d9c5c 0%, #10b56d 100%)',
      hero: 'linear-gradient(135deg, #0d9c5c 0%, #14ce7e 50%, #10b56d 100%)',
      subtle: 'linear-gradient(180deg, #e6f9f1 0%, #ffffff 100%)',
      sidebar: 'linear-gradient(180deg, #085e36 0%, #0d9c5c 50%, #0a7d49 100%)',
      card: 'linear-gradient(135deg, rgba(13, 156, 92, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
      button: 'linear-gradient(135deg, #0d9c5c 0%, #10b56d 100%)',
      hover: 'linear-gradient(135deg, #10b56d 0%, #14ce7e 100%)',
    },

    // Background Colors
    background: {
      main: '#ffffff',
      subtle: '#f8fdfb',
      light: '#e6f9f1',
      green: '#d4f4e6',
      gradient: 'linear-gradient(180deg, #e6f9f1 0%, #f8fdfb 100%)',
    },

    // Sidebar Colors
    sidebar: {
      background: '#0d9c5c',
      hover: 'rgba(255, 255, 255, 0.15)',
      active: 'rgba(255, 255, 255, 0.25)',
      text: '#ffffff',
      textMuted: 'rgba(255, 255, 255, 0.7)',
      border: 'rgba(255, 255, 255, 0.2)',
    },

    // Semantic Colors
    success: {
      main: '#0d9c5c',
      light: '#e6f9f1',
      dark: '#085e36',
    },
    warning: {
      main: '#f59e0b',
      light: '#fef3c7',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#fee2e2',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#dbeafe',
      dark: '#2563eb',
    },

    // Text Colors
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      muted: '#9ca3af',
      inverse: '#ffffff',
    },
  },

  // Typography
  fonts: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Cascadia Code", "Monaco", "Courier New", monospace',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },

  // Spacing
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    green: '0 10px 25px -5px rgba(13, 156, 92, 0.3)',
    greenLg: '0 20px 35px -5px rgba(13, 156, 92, 0.4)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Component Specific Styles
  components: {
    button: {
      primary: {
        bg: '#0d9c5c',
        hover: '#10b56d',
        active: '#0a7d49',
        text: '#ffffff',
      },
      secondary: {
        bg: '#e6f9f1',
        hover: '#d4f4e6',
        active: '#c2f0db',
        text: '#0d9c5c',
      },
      outline: {
        border: '#0d9c5c',
        hover: '#e6f9f1',
        text: '#0d9c5c',
      },
    },

    card: {
      bg: '#ffffff',
      border: '#e5e7eb',
      shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },

    input: {
      bg: '#ffffff',
      border: '#d1d5db',
      focus: '#0d9c5c',
      error: '#ef4444',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

// Utility function to get color with opacity
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Export commonly used values
export const PRIMARY_COLOR = theme.colors.primary.main;
export const PRIMARY_GRADIENT = theme.colors.gradients.primary;
export const SIDEBAR_BG = theme.colors.sidebar.background;
export const FONT_PRIMARY = theme.fonts.primary;

export default theme;