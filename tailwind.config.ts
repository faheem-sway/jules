import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // If you have a pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // If you create a components directory
    './app/**/*.{js,ts,jsx,tsx,mdx}',    // For Next.js App Router
  ],
  theme: {
    extend: {
      // You can extend the default theme here if needed in the future
      // For example, custom colors, fonts, spacing, etc.
      // colors: {
      //   brand: '#123456',
      // },
    },
  },
  plugins: [
    // You can add Tailwind plugins here if needed
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
};

export default config;
