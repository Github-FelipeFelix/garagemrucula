import { ImageResponse } from "next/og";
import { getCarBySlug } from "@/lib/queries";
import { formatBRL } from "@/lib/format";

// Imagem de preview (WhatsApp/Instagram/Google) gerada por carro: foto de capa
// + nome + preço + marca. Substitui a og:image estática pela versão estilizada.
export const runtime = "nodejs";
export const alt = "Garagem Rúcula";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const car = await getCarBySlug(slug).catch(() => null);
  const cover = car?.photos?.[0]?.url;
  const title = car?.title ?? "Garagem Rúcula";
  const price = car ? formatBRL(car.price) : "";
  const tags = (car?.tags ?? []).slice(0, 3);

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
        {/* Escurece a base pra dar contraste ao texto */}
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
            GARAGEM RÚCULA
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
          {tags.length > 0 ? (
            <div style={{ display: "flex", marginTop: 22 }}>
              {tags.map((t) => (
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
