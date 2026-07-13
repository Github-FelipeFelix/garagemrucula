import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { PartForm } from "@/components/admin/PartForm";
import type { Part } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getPart(id: string): Promise<Part | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("parts").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return data as Part;
  } catch {
    return null;
  }
}

type Params = { params: Promise<{ id: string }> };

export default async function EditarPecaPage({ params }: Params) {
  const { id } = await params;
  const part = await getPart(id);
  if (!part) notFound();

  return (
    <div>
      <Link href="/admin/pecas" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> voltar
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold">Editar peça</h1>
      <PartForm part={part} />
    </div>
  );
}
