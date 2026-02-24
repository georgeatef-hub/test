import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Instagram exact colors
        'ig-background': '#fafafa',
        'ig-card': '#ffffff',
        'ig-border': '#dbdbdb',
        'ig-border-light': '#efefef',
        'ig-primary': '#262626',
        'ig-secondary': '#737373',
        'ig-tertiary': '#8e8e8e',
        'ig-link': '#00376b',
        'ig-like': '#ed4956',
        'ig-want': '#f59e0b',
        'ig-want-active': '#d97706',
        
        // Keep existing for compatibility
        background: '#fafafa',
        card: '#ffffff',
        border: '#dbdbdb',
        accent: '#22c55e',
        'accent-hover': '#16a34a',
        want: '#f59e0b',
        'want-hover': '#d97706',
        like: '#ed4956',
        muted: '#737373',
        foreground: '#262626',
        secondary: '#f5f5f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        script: ['Billabong', 'cursive', 'sans-serif'],
      },
      fontSize: {
        'ig-timestamp': ['10px', { letterSpacing: '0.2px' }],
        'ig-caption': '13px',
        'ig-username': '14px',
      },
      spacing: {
        'ig-header': '44px',
        'ig-bottom': '48px',
      },
    },
  },
  plugins: [],
};
export default config;