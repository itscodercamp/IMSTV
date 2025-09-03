import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  webpack: (config, { isServer }) => {
    // This is required to make sqlite3 work with Next.js
    // It will be included in the server build but not the client build.
    if (!isServer) {
        config.externals.push('sqlite3');
    }
    return config;
  },
  experimental: {
    turbo: {
      rules: {
        // This is the recommended way to make sqlite3 work with Turbopack.
        // It will be excluded from the client build.
        '*.node': {
          loaders: ['node-loader'],
          as: '*.node',
        },
        '**/*.db': {
          loaders: ['file-loader'],
          as: '*.db',
        },
      },
    },
  },
};

export default nextConfig;
