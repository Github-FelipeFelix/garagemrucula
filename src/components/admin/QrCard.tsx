"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";

// Gera o QR Code que leva à página do carro (para imprimir e colar no vidro em eventos).
export function QrCard({ url, slug }: { url: string; slug: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    QRCode.toDataURL(url, { width: 600, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [url]);

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
