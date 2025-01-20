/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: [], // 添加允许的图片域名
  },
  // 针对生产环境的优化
  experimental: {
    optimizeCss: false, // 暂时关闭CSS优化
    turbo: {
      rules: {
        // 自定义构建规则
      },
    },
  },
};

module.exports = nextConfig; 