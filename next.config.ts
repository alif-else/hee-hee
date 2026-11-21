import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

import("@opennextjs/cloudflare").then((mod) =>
  mod.initOpenNextCloudflareForDev(),
);

export default nextConfig;
