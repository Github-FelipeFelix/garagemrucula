import type { Metadata, Viewport } from "next";
import { Geist, Archivo } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.garagemrucula.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    <html lang="pt-BR" className={`${geist.variable} ${archivo.variable}`}>
      <body className="min-h-dvh bg-bg text-ink">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
