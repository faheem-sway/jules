// postcss.config.mjs
export default {
  plugins: {
    '@tailwindcss/postcss': {}, // Ensures Tailwind CSS is processed
    'autoprefixer': {},         // Adds vendor prefixes for browser compatibility
  },
};
