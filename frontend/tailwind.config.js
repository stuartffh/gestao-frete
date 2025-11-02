/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Usando CSS variables via Tailwind
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        muted: 'var(--color-muted)',
        text: 'var(--color-text)',
        border: 'var(--color-border)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          600: 'var(--color-primary-600)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)',
        // Mantendo compatibilidade com dark.*
        dark: {
          bg: 'var(--color-bg)',
          surface: 'var(--color-surface)',
          card: 'var(--color-card)',
          border: 'var(--color-border)',
          text: {
            primary: 'var(--color-text)',
            secondary: 'var(--color-muted)',
            muted: 'var(--color-muted)',
          },
          accent: {
            primary: 'var(--color-primary)',
            secondary: '#8b5cf6',
            success: 'var(--color-success)',
            warning: 'var(--color-warning)',
            error: 'var(--color-danger)',
          },
        },
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        mono: 'var(--font-mono)',
      },
      zIndex: {
        base: 'var(--z-base)',
        sticky: 'var(--z-sticky)',
        dropdown: 'var(--z-dropdown)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
    },
  },
  plugins: [],
}

