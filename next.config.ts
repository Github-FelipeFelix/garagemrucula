import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos/videos dos carros vivem no Supabase Storage (regra 6).
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
    // Formatos modernos: AVIF/WebP entregam muito mais nitidez pelo mesmo peso.
    formats: ["image/avif", "image/webp"],
    // Qualidades permitidas (Next 16 exige declarar as usadas por quality={}).
    // Foto de carro é o que vende — priorizamos nitidez.
    qualities: [60, 75, 82, 90, 95],
    // Cache longo no CDN: a mesma foto raramente muda.
    minimumCacheTTL: 2678400, // 31 dias
  },
};

export default nextConfig;
