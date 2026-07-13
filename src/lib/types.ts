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
// car_id XOR part_id indica se o interesse é num carro ou numa peça (car_title
// guarda o nome do item nos dois casos — snapshot que sobrevive à remoção).
export type Lead = {
  id: string;
  created_at: string;
  car_id: string | null;
  part_id?: string | null; // preenchido quando o interesse é numa peça
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

// ===================== PEÇAS / PRODUTOS (separadas dos carros) =====================
// farol, roda, pneus, som… — o primo cadastra e gerencia igual aos carros.
export type PartCondition = "novo" | "seminovo" | "usado";

export type Part = {
  id: string;
  created_at: string;
  updated_at: string | null;
  slug: string;
  title: string;
  category: string | null; // Rodas, Pneus, Faróis…
  condition: PartCondition;
  brand: string | null; // fabricante da peça (BBS, Cibié, Pirelli…)
  compatibility: string | null; // serve em quais carros
  price: number | null; // null = "Sob consulta"
  description: string | null;
  tags: string[];
  photos: CarPhoto[]; // mesmo formato { path, url } dos carros
  videos: CarVideo[];
  status: CarStatus; // reaproveita disponivel/reservado/vendido (mesmos selos)
  featured: boolean; // destaque na home
  views: number;
};

export const PART_CONDITION_LABEL: Record<PartCondition, string> = {
  novo: "Novo",
  seminovo: "Seminovo",
  usado: "Usado",
};

// Categorias sugeridas no admin. A vitrine filtra só pelas que existirem de fato.
export const PART_CATEGORIES = [
  "Rodas",
  "Pneus",
  "Faróis e lanternas",
  "Som e multimídia",
  "Motor e turbo",
  "Suspensão",
  "Escapamento",
  "Interior",
  "Lataria e para-choques",
  "Elétrica",
  "Acessórios",
  "Outros",
] as const;
