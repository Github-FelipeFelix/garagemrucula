import type { NextConfig } from "next";

// Só as fotos do NOSSO bucket passam pelo otimizador. Antes valia qualquer
// projeto *.supabase.co — dava pra usar o otimizador do site com imagem alheia.
function supabaseImages() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return { protocol: "https" as const, hostname: "**.supabase.co" };
  const u = new URL(raw);
  return {
    protocol: u.protocol === "http:" ? ("http" as const) : ("https" as const),
    hostname: u.hostname,
    ...(u.port ? { port: u.port } : {}),
    pathname: "/storage/v1/object/public/car-media/**",
  };
}

const nextConfig: NextConfig = {
  images: {
    // Fotos/videos dos carros vivem no Supabase Storage (regra 6).
    remotePatterns: [supabaseImages()],
    // Formatos modernos: AVIF/WebP entregam muito mais nitidez pelo mesmo peso.
    formats: ["image/avif", "image/webp"],
    // Cada largura listada vira uma variante possível por foto, e cada variante
    // nova faz a Vercel baixar o ORIGINAL do Supabase (cota de egress do plano
    // grátis — estourou em out/2026 com um robô baixando todas). Menos larguras =
    // menos variantes. 1200 fica: a OG image por carro pede w=1200.
    deviceSizes: [640, 828, 1200, 1920, 2560],
    // Qualidades permitidas (Next 16 exige declarar as usadas por quality={}).
    // Foto de carro é o que vende — priorizamos nitidez. 75 = padrão (miniaturas/OG).
    qualities: [75, 82, 90, 95],
    // Cache longo no CDN: a mesma foto raramente muda.
    minimumCacheTTL: 2678400, // 31 dias
  },
};

export default nextConfig;
