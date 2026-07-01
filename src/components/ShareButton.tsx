"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const onClick = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        /* usuario cancelou */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem clipboard */
    }
  };

  return (
    <button type="button" onClick={onClick} className="btn btn-outline w-full">
      {copied ? <Check size={18} /> : <Share2 size={18} />}
      {copied ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
