import Link from "next/link";
import Image from "next/image";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon, InstagramIcon } from "./icons";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div
        data-reveal
        className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-12 text-center sm:flex-row sm:items-start sm:justify-between"
      >
        {/* Logo centralizado com o texto (no mobile e no desktop). */}
        <div className="flex max-w-sm flex-col items-center text-center">
          <Image src="/logo.png" alt="Garagem Rúcula" width={160} height={117} className="h-14 w-auto" />
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Compra e venda de carros antigos, importados e modificados. Fuscas, kombis e projetos
            que contam história.
          </p>
        </div>

        {/* Contato: centralizado no mobile, alinhado à esquerda no desktop. */}
        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">
          <p className="eyebrow">Contato</p>
          <a
            href={whatsappLink("Olá! Vim pelo site da Garagem Rúcula 🚗")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-ink transition hover:text-zap"
          >
            <WhatsAppIcon className="h-5 w-5 text-zap" />
            (19) 97416-5880
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 text-sm text-ink transition hover:text-rucula-bright"
          >
            <InstagramIcon className="h-5 w-5 text-rucula-bright" />
            @{INSTAGRAM_HANDLE}
          </a>
          <nav className="mt-3 flex flex-col items-center gap-2 text-sm text-muted sm:items-start">
            <Link href="/carros" className="transition hover:text-ink">Ver carros</Link>
            <Link href="/sobre" className="transition hover:text-ink">Sobre a garagem</Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-line py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} Garagem Rúcula. Todos os direitos reservados.
        {" · "}
        {/* Acesso discreto ao painel (o primo acha o admin de qualquer aparelho). A trava e o login. */}
        <Link href="/admin" className="text-muted/70 transition hover:text-ink">
          Painel
        </Link>
      </div>
    </footer>
  );
}
