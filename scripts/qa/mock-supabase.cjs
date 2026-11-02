// Mock mínimo do Supabase (PostgREST + Auth health) pra testar o ISR do site.
// Modos: GET /__mode/ok | /__mode/402 | /__mode/ok2 (ok2 = estoque novo, prova que regenera).
const http = require("http");

let mode = "ok";
const now = new Date().toISOString();
const car = (id, slug, title, extra = {}) => ({
  id, slug, title, created_at: now, updated_at: now, brand: "VW", model: "Mock", year: 1972,
  price: 45000, km: 1000, engine: "1600", transmission: "Manual", color: "Verde", fuel: "Gasolina",
  description: "Carro de teste", mods: ["turbo"], tags: ["antigo"], photos: [], videos: [],
  status: "disponivel", featured: true, views: 3, ...extra,
});
const FOTO = (n) => ({
  path: `cars/foto-${n}.jpg`,
  url: `http://localhost:54321/storage/v1/object/public/car-media/cars/foto-${n}.jpg`,
});
const CARS = [
  car("11111111-1111-1111-1111-111111111111", "fusca-mock", "Fusca Mock Turbo", {
    photos: [FOTO(1), FOTO(2), FOTO(3)],
  }),
  car("22222222-2222-2222-2222-222222222222", "kombi-mock", "Kombi Mock Rebaixada"),
];
const CAR_NOVO = car("33333333-3333-3333-3333-333333333333", "opala-mock", "Opala Mock Recem-Chegado");
const SETTINGS = [{ data: { heroSubtitulo: "MOCK subtitulo vindo do banco" } }];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
};
function send(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS });
  res.end(JSON.stringify(body));
}

http
  .createServer((req, res) => {
    const u = new URL(req.url, "http://x");
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS);
      return res.end();
    }
    if (u.pathname.startsWith("/__mode/")) {
      mode = u.pathname.slice(8);
      console.log("[mock] modo ->", mode);
      return send(res, 200, { mode });
    }
    if (mode === "402") {
      return send(res, 402, {
        message:
          "Service for this project is restricted due to the following violations: exceed_cached_egress_quota. The project owner must upgrade their plan or remove spend caps to restore service.",
      });
    }
    if (u.pathname === "/auth/v1/health") return send(res, 200, { version: "mock", name: "GoTrue" });
    if (u.pathname === "/auth/v1/token") {
      // Igual ao GoTrue real com senha errada.
      return send(res, 400, {
        code: "invalid_credentials",
        error_code: "invalid_credentials",
        msg: "Invalid login credentials",
        message: "Invalid login credentials",
      });
    }
    if (u.pathname === "/rest/v1/cars") {
      let rows =
        mode === "ok2"
          ? [CAR_NOVO, { ...CARS[0], title: "Fusca Mock Turbo (atualizado)" }, CARS[1]]
          : CARS;
      const slug = u.searchParams.get("slug");
      if (slug) rows = rows.filter((c) => "eq." + c.slug === slug);
      if (u.searchParams.get("featured") === "eq.true") rows = rows.filter((c) => c.featured);
      const limit = Number(u.searchParams.get("limit") || 0);
      if (limit) rows = rows.slice(0, limit);
      return send(res, 200, rows);
    }
    if (u.pathname === "/rest/v1/parts") return send(res, 200, []);
    if (u.pathname === "/rest/v1/site_settings") return send(res, 200, SETTINGS);
    if (u.pathname.startsWith("/rest/v1/rpc/")) {
      res.writeHead(204);
      return res.end();
    }
    console.log("[mock] rota nao tratada:", req.method, req.url);
    return send(res, 404, { message: "mock: rota nao tratada" });
  })
  .listen(54321, () => console.log("[mock] ouvindo em :54321, modo", mode));
