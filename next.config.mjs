import createIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = createIntlPlugin()({
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false
      },
      {
        source: '/:locale(en|vi)',
        destination: '/home',
        permanent: false
      }
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });

    return config;
  }
});

export default nextConfig;
