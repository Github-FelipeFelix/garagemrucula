import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos/videos dos carros vivem no Supabase Storage (regra 6).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
};

export default nextConfig;
