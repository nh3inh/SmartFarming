import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  basePath: "",
  assetPrefix: "",
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sinhthainongnghiep.net.vn",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Bỏ qua lỗi ESLint trong quá trình build
  },
};

export default nextConfig;
