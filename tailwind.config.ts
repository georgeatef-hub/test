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
        background: '#fafafa',
        card: '#ffffff',
        border: '#dbdbdb',
        accent: '#22c55e',
        'accent-hover': '#16a34a',
        want: '#f59e0b',
        'want-hover': '#d97706',
        like: '#ef4444',
        muted: '#737373',
        foreground: '#262626',
        secondary: '#f5f5f5',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
