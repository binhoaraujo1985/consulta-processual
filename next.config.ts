import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Troque "consulta-processual" pelo nome exato do seu repositório GitHub
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
