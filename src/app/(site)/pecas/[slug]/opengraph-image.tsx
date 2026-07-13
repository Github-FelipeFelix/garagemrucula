import { ImageResponse } from "next/og";
import { getPartBySlug } from "@/lib/parts-queries";
import { PART_CONDITION_LABEL } from "@/lib/types";
import { formatBRL } from "@/lib/format";
import { siteUrl } from "@/lib/site";

// Imagem de preview (WhatsApp/Instagram/Google) por peça: foto + nome + preço + selo.
export const runtime = "nodejs";
export const alt = "Garagem Rucula";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const part = await getPartBySlug(slug).catch(() => null);
  // Passa a capa pelo otimizador do site: corrige EXIF (Satori não aplica) e
  // devolve JPEG (sem Accept webp/avif), que o Satori entende.
  const rawCover = part?.photos?.[0]?.url;
  const cover = rawCover
    ? `${siteUrl()}/_next/image?url=${encodeURIComponent(rawCover)}&w=1200&q=75`
    : undefined;
  const title = part?.title ?? "Garagem Rucula";
  const price = part ? formatBRL(part.price) : "";
  const chips = part
    ? [part.category, PART_CONDITION_LABEL[part.condition]].filter((c): c is string => !!c)
    : [];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : null}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(to top, rgba(10,10,10,0.97) 22%, rgba(10,10,10,0.35) 70%, rgba(10,10,10,0.15) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            width: "100%",
            height: "100%",
            padding: 70,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 30,
              color: "#4ade80",
              fontWeight: 700,
              letterSpacing: 4,
            }}
          >
            GARAGEM RUCULA · PEÇAS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              color: "#fafafa",
              fontWeight: 800,
              marginTop: 12,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          {price ? (
            <div style={{ display: "flex", fontSize: 58, color: "#f3e838", fontWeight: 800, marginTop: 16 }}>
              {price}
            </div>
          ) : null}
          {chips.length > 0 ? (
            <div style={{ display: "flex", marginTop: 22 }}>
              {chips.map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    fontSize: 26,
                    color: "#4ade80",
                    background: "rgba(1,60,67,0.7)",
                    padding: "8px 20px",
                    borderRadius: 999,
                    marginRight: 12,
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ),
    { ...size },
  );
}
