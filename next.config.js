/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Handle Solana dependencies for Privy
    if (config.externals) {
      config.externals.push({
        '@solana/web3.js': 'commonjs @solana/web3.js',
        '@solana/spl-token': 'commonjs @solana/spl-token',
      });
    } else {
      config.externals = [
        {
          '@solana/web3.js': 'commonjs @solana/web3.js',
          '@solana/spl-token': 'commonjs @solana/spl-token',
        },
      ];
    }
    return config;
  },
};

module.exports = nextConfig; 