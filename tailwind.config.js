// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme'); // IMPORTANT: Make sure this line is at the top

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Or 'media'
  theme: {
    extend: {
      colors: {
        // Your custom colors like 'pastel-blue', 'text-dark', etc.
        'pastel-blue': '#A7C7E7',
        'pastel-lavender': '#E6E6FA',
        'pastel-purple': '#C3B1E1',
        'warm-peach': '#FFDAB9',
        'content-bg': '#F8F8FF',
        'text-dark': '#4A4A6A',
        'dark-content-bg': '#2d3748',
        'dark-text': '#E2E8F0',
      },
      fontFamily: {
        'primary': ['Nunito', ...defaultTheme.fontFamily.sans],   // This generates the 'font-primary' utility
        'headings': ['Poppins', ...defaultTheme.fontFamily.sans], // This generates 'font-headings'
        // 'fun': ['YourFunFont', ...defaultTheme.fontFamily.sans], // If you still have this
      },
      boxShadow: {
        'soft': '0 4px 12px rgba(74, 74, 106, 0.08)',
        'medium': '0 6px 16px rgba(74, 74, 106, 0.1)',
      }
    },
  },
  plugins: [],
};