import type { NextConfig } from "next";

/**
 * The app is fully static (SSG + client-side state), so we export it to plain
 * HTML/JS for hosting on GitHub Pages or any static host.
 *
 * GitHub Pages serves a project repo under a sub-path
 * (https://<user>.github.io/<repo>/), so `basePath`/`assetPrefix` come from
 * NEXT_PUBLIC_BASE_PATH, which the Pages workflow sets to "/<repo>". Locally the
 * variable is unset, so the app runs at the root as usual.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: {
    // Required for `output: export` (no image optimization server).
    unoptimized: true,
    remotePatterns: [],
  },
};

export default nextConfig;
