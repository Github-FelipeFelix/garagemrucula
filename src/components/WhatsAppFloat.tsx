import { whatsappLink } from "@/lib/format";
import { WhatsAppIcon } from "./icons";

// Botao flutuante de WhatsApp, presente em todo o site publico.
export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Olá! Vim pelo site da Garagem Rúcula 🚗")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="wa-pulse fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zap text-white shadow-lg shadow-black/40 transition duration-300 hover:scale-110 hover:shadow-[0_0_28px_rgba(37,211,102,0.6)] active:scale-95"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
