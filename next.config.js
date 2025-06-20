// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Add the images configuration block here:
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jlptvwvikwbmvqxvbogv.supabase.co', // <--- REPLACE THIS WITH YOUR ACTUAL SUPABASE HOSTNAME
        // You can optionally specify port and pathname if needed for more specificity
        // port: '',
        // pathname: '/storage/v1/object/public/product-images/**', // Example: if all images are under this path in your bucket
      },
      // If you have other external image sources you use with <Image>, add them here
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'images.unsplash.com',
      // },
    ],
  },
};

module.exports = nextConfig;