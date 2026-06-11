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
    serverComponentsExternalPackages: ['@node-rs/argon2', 'postgres'],
  },
  // Even with serverComponentsExternalPackages, webpack still walks workspace
  // packages via transpilePackages and tries to bundle argon2's .node binary.
  // Force-externalize on the server bundle so it's require()d at runtime.
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals) ? config.externals : [config.externals];
      config.externals = [
        ...externals.filter(Boolean),
        ({ request }, callback) => {
          if (request === '@node-rs/argon2' || request?.startsWith('@node-rs/argon2-')) {
            return callback(null, `commonjs ${request}`);
          }
          return callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
