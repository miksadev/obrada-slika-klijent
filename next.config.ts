import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Next does not pick up a parent
  // lockfile (a stray ~/yarn.lock confuses root inference otherwise).
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
