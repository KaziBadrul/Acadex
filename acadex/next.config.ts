import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "lucide-react",
    "@tiptap/extension-bubble-menu",
    "@tiptap/extension-floating-menu",
    "@tiptap/react",
    "@floating-ui/dom",
    "@floating-ui/core",
    "react-force-graph-2d",
    "force-graph",
    "react-kapsule"
  ],
  serverExternalPackages: [],
  // disable source maps in dev builds to avoid "Invalid source map" warnings
  webpack(config, { dev, isServer }) {
    if (dev) {
      config.devtool = false;
    }
    return config;
  },
  // explicit turbopack config to silence informational message
  turbopack: {},
};

export default nextConfig;
