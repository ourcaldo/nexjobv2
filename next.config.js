/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['staging.nexjob.tech', 'nexjob.tech', 'images.pexels.com'],
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: '/bookmark/',
        destination: '/bookmarks',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/jobs',
        destination: '/lowongan-kerja',
        permanent: true,
      },
      {
        source: '/jobs/',
        destination: '/lowongan-kerja/',
        permanent: true,
      },
      {
        source: '/jobs/:slug',
        destination: '/lowongan-kerja/:slug',
        permanent: true,
      },
      {
        source: '/jobs/:slug/',
        destination: '/lowongan-kerja/:slug/',
        permanent: true,
      },
      {
        source: '/articles',
        destination: '/artikel',
        permanent: true,
      },
      {
        source: '/articles/',
        destination: '/artikel/',
        permanent: true,
      },
      {
        source: '/articles/:slug',
        destination: '/artikel/:slug',
        permanent: true,
      },
      {
        source: '/articles/:slug/',
        destination: '/artikel/:slug/',
        permanent: true,
      },
      {
        source: '/bookmark',
        destination: '/bookmark/',
        permanent: true,
      },
      // Legacy category redirects
      {
        source: '/lowongan-kerja',
        destination: '/lowongan-kerja/',
        permanent: true,
      },
    ];
  },
  trailingSlash: true,
  generateEtags: false,
  poweredByHeader: false,
};

module.exports = nextConfig;