"use client";

import { WhatsAppIcon } from "./icons";
import { partWhatsappMessage, whatsappLink } from "@/lib/format";

// Abre o WhatsApp com mensagem pronta da PEÇA E registra o lead no admin (part_id).
// <a> nativo (sem popup blocker); o lead vai por fetch keepalive em paralelo.
export function InteressePecaButton({
  part,
}: {
  part: { id: string; title: string; slug: string };
}) {
  const registrarLead = () => {
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ part_id: part.id, car_title: part.title, source: "whatsapp" }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <a
      href={whatsappLink(partWhatsappMessage(part))}
      target="_blank"
      rel="noopener noreferrer"
      onClick={registrarLead}
      className="btn btn-zap w-full"
    >
      <WhatsAppIcon className="h-5 w-5" />
      Tenho interesse
    </a>
  );
}
