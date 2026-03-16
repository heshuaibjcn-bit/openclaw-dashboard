import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts');

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,

  // Enable React strict mode for better error detection
  reactStrictMode: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    optimizeCss: true,
    scrollRestoration: true,
  },

  // Production optimizations
  productionBrowserSourceMaps: false,

  // Webpack 5 optimizations (for fallback)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 10,
              enforce: true,
            },
            // Common UI components
            ui: {
              name: 'ui',
              chunks: 'all',
              test: /@\/components\/ui/,
              priority: 20,
              enforce: true,
            },
            // Framework chunks
            framework: {
              name: 'framework',
              chunks: 'all',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|use-subscription)[\\/]/,
              priority: 30,
              enforce: true,
            },
            // lib chunks
            lib: {
              name: 'lib',
              chunks: 'all',
              test: /[\\/]src[\\/]lib/,
              priority: 25,
              enforce: true,
            },
          },
        },
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
