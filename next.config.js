/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 25 * 1024 * 1024, // 25MB
    },
  },
};

module.exports = nextConfig;
