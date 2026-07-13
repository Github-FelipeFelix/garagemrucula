"use client";

import { useState } from "react";
import { Loader2, Film, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Media = { path: string; url: string };

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

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const added: Media[] = [];
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop() || "mp4";
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ext, folder }),
        });
        if (!res.ok) continue;
        const { path, token, publicUrl } = await res.json();
        const { error } = await supabase.storage.from("car-media").uploadToSignedUrl(path, token, file);
        if (error) {
          console.error("[upload video]", error.message);
          continue;
        }
        added.push({ path, url: publicUrl });
      } catch (e) {
        console.error("[upload video] fatal", e);
      }
    }
    onChange([...value, ...added]);
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
    </div>
  );
}
