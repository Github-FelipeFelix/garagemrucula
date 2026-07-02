import type { CarStatus } from "@/lib/types";
import { CAR_STATUS_LABEL } from "@/lib/types";

// Fundo sólido pra leitura clara. SEM borda (a "bordinha" preta vinha do `border`
// herdando a cor da linha no Tailwind v4). Só "vendido" leva uma borda discreta.
const styles: Record<CarStatus, string> = {
  disponivel: "bg-rucula-bright text-black",
  reservado: "bg-senna text-black",
  vendido: "border border-white/30 bg-black/70 text-white/90",
};

export function StatusBadge({ status, className = "" }: { status: CarStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${styles[status]} ${className}`}
    >
      {CAR_STATUS_LABEL[status]}
    </span>
  );
}
