import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CarForm } from "@/components/admin/CarForm";

export default function NovoCarroPage() {
  return (
    <div>
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> voltar
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold">Novo carro</h1>
      <CarForm />
    </div>
  );
}
