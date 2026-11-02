// Recomprime IN-PLACE as fotos JPEG antigas do bucket car-media, a partir do BACKUP
// local (não baixa de novo). Mesmo path = mesma URL: o banco não muda.
// Uso: node recomprimir-fotos.cjs <pasta-do-backup> <caminho-do-sharp> [--seco]
// Regras: só JPEG (PNG/WebP/vídeo intactos), só se > 1,5 MB ou lado > 2560 px; rotate()
// pelo EXIF, 2560 px, JPEG 85% (mozjpeg); nunca sobe arquivo maior que o original;
// confere cada upload relendo do Storage (bytes + decodifica). Para no 1º erro.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const [BACKUP, SHARP] = process.argv.slice(2);
const SECO = process.argv.includes("--seco");
const sharp = require(SHARP);
const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "car-media";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const MB = (n) => (n / 1048576).toFixed(2);

async function processar(o) {
  const orig = fs.readFileSync(path.join(BACKUP, BUCKET, ...o.path.split("/")));
  if (sha(orig) !== o.sha256) throw new Error(`${o.path}: backup não bate com o manifest`);
  const meta = await sharp(orig).metadata();
  const giro = (meta.orientation || 1) >= 5; // 5–8 trocam largura/altura
  const w = giro ? meta.height : meta.width;
  const h = giro ? meta.width : meta.height;
  if (orig.length <= 1.5 * 1048576 && Math.max(w, h) <= 2560) return { ...o, acao: "pulada (já leve)" };

  const novo = await sharp(orig)
    .rotate()
    .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  if (novo.length >= orig.length) return { ...o, acao: "pulada (não diminuiu)" };
  const nm = await sharp(novo).metadata();
  if (SECO) return { ...o, acao: "seco", antes: orig.length, depois: novo.length, dim: `${w}x${h}→${nm.width}x${nm.height}` };

  // Retomável: o que já foi trocado numa rodada anterior não sobe de novo (só reconfere).
  const info = await fetch(`${BASE}/storage/v1/object/info/${BUCKET}/${enc(o.path)}`, { headers: H }).then((x) => x.json());
  let acao = "recomprimida";
  if (info.size === novo.length) acao = "recomprimida (rodada anterior)";
  else if (info.size !== orig.length) throw new Error(`${o.path}: tamanho inesperado no servidor (${info.size})`);
  else {
    const r = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${enc(o.path)}`, {
      method: "PUT",
      headers: { ...H, "Content-Type": "image/jpeg", "cache-control": "max-age=31536000", "x-upsert": "true" },
      body: novo,
    });
    if (!r.ok) throw new Error(`${o.path}: upload HTTP ${r.status} ${await r.text()}`);
  }

  // Confere relendo do Storage. No plano grátis a CDN (Cloudflare) NÃO é invalidada
  // ao sobrescrever — sem o "fura-cache" ela devolve o arquivo antigo por até 1 h.
  const g = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${enc(o.path)}?cb=${Date.now()}-${Math.random()}`, { headers: H });
  const lido = Buffer.from(await g.arrayBuffer());
  if (!g.ok || sha(lido) !== sha(novo)) throw new Error(`${o.path}: conferência falhou (HTTP ${g.status}, ${lido.length} bytes)`);
  const lm = await sharp(lido).metadata();
  if (lm.format !== "jpeg" || lm.width !== nm.width || lm.height !== nm.height) throw new Error(`${o.path}: imagem relida inválida`);
  return { ...o, acao, antes: orig.length, depois: novo.length, dim: `${w}x${h}→${lm.width}x${lm.height}` };
}

(async () => {
  if (!BASE || !KEY || !BACKUP || !SHARP) throw new Error("faltam argumentos/env");
  const { arquivos } = JSON.parse(fs.readFileSync(path.join(BACKUP, "manifest.json"), "utf8"));
  const jpegs = arquivos.filter((o) => o.mimetype === "image/jpeg");
  console.log(`${arquivos.length} no backup; ${jpegs.length} JPEG candidatos; ${arquivos.length - jpegs.length} intocados (PNG etc.)${SECO ? " — MODO SECO (não sobe nada)" : ""}`);
  const res = [];
  for (let i = 0; i < jpegs.length; i += 3) {
    res.push(...(await Promise.all(jpegs.slice(i, i + 3).map(processar))));
    if ((i / 3) % 10 === 0) console.log(`  ${res.length}/${jpegs.length}`);
  }
  const mexidas = res.filter((x) => x.antes);
  const antes = mexidas.reduce((s, x) => s + x.antes, 0);
  const depois = mexidas.reduce((s, x) => s + x.depois, 0);
  const contagem = {};
  for (const x of res) contagem[x.acao] = (contagem[x.acao] || 0) + 1;
  console.log(JSON.stringify(contagem));
  console.log(`fotos ${SECO ? "que seriam " : ""}recomprimidas: ${mexidas.length} — ${MB(antes)} MB → ${MB(depois)} MB (${((1 - depois / antes) * 100).toFixed(1)}% menor)`);
  for (const x of mexidas.slice(0, 5)) console.log(`  ex.: ${x.path} ${MB(x.antes)}→${MB(x.depois)} MB ${x.dim}`);
  fs.writeFileSync(path.join(BACKUP, SECO ? "relatorio-seco.json" : "relatorio-recompressao.json"), JSON.stringify(res, null, 2));
})().catch((e) => { console.error("PAROU:", e.message); process.exit(1); });
