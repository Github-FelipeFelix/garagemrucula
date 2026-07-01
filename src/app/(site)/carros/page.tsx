import type { Metadata } from "next";
import { getCars } from "@/lib/queries";
import { Vitrine } from "@/components/Vitrine";

export const metadata: Metadata = {
  title: "Carros",
  description: "Todos os carros da Garagem Rúcula: antigos, importados e modificados.",
};

export const revalidate = 60;

export default async function CarrosPage() {
  const cars = await getCars();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="section-title mb-2">Carros</h1>
      <p className="mb-8 text-muted">Fuscas, kombis, antigos, importados e projetos modificados.</p>
      <Vitrine cars={cars} />
    </div>
  );
}
