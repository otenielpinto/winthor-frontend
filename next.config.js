/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: 25 * 1024 * 1024, // 25MB
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // json-as-xlsx falls back to Node's `fs` only when it's not running in
      // a browser; webpack still tries to resolve it statically for the
      // client bundle, so tell it to skip it.
      config.resolve.fallback = { ...config.resolve.fallback, fs: false };
    }
    return config;
  },
};

module.exports = nextConfig;
