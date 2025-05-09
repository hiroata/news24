/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // 追加の設定（必要に応じて）
  // images: {
  //   domains: ['example.com'],
  // },
};

module.exports = nextConfig;
