/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    experimental: {
        optimisticClientCache: true,
    },
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
