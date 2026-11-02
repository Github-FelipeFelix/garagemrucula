// Backup completo do bucket car-media — SOMENTE LEITURA no Storage.
// Uso: node backup-bucket.cjs <pasta-destino>   (env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
// Gera <destino>/car-media/... + manifest.json e confere contagem/bytes/sha256 no disco.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEST = process.argv[2];
const BUCKET = "car-media";
if (!BASE || !KEY || !DEST) {
  console.error("uso: node backup-bucket.cjs <destino> (com as env do Supabase)");
  process.exit(2);
}
if (fs.existsSync(DEST) && fs.readdirSync(DEST).length) {
  console.error("destino já existe e não está vazio — não sobrescrevo:", DEST);
  process.exit(2);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");

async function listar(prefix) {
  const out = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${BASE}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...H, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000, offset, sortBy: { column: "name", order: "asc" } }),
    });
    if (!r.ok) throw new Error(`list "${prefix}": HTTP ${r.status} ${await r.text()}`);
    const itens = await r.json();
    for (const it of itens) {
      const full = prefix ? `${prefix}/${it.name}` : it.name;
      if (it.id === null || !it.metadata) out.push(...(await listar(full))); // pasta
      else out.push({ path: full, size: it.metadata.size, mimetype: it.metadata.mimetype, cacheControl: it.metadata.cacheControl });
    }
    if (itens.length < 1000) break;
  }
  return out;
}

async function baixar(obj) {
  for (let tentativa = 1; ; tentativa++) {
    try {
      const r = await fetch(`${BASE}/storage/v1/object/${BUCKET}/${enc(obj.path)}`, { headers: H });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length !== obj.size) throw new Error(`tamanho ${buf.length} != listado ${obj.size}`);
      const file = path.join(DEST, BUCKET, ...obj.path.split("/"));
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
      return { ...obj, sha256: crypto.createHash("sha256").update(buf).digest("hex") };
    } catch (e) {
      if (tentativa >= 3) throw new Error(`${obj.path}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 1500 * tentativa));
    }
  }
}

(async () => {
  const objs = await listar("");
  const total = objs.reduce((s, o) => s + o.size, 0);
  console.log(`listados: ${objs.length} arquivos, ${(total / 1048576).toFixed(1)} MB`);
  const feitos = [];
  for (let i = 0; i < objs.length; i += 4) {
    feitos.push(...(await Promise.all(objs.slice(i, i + 4).map(baixar))));
    if ((i / 4) % 10 === 0) console.log(`  ${feitos.length}/${objs.length}`);
  }
  fs.writeFileSync(path.join(DEST, "manifest.json"), JSON.stringify({ bucket: BUCKET, criadoEm: new Date().toISOString(), arquivos: feitos }, null, 2));

  // Conferência no DISCO (independente do download): contagem, bytes e sha256.
  let ok = 0, bytes = 0;
  for (const o of feitos) {
    const buf = fs.readFileSync(path.join(DEST, BUCKET, ...o.path.split("/")));
    const sha = crypto.createHash("sha256").update(buf).digest("hex");
    if (buf.length === o.size && sha === o.sha256) { ok++; bytes += buf.length; }
    else console.log("DIVERGENTE:", o.path);
  }
  const porTipo = {};
  for (const o of feitos) porTipo[o.mimetype] = (porTipo[o.mimetype] || 0) + 1;
  console.log("por tipo:", JSON.stringify(porTipo));
  console.log(`conferidos no disco: ${ok}/${objs.length} arquivos, ${bytes}/${total} bytes`);
  console.log(ok === objs.length && bytes === total ? "BACKUP OK" : "BACKUP COM PROBLEMA");
  process.exit(ok === objs.length && bytes === total ? 0 : 1);
})().catch((e) => { console.error("FALHOU:", e.message); process.exit(1); });
