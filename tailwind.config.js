// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-night': '#1a2b48',
        'solar-flare-start': '#FFC837',
        'solar-flare-end': '#FF8008',
        'clean-air': '#F4F7F5', // You might have this as 'cloud-white'
        'cloud-white': '#F7F9FA', // Let's ensure this one is here
        'graphite': '#333333',
        'whatsapp': '#25D366', 
      },
      // Define text shadow values
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    // Add the text-shadow plugin
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        { 'text-shadow': (value) => ({ textShadow: value }) },
        { values: theme('textShadow') }
      )
    }),
  ],
}