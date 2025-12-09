// Note: This requires the @tailwindcss/typography package to support ES Module imports, which it does.
import typography from '@tailwindcss/typography'; 

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    // ... your files
  ],
  theme: {
    extend: {},
  },
  // Use the imported variable here:
  plugins: [
    typography,
  ],
};

export default config;