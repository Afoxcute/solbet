import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL('https://tenor.com/**'),
      new URL('https://randomuser.me/**'),
      new URL('https://cdn-icons-png.flaticon.com/**'),
      new URL('https://media.tenor.com/**'),
      new URL('https://images.unsplash.com/**'),
      new URL('https://randomuser.me/**'),
      new URL('https://lh3.googleusercontent.com/a/**'),
      new URL('https://loodibee.com/wp-content/upload/**'),
      new URL('https://www.sportslogos.net/logos/**'),
      new URL('https://drive.google.com/file/**'),
      // Add Privy domains if needed
      new URL('https://privy.io/**')
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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

export default nextConfig;
