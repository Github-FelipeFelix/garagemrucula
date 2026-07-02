import type { CarStatus } from "@/lib/types";
import { CAR_STATUS_LABEL } from "@/lib/types";

// Fundo sólido pra leitura clara (antes era translúcido /15 e "sumia" no preto).
const styles: Record<CarStatus, string> = {
  disponivel: "bg-rucula-bright text-black border-transparent",
  reservado: "bg-senna text-black border-transparent",
  vendido: "bg-black/70 text-white/90 border-white/30",
};

export function StatusBadge({ status, className = "" }: { status: CarStatus; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${styles[status]} ${className}`}
    >
      {CAR_STATUS_LABEL[status]}
    </span>
  );
}
