"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, Loader2, ImagePlus, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Media = { path: string; url: string };

function SortablePhoto({
  item,
  isCover,
  onRemove,
}: {
  item: Media;
  isCover: boolean;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.path,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
    >
      <Image src={item.url} alt="" fill sizes="120px" className="object-cover" />
      {isCover && (
        <span className="absolute left-1 top-1 rounded bg-senna px-1.5 py-0.5 text-[10px] font-bold text-black">
          capa
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
        aria-label="Remover foto"
      >
        <X size={12} />
      </button>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute bottom-1 right-1 cursor-grab touch-none rounded bg-black/70 p-1 text-white"
        aria-label="Arrastar"
      >
        <GripVertical size={12} />
      </button>
    </div>
  );
}

export function PhotoUploader({
  value,
  onChange,
}: {
  value: Media[];
  onChange: (m: Media[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    const supabase = createClient();
    const added: Media[] = [];
    for (const file of Array.from(files)) {
      try {
        const ext = file.name.split(".").pop() || "jpg";
        const res = await fetch("/api/admin/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ext }),
        });
        if (!res.ok) continue;
        const { path, token, publicUrl } = await res.json();
        const { error } = await supabase.storage.from("car-media").uploadToSignedUrl(path, token, file);
        if (error) {
          console.error("[upload]", error.message);
          continue;
        }
        added.push({ path, url: publicUrl });
      } catch (e) {
        console.error("[upload] fatal", e);
      }
    }
    onChange([...value, ...added]);
    setUploading(false);
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = value.findIndex((m) => m.path === active.id);
    const newIndex = value.findIndex((m) => m.path === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(value, oldIndex, newIndex));
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={value.map((m) => m.path)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {value.map((item, i) => (
              <SortablePhoto
                key={item.path}
                item={item}
                isCover={i === 0}
                onRemove={() => onChange(value.filter((m) => m.path !== item.path))}
              />
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line bg-surface text-muted transition hover:border-rucula-bright">
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <ImagePlus size={20} />}
              <span className="text-xs">{uploading ? "enviando…" : "adicionar"}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading}
                onChange={(e) => handleFiles(e.target.files)}
              />
            </label>
          </div>
        </SortableContext>
      </DndContext>
      <p className="mt-1.5 text-xs text-muted">A primeira foto é a capa. Arraste pela alça para reordenar.</p>
    </div>
  );
}
