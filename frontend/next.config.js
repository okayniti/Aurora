/** @type {import('next').NextConfig} */
const nextConfig = {
    // No `output: "standalone"` — that build mode is for self-hosted Docker
    // servers and Vercel does not need it; it manages its own build output
    // and standalone mode can produce an incomplete deployment there.
    compress: true,
    poweredByHeader: false,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
