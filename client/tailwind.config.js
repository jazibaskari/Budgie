import { spacing, typography } from './src/styles/tokens';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: spacing,
      fontSize: typography.sizes,
      lineHeight: typography.lineHeights,
      regular: typography.families.regular.split(', '),
        medium: typography.families.medium.split(', '),
    },
  },
  plugins: [],
}