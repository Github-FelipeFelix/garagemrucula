import type { MetadataRoute } from "next";

// PWA — app unico, instalavel no celular (ele usa em eventos). SW e network-first (regra 5/10).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Garagem Rúcula",
    short_name: "Rúcula",
    description: "Carros antigos, importados e modificados — compra e venda.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    lang: "pt-BR",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
