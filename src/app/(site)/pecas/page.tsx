import type { Metadata } from "next";
import { getParts } from "@/lib/parts-queries";
import { PartsVitrine } from "@/components/PartsVitrine";

export const metadata: Metadata = {
  title: "Peças e acessórios",
  description:
    "Peças e acessórios da Garagem Rucula: rodas, pneus, faróis, som e mais — para carros antigos, importados e modificados.",
};

export const revalidate = 60;

export default async function PecasPage() {
  const parts = await getParts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div data-reveal>
        <p className="eyebrow mb-3">Peças & acessórios</p>
        <h1 className="section-title mb-2">Peças</h1>
        <p className="mb-8 text-muted">
          Rodas, pneus, faróis, som e mais — do nosso estoque pro seu projeto.
        </p>
      </div>
      <PartsVitrine parts={parts} />
    </div>
  );
}
