/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**', // Allows any path from this hostname
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // For the placeholder images
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

