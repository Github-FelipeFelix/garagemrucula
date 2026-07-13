import type { Metadata } from "next";
import Image from "next/image";
import { Award, Wrench } from "lucide-react";
import { WhatsAppIcon, InstagramIcon } from "@/components/icons";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/site";
import { whatsappLink } from "@/lib/format";
import { getSiteSettings } from "@/lib/settings";
import { EspacoGallery } from "@/components/EspacoGallery";

export const metadata: Metadata = {
  title: "Sobre",
  description: "A história da Garagem Rucula — do fusca verde rucula ao nome que virou marca.",
};

// ISR: revalida pra pegar o texto editado no admin (o admin também força na hora).
export const revalidate = 60;

// Ícones fixos (por índice); o TEXTO dos diferenciais é editável no /admin/site.
const DIF_ICONS = [Award, Wrench, WhatsAppIcon];

export default async function SobrePage() {
  const s = await getSiteSettings();
  const diferenciais = s.diferenciais.map((d, i) => ({ ...d, icon: DIF_ICONS[i] ?? Award }));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div data-reveal className="flex flex-col items-center text-center">
        <Image src="/logo.png" alt="Garagem Rucula" width={220} height={160} className="h-auto w-40" />
        <p className="eyebrow mt-6">Nossa história</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold uppercase tracking-tight sm:text-4xl">
          A Garagem <span className="text-rucula-bright">Rucula</span>
        </h1>
      </div>

      <div data-reveal className="mt-8 space-y-5 leading-relaxed text-muted">
        <p className="whitespace-pre-line">{s.sobreP1}</p>
        <p className="whitespace-pre-line">{s.sobreP2}</p>
      </div>

      <div data-reveal-stagger className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {diferenciais.map((d, i) => (
          <div
            key={i}
            className="card relative p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rucula/50"
          >
            <d.icon className="h-6 w-6 text-rucula-bright" />
            <h3 className="mt-3 font-display font-bold">{d.titulo}</h3>
            <p className="mt-1 text-sm text-muted">{d.texto}</p>
          </div>
        ))}
      </div>

      <EspacoGallery photos={s.aboutPhotos} />

      <div data-reveal className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <a
          href={whatsappLink("Olá! Vim pelo site da Garagem Rucula 🚗")}
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
