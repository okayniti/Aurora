/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    jsexperimental: {
        optimisticClientCache: true,
    },
    compress: true,
    poweredByHeader: false,
};

const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
