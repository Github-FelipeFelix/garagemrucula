import { cache } from "react";
import { createReadClient } from "@/lib/supabase/read";

// Conteúdo editável do site pelo /admin (sem precisar mexer no código).
// Escopo v1: textos de marketing (seguros). Contato/WhatsApp fica no código de
// propósito (é o CTA de venda — erro ali quebraria o negócio).
export type Diferencial = { titulo: string; texto: string };
export type SitePhoto = { path: string; url: string };
export type SiteSettings = {
  heroSubtitulo: string;
  sobreP1: string;
  sobreP2: string;
  diferenciais: Diferencial[]; // sempre 3 (os ícones ficam no código, por índice)
  aboutPhotos: SitePhoto[]; // fotos do espaço/oficina (seção "Nosso espaço" no Sobre)
};

const MAX_ABOUT_PHOTOS = 24;

// Defaults = o texto que já estava fixo no site. Enquanto a tabela não existir
// ou vier vazia, o site usa isto (degrada com segurança — regra 3).
export const DEFAULT_SETTINGS: SiteSettings = {
  heroSubtitulo:
    "Carros antigos, importados e modificados. Fuscas, kombis e projetos que contam história.",
  sobreP1:
    "Tudo começou com um Fusca verde rucula — turbo, rodas de Porsche, feito no capricho. Foi esse carro que deu nome à garagem e mostrou o caminho: transformar clássicos em projetos que a galera para pra olhar.",
  sobreP2:
    "De lá pra cá, a Garagem Rucula virou referência em carros antigos, importados e modificados — fuscas, kombis e projetos turbo e rebaixado, cada um com sua história. Uma pegada que carrega a paixão pelo automobilismo e a homenagem eterna ao Senna, presente na nossa marca.",
  diferenciais: [
    { titulo: "Seleção a dedo", texto: "Cada carro é escolhido e preparado com capricho — nada de qualquer coisa." },
    { titulo: "Antigos e modificados", texto: "Fuscas, kombis, importados e projetos turbo, rebaixado, rodas e som. O nicho é esse." },
    { titulo: "Papo direto", texto: "Curtiu um carro? Fala com a gente na hora, no WhatsApp ou no Instagram." },
  ],
  aboutPhotos: [], // vazio = a seção "Nosso espaço" nem aparece no site (degrada)
};

// Coage a lista de fotos do espaço (nunca confiar no cliente): só objetos {path,url}.
export function sanitizeAboutPhotos(raw: unknown): SitePhoto[] {
  if (!Array.isArray(raw)) return [];
  const out: SitePhoto[] = [];
  for (const x of raw) {
    if (x && typeof x === "object" && "path" in x && "url" in x) {
      const p = String((x as SitePhoto).path).trim();
      const u = String((x as SitePhoto).url).trim();
      if (p && u) out.push({ path: p, url: u });
    }
    if (out.length >= MAX_ABOUT_PHOTOS) break;
  }
  return out;
}

// Mescla o que veio do banco SOBRE os defaults (campo vazio/ausente cai no default).
// Sempre devolve exatamente 3 diferenciais. Serve tanto na leitura quanto na
// sanitização da escrita (nunca confiar no cliente).
export function mergeSettings(raw: unknown): SiteSettings {
  const d = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const str = (v: unknown, fb: string) => (typeof v === "string" && v.trim() !== "" ? v : fb);
  const difRaw = Array.isArray(d.diferenciais) ? d.diferenciais : [];
  const diferenciais = DEFAULT_SETTINGS.diferenciais.map((def, i) => {
    const it = (difRaw[i] && typeof difRaw[i] === "object" ? difRaw[i] : {}) as Record<string, unknown>;
    return { titulo: str(it.titulo, def.titulo), texto: str(it.texto, def.texto) };
  });
  return {
    heroSubtitulo: str(d.heroSubtitulo, DEFAULT_SETTINGS.heroSubtitulo),
    sobreP1: str(d.sobreP1, DEFAULT_SETTINGS.sobreP1),
    sobreP2: str(d.sobreP2, DEFAULT_SETTINGS.sobreP2),
    diferenciais,
    aboutPhotos: sanitizeAboutPhotos(d.aboutPhotos),
  };
}

// cache(): dedupe por render (Header/Footer/página podem chamar sem N queries).
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = createReadClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULT_SETTINGS; // tabela ainda não existe / vazia
    return mergeSettings(data.data);
  } catch {
    return DEFAULT_SETTINGS;
  }
});
