import type { Metadata } from "next";
import Image from "next/image";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A história da Garagem Rúcula — do fusca verde rúcula ao nome que virou marca.",
};

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Image src="/logo.png" alt="Garagem Rúcula" width={220} height={160} className="mx-auto h-auto w-40" />

      <h1 className="mt-8 text-center font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
        A Garagem <span className="text-rucula-bright">Rúcula</span>
      </h1>

      <div className="mt-8 space-y-5 leading-relaxed text-muted">
        <p>
          Tudo começou com um Fusca <span className="text-ink">verde rúcula</span> — turbo, rodas de
          Porsche, feito no capricho. Foi esse carro que deu nome à garagem e mostrou o caminho:
          transformar clássicos em projetos que a galera para pra olhar.
        </p>
        <p>
          De lá pra cá, a Garagem Rúcula virou referência em <span className="text-ink">carros
          antigos, importados e modificados</span> — fuscas, kombis e projetos turbo e rebaixado, cada
          um com sua história. Uma pegada que carrega a paixão pelo automobilismo e a homenagem eterna
          ao <span className="text-ink">Senna</span>, presente na nossa marca.
        </p>
        <p>
          Aqui no site você vê o que está disponível — fotos, ficha e modificações de cada carro. Curtiu
          algum? É só chamar no WhatsApp ou no Instagram que a gente conversa.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink("Olá! Vim pelo site da Garagem Rúcula 🚗")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-zap"
        >
          <WhatsAppIcon className="h-5 w-5" /> (19) 97416-5880
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
          <InstagramIcon className="h-5 w-5" /> @{INSTAGRAM_HANDLE}
        </a>
      </div>
    </div>
  );
}
