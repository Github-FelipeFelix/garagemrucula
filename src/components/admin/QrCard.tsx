"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

// Gera o QR Code que leva à página do carro (para imprimir e colar no vidro em eventos).
// A URL é montada no client a partir do host real (window.location.origin), então o QR
// aponta sempre para o domínio que o admin está acessando — sem depender de env var.
export function QrCard({ slug }: { slug: string }) {
  const [url, setUrl] = useState("");
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const u = `${window.location.origin}/carros/${slug}`;
    setUrl(u);
    QRCode.toDataURL(u, { width: 600, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [slug]);

  return (
    <div className="flex items-center gap-4">
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR Code do carro" className="h-36 w-36 rounded-lg bg-white p-1" />
      ) : (
        <div className="h-36 w-36 animate-pulse rounded-lg bg-surface-2" />
      )}
      <div className="flex flex-col gap-2">
        <p className="break-all text-xs text-muted">{url}</p>
        {dataUrl && (
          <a href={dataUrl} download={`qr-${slug}.png`} className="btn btn-outline w-fit">
            <Download size={16} /> Baixar QR
          </a>
        )}
      </div>
    </div>
  );
}
