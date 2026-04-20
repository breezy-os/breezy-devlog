import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['localhost', '10.0.0.179', '10.0.0.49'],
  output: 'export',
};

export default nextConfig;
