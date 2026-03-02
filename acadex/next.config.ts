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
};

export default nextConfig;
