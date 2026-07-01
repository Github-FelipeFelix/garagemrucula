// Constantes de contato/negocio da Garagem Rucula.

// WhatsApp do primo: +55 19 97416-5880 (formato wa.me, so digitos).
export const WHATSAPP_NUMBER = "5519974165880";
export const INSTAGRAM_HANDLE = "garagem_rucula";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://www.garagemrucula.com.br").replace(/\/$/, "");
}
