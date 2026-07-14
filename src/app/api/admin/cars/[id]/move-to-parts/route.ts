import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/auth";
import { ensureUniquePartSlug, PART_REVALIDATE_PATHS } from "@/lib/part-input";
import { copyPartMediaToNewPaths } from "@/lib/parts-storage";
import { removeMediaSafely } from "@/lib/storage-media";
import { REVALIDATE_PATHS } from "@/lib/car-input";
import type { Car } from "@/lib/types";

type Ctx = { params: Promise<{ id: string }> };

// Converte um CARRO em PEÇA (o primo cadastrou peça como carro antes de existir a
// área). Não recadastra: mapeia os campos comuns, COPIA as fotos/vídeos pra novos
// paths (a peça fica dona deles), apaga o carro e limpa só os arquivos antigos que
// a peça NÃO adotou — sem risco de matar a foto da peça (padrão do fix #39).
export async function POST(_request: NextRequest, { params }: Ctx) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("cars").select("*").eq("id", id).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Carro não encontrado" }, { status: 404 });

  const car = data as Car;

  // Copia as mídias pra parts/ (a peça não pode apontar pros mesmos arquivos do
  // carro que vamos apagar). Se a cópia falhar, mantém a referência original — e
  // o cleanup abaixo (que só remove o que a peça NÃO adotou) protege esse caso.
  const photos = await copyPartMediaToNewPaths(supabase, car.photos ?? []);
  const videos = await copyPartMediaToNewPaths(supabase, car.videos ?? []);

  const slug = await ensureUniquePartSlug(supabase, car.slug);
  const payload = {
    slug,
    title: car.title,
    category: null, // o primo escolhe depois (redireciona pra edição da peça)
    condition: "usado",
    brand: car.brand,
    compatibility: null,
    price: car.price,
    description: car.description,
    tags: car.tags ?? [],
    photos,
    videos,
    status: car.status,
    featured: car.featured,
  };

  const { data: novo, error: insErr } = await supabase
    .from("parts")
    .insert(payload)
    .select("id")
    .single();
  if (insErr) {
    console.error("[move-to-parts]", insErr.message);
    const friendly = /relation .* does not exist|"?parts"?/i.test(insErr.message)
      ? "A tabela de peças ainda não foi criada no banco. Rode a migração 0003_parts.sql."
      : insErr.message;
    return NextResponse.json({ error: friendly }, { status: 400 });
  }

  // Apaga o carro (a linha) e limpa do bucket SÓ os arquivos antigos que a peça
  // não adotou (cópia OK) e que nenhum outro carro usa. Assim a peça nunca perde
  // foto: se a cópia caiu no fallback (mesmo path), esse path fica de fora daqui.
  const { error: delErr } = await supabase.from("cars").delete().eq("id", id);
  if (delErr) {
    // A peça já foi criada; não falhar a operação. Só loga (o carro pode ser
    // apagado à mão depois). Melhor peça-criada-e-carro-duplicado do que perder tudo.
    console.error("[move-to-parts] delete car", delErr.message);
  } else {
    const oldPaths = [...(car.photos ?? []), ...(car.videos ?? [])]
      .map((m) => m.path)
      .filter(Boolean);
    const adopted = new Set([...photos, ...videos].map((m) => m.path));
    const removable = oldPaths.filter((p) => p && !adopted.has(p));
    await removeMediaSafely(supabase, removable);
  }

  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  for (const p of PART_REVALIDATE_PATHS) revalidatePath(p);
  revalidatePath(`/carros/${car.slug}`);
  return NextResponse.json({ id: novo.id });
}
