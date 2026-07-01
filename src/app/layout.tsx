import type { Metadata, Viewport } from "next";
import { Geist, Exo_2, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { siteUrl } from "@/lib/site";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Garagem Rúcula — carros antigos, importados e modificados",
    template: "%s · Garagem Rúcula",
  },
  description:
    "Vitrine da Garagem Rúcula: fuscas, kombis, antigos, importados e projetos modificados (turbo, rebaixado). Fale direto no WhatsApp.",
  applicationName: "Garagem Rúcula",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Garagem Rúcula",
    title: "Garagem Rúcula — carros antigos, importados e modificados",
    description:
      "Fuscas, kombis, antigos, importados e projetos modificados. Fale direto no WhatsApp.",
    images: ["/og.jpg"],
  },
  twitter: { card: "summary_large_image" },
  icons: { apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Garagem Rúcula", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${exo2.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-bg text-ink">
        {/* Marca "js-reveal" ANTES da 1ª pintura: só então o CSS esconde os
            elementos de reveal-on-scroll. Sem JS, nada fica invisível. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js-reveal')",
          }}
        />
        {children}
        <ServiceWorkerRegister />
        <Analytics />
      </body>
    </html>
  );
}
