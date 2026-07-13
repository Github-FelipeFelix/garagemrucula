import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PartForm } from "@/components/admin/PartForm";

export default function NovaPecaPage() {
  return (
    <div>
      <Link href="/admin/pecas" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft size={16} /> voltar
      </Link>
      <h1 className="mb-5 font-display text-2xl font-bold">Nova peça</h1>
      <PartForm />
    </div>
  );
}
