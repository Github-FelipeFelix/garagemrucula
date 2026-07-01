import { createAdminClient } from "@/lib/supabase/admin";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<Lead[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      console.error("[admin/leads]", error.message);
      return [];
    }
    return (data ?? []) as Lead[];
  } catch (e) {
    console.error("[admin/leads] fatal", e);
    return [];
  }
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Leads</h1>
      <p className="mb-5 mt-1 text-sm text-muted">
        Cada clique em “tenho interesse” fica registrado aqui (a conversa acontece no WhatsApp).
      </p>

      {leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          Nenhum lead ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{l.car_title || "(carro removido)"}</p>
                <p className="text-xs text-muted">
                  {new Date(l.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-petroleo/50 px-2.5 py-1 text-xs text-rucula-bright">
                {l.source}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
