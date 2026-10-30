"use client";

import { useState } from "react";
import { Loader2, Film, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Media = { path: string; url: string };

// Nome único (UUID), nunca sobrescrito → cache de 1 ano no navegador/CDN: quem
// assiste de novo não baixa o vídeo outra vez do Supabase.
const CACHE_1_ANO = "31536000";
// Limite por arquivo do plano do Supabase. Checar antes evita gastar o 4G do
// evento subindo um vídeo que seria recusado só no fim (antes: falha silenciosa).
const MAX_VIDEO_MB = 50;

export function VideoUploader({
  value,
  onChange,
  folder = "cars",
}: {
  value: Media[];
  onChange: (m: Media[]) => void;
  folder?: "cars" | "parts" | "espaco";
}) {
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setErro(null);
    const supabase = createClient();
    const added: Media[] = [];
    const falhas: string[] = [];
    for (const file of Array.from(files)) {
      if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
        falhas.push(`"${file.name}" passa de ${MAX_VIDEO_MB} MB`);
        continue;
      }
      try {
        const ext = file.name.split(".").pop() || "mp4";
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ext, folder }),
        });
        if (!res.ok) {
          falhas.push(`"${file.name}" não foi enviado`);
          continue;
        }
        const { path, token, publicUrl } = await res.json();
        const { error } = await supabase.storage
          .from("car-media")
          .uploadToSignedUrl(path, token, file, { cacheControl: CACHE_1_ANO });
        if (error) {
          console.error("[upload video]", error.message);
          falhas.push(`"${file.name}" não foi enviado`);
          continue;
        }
        added.push({ path, url: publicUrl });
      } catch (e) {
        console.error("[upload video] fatal", e);
        falhas.push(`"${file.name}" não foi enviado`);
      }
    }
    onChange([...value, ...added]);
    if (falhas.length) setErro(falhas.join(" · "));
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {value.map((v) => (
        <div key={v.path} className="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-2">
          <Film size={18} className="shrink-0 text-rucula-bright" />
          <span className="flex-1 truncate text-sm text-muted">{v.path.split("/").pop()}</span>
          <button
            type="button"
            onClick={() => onChange(value.filter((x) => x.path !== v.path))}
            className="rounded-md p-2 text-muted transition hover:bg-red-500/10 hover:text-red-400 active:scale-95"
            aria-label="Remover vídeo"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface px-4 py-3 text-sm text-muted transition hover:border-rucula-bright">
        {uploading ? <Loader2 className="animate-spin" size={18} /> : <Film size={18} />}
        {uploading ? "enviando vídeo…" : "adicionar vídeo"}
        <input
          type="file"
          accept="video/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
      {erro && <p className="text-sm text-red-400">{erro}</p>}
      <p className="text-xs text-muted">
        Até {MAX_VIDEO_MB} MB por vídeo. Vídeo pesa muito mais que foto pro site — prefira poucos e curtos.
      </p>
    </div>
  );
}
