/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@keep-playing/ui',
    '@keep-playing/shared',
    '@keep-playing/auth',
    '@keep-playing/db',
    '@keep-playing/storage',
    '@keep-playing/transcription',
    '@keep-playing/notifications',
    '@keep-playing/templates',
  ],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
