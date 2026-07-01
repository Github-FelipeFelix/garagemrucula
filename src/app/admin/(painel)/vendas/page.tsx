import { createAdminClient } from "@/lib/supabase/admin";
import type { Car, CarSale } from "@/lib/types";
import { formatBRL } from "@/lib/format";

export const dynamic = "force-dynamic";

// 2 queries + join manual (regra 1).
async function getVendas(): Promise<Array<{ car: Car | null; sale: CarSale }>> {
  try {
    const supabase = createAdminClient();
    const { data: sales, error } = await supabase
      .from("car_sales")
      .select("*")
      .order("sold_at", { ascending: false, nullsFirst: false });
    if (error || !sales || sales.length === 0) return [];
    const ids = sales.map((s) => s.car_id).filter(Boolean);
    const { data: cars } = await supabase.from("cars").select("*").in("id", ids);
    const carMap = new Map((cars ?? []).map((c) => [c.id, c as Car]));
    return (sales as CarSale[]).map((sale) => ({ car: carMap.get(sale.car_id ?? "") ?? null, sale }));
  } catch (e) {
    console.error("[admin/vendas]", e);
    return [];
  }
}

export default async function VendasPage() {
  const vendas = await getVendas();
  const total = vendas.reduce((s, v) => s + (v.sale.sold_price ?? 0), 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Histórico de vendas</h1>
      <p className="mb-5 mt-1 text-sm text-muted">Controle particular — não aparece no site.</p>

      <div className="mb-6 rounded-xl border border-line bg-surface p-4">
        <p className="text-2xl font-bold text-senna">{formatBRL(total)}</p>
        <p className="text-sm text-muted">{vendas.length} venda(s) registrada(s)</p>
      </div>

      {vendas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center text-muted">
          Nenhuma venda registrada ainda. Marque um carro como “Vendido” e informe o valor no cadastro.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {vendas.map((v) => (
            <div
              key={v.sale.car_id}
              className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{v.car?.title ?? "(carro removido)"}</p>
                <p className="text-xs text-muted">
                  {v.sale.sold_at ? new Date(v.sale.sold_at).toLocaleDateString("pt-BR") : "sem data"}
                  {v.sale.notes ? ` · ${v.sale.notes}` : ""}
                </p>
              </div>
              <p className="shrink-0 font-bold text-senna">{formatBRL(v.sale.sold_price)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
