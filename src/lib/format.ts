import { WHATSAPP_NUMBER, siteUrl } from "./site";

export function formatBRL(value: number | null | undefined): string {
  if (value == null) return "Sob consulta";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatKm(km: number | null | undefined): string {
  if (km == null) return "—";
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function whatsappLink(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Mensagem pronta ao clicar "tenho interesse" num carro.
export function carWhatsappMessage(car: { title: string; slug: string }): string {
  return `Olá! Tenho interesse no *${car.title}* que vi no site: ${siteUrl()}/carros/${car.slug}`;
}

// Mensagem pronta ao clicar "tenho interesse" numa peça.
export function partWhatsappMessage(part: { title: string; slug: string }): string {
  return `Olá! Tenho interesse na peça *${part.title}* que vi no site: ${siteUrl()}/pecas/${part.slug}`;
}

// Gera slug a partir do titulo (usado no admin ao criar carro).
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
