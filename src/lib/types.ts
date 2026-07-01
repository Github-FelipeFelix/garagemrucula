// Tipos do dominio. Colunas do banco em ingles; UI em pt-BR.

export type CarStatus = "disponivel" | "reservado" | "vendido";

export type CarPhoto = { path: string; url: string };
export type CarVideo = { path: string; url: string };

export type Car = {
  id: string;
  created_at: string;
  updated_at: string | null;
  slug: string;
  title: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: number | null; // null = "Sob consulta"
  km: number | null;
  engine: string | null; // motor
  transmission: string | null; // cambio
  color: string | null;
  fuel: string | null; // combustivel
  description: string | null;
  mods: string[]; // modificacoes / acessorios
  tags: string[]; // turbo, rebaixado, antigo, importado...
  photos: CarPhoto[];
  videos: CarVideo[];
  status: CarStatus;
  featured: boolean; // destaque na home
  views: number;
};

// Lead: registrado quando o cliente clica "tenho interesse" (vai pro WhatsApp E grava aqui).
export type Lead = {
  id: string;
  created_at: string;
  car_id: string | null;
  car_title: string | null;
  source: "whatsapp" | "instagram" | (string & {});
};

// Historico de vendas — PRIVADO (nunca exposto no site publico).
export type CarSale = {
  car_id: string;
  sold_price: number | null;
  sold_at: string | null; // date ISO
  notes: string | null;
};

export const CAR_STATUS_LABEL: Record<CarStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};
