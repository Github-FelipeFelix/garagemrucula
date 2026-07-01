"use client";

import { WhatsAppIcon } from "./icons";
import { carWhatsappMessage, whatsappLink } from "@/lib/format";

// Abre o WhatsApp com mensagem pronta E registra o lead no admin (regra: clique = lead).
// Usa <a> nativo (sem popup blocker); o lead vai por fetch keepalive em paralelo.
export function InteresseButton({
  car,
}: {
  car: { id: string; title: string; slug: string };
}) {
  const registrarLead = () => {
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ car_id: car.id, car_title: car.title, source: "whatsapp" }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <a
      href={whatsappLink(carWhatsappMessage(car))}
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
