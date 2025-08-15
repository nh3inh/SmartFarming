import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "",
  assetPrefix: "",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint trong quá trình build
  },
};

export default nextConfig;
