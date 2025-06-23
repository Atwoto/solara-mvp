/** @type {import('tailwindcss').Config} */
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
        'clean-air': '#F4F7F5',
        'graphite': '#333333',
      
      'whatsapp': '#25D366', // <-- ADD THIS LINE
    },
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}

