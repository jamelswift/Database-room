/** @type {import('next').NextConfig} */
const pages = process.env.NEXT_PUBLIC_LOCAL_MODE === 'true';
const nextConfig = {
  ...(pages ? { output: 'export', basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/Database-room', trailingSlash: true } : {}),
  ...(process.env.PAGES_BUILD_ROOT ? { turbopack: { root: process.env.PAGES_BUILD_ROOT } } : {}),
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
};
export default nextConfig;
