/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@keep-playing/ui',
    '@keep-playing/shared',
    '@keep-playing/auth',
    '@keep-playing/db',
  ],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
