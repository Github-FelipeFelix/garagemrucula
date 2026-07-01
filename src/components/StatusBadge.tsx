import type { CarStatus } from "@/lib/types";
import { CAR_STATUS_LABEL } from "@/lib/types";

const styles: Record<CarStatus, string> = {
  disponivel: "bg-rucula/15 text-rucula-bright border-rucula/40",
  reservado: "bg-senna/15 text-senna border-senna/40",
  vendido: "bg-white/10 text-white/60 border-white/20",
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
