import type { MetadataRoute } from "next";

// PWA — app unico, instalavel no celular (ele usa em eventos). SW e network-first (regra 5/10).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Garagem Rucula",
    short_name: "Rucula",
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
    // Atalho no app instalado (segurar o icone -> "Painel"): abre direto o /admin.
    // O primo gerencia os carros do celular em eventos sem digitar a URL na mao.
    shortcuts: [
      {
        name: "Painel (gerenciar carros)",
        short_name: "Painel",
        description: "Cadastrar e editar os carros",
        url: "/admin",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
