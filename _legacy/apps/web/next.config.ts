// comments only in English
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true }, // do not require eslint in CI/build
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'next/dist/pages/_app': 'next/app',
      'next/dist/pages/_document': 'next/document',
    };
    return config;
  },
};

export default nextConfig;
