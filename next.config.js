/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  images: {
    unoptimized: true,
  },
  transpilePackages: [
    '@leapwallet/cosmos-social-login-capsule-provider-ui',
    '@leapwallet/cosmos-social-login-capsule-provider',
    "@usecapsule/user-management-client",
    "@usecapsule/core-sdk",
    "@usecapsule/web-sdk",
  ],
}

module.exports = nextConfig
