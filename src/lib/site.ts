// Constantes de contato/negocio da Garagem Rucula.

// WhatsApp do primo: +55 19 97416-5880 (formato wa.me, so digitos).
export const WHATSAPP_NUMBER = "5519974165880";
export const INSTAGRAM_HANDLE = "garagem_rucula";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

// URL canônica pública do site.
export const CANONICAL_SITE_URL = "https://www.garagemrucula.com.br";

// Base usada em sitemap/robots/canonical/og (server-side).
// Defensivo de propósito: a env var NEXT_PUBLIC_SITE_URL da Vercel herdou por
// engano o "http://localhost:3000" do .env de desenvolvimento e, como
// NEXT_PUBLIC_* fica embutida no build, isso vazava para todo o SEO. Regra:
//   1) uma env var explícita e NÃO-local sempre vence (config correta);
//   2) qualquer deploy na Vercel nunca serve localhost — usa o domínio;
//   3) fora da Vercel (dev), localhost.
// No client (QR/compartilhar) usamos window.location.origin — o host real.
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const isLocal = !raw || /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(raw);
  if (!isLocal) return raw as string;
  if (process.env.VERCEL) return CANONICAL_SITE_URL;
  return "http://localhost:3000";
}
