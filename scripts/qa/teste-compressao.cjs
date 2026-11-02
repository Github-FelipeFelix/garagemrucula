// Testa comprimirFoto() — o código EXATO do PhotoUploader.tsx (extraído e
// transpilado) — no Chromium e no WebKit, com fotos geradas pelo sharp.
const fs = require("fs");
const path = require("path");
// Cópia de QA fora do OneDrive (ver scripts/qa/README.md).
const GRQA = process.env.QA_DIR || process.env.TEMP + "/grqa";
const ts = require(GRQA + "/node_modules/typescript");
const sharp = require(GRQA + "/node_modules/sharp");
const { chromium, webkit } = require(process.env.USERPROFILE + "/.dev-browser/node_modules/playwright");
const DIR = path.join(__dirname, "fotos-teste");
let falhas = 0;
const checar = (nome, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FALHA"} ${nome}${extra ? " — " + extra : ""}`);
  if (!ok) falhas++;
};

function extrairCodigo() {
  const src = fs.readFileSync(GRQA + "/src/components/admin/PhotoUploader.tsx", "utf8");
  const ini = src.indexOf("const MAX_LADO");
  const fim = src.indexOf("function SortablePhoto");
  if (ini < 0 || fim < 0) throw new Error("não achei comprimirFoto no PhotoUploader.tsx");
  return ts.transpileModule(src.slice(ini, fim), { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
}

async function gerarFotos() {
  fs.mkdirSync(DIR, { recursive: true });
  // 12 MP "de celular": metade de cima vermelha, de baixo azul (no arquivo), com
  // ruído pra pesar como foto real, e EXIF orientation=6 (girar 90° pra exibir).
  const w = 4032, h = 3024, raw = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3, n = (x * 7 + y * 13) % 40;
      if (y < h / 2) { raw[i] = 200 + (n % 55); raw[i + 1] = n; raw[i + 2] = n; }
      else { raw[i] = n; raw[i + 1] = n; raw[i + 2] = 200 + (n % 55); }
    }
  await sharp(raw, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 95 }).withMetadata({ orientation: 6 }).toFile(DIR + "/celular-12mp.jpg");
  await sharp({ create: { width: 1200, height: 900, channels: 3, background: "#2e7d32" } })
    .jpeg({ quality: 80 }).toFile(DIR + "/pequena.jpg");
  await sharp({ create: { width: 3000, height: 2000, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .png().toFile(DIR + "/transparente.png");
}

async function rodar(engine, nome, codigo) {
  console.log(`\n== ${nome} ==`);
  const browser = await engine.launch();
  const page = await browser.newPage();
  await page.setContent('<input type="file" id="f" multiple>');
  await page.addScriptTag({ content: codigo });
  await page.setInputFiles("#f", [DIR + "/celular-12mp.jpg", DIR + "/pequena.jpg", DIR + "/transparente.png"]);
  const r = await page.evaluate(async () => {
    const out = [];
    for (const f of document.getElementById("f").files) {
      const c = await comprimirFoto(f);
      const img = document.createElement("img");
      img.src = URL.createObjectURL(c);
      await img.decode();
      const cv = document.createElement("canvas");
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      const ctx = cv.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const px = (fx, fy) => Array.from(ctx.getImageData(Math.floor(cv.width * fx), Math.floor(cv.height * fy), 1, 1).data);
      out.push({ entrada: f.name, entradaKB: Math.round(f.size / 1024), saida: c.name, tipo: c.type,
        saidaKB: Math.round(c.size / 1024), mesmoArquivo: c === f, w: img.naturalWidth, h: img.naturalHeight,
        esquerda: px(0.25, 0.5), direita: px(0.75, 0.5) });
    }
    return out;
  });
  for (const x of r) console.log(`     ${x.entrada} ${x.entradaKB} KB → ${x.saida} ${x.saidaKB} KB (${x.tipo}, ${x.w}x${x.h})`);
  const [cel, peq, png] = r;
  checar("12 MP: reduzida pra 2560px no lado maior", Math.max(cel.w, cel.h) === 2560, `${cel.w}x${cel.h}`);
  checar("12 MP: em pé (rotação EXIF aplicada)", cel.h > cel.w);
  // orientation 6 = 90° horário: o que era o topo (vermelho) vai pra DIREITA.
  const vermelho = (p) => p[0] > 150 && p[2] < 100, azul = (p) => p[2] > 150 && p[0] < 100;
  checar("12 MP: conteúdo girado pro lado certo", vermelho(cel.direita) && azul(cel.esquerda), `esq ${cel.esquerda} dir ${cel.direita}`);
  checar("12 MP: virou JPEG bem menor", cel.tipo === "image/jpeg" && cel.saidaKB < cel.entradaKB / 2, `${cel.entradaKB} → ${cel.saidaKB} KB`);
  checar("12 MP: nome .jpg", cel.saida === "celular-12mp.jpg");
  checar("foto já leve: sobe o original intacto", peq.mesmoArquivo);
  checar("PNG (pode ter transparência): sobe o original intacto", png.mesmoArquivo);
  await browser.close();
}

(async () => {
  await gerarFotos();
  const codigo = extrairCodigo();
  await rodar(chromium, "Chromium (Chrome/Android)", codigo);
  await rodar(webkit, "WebKit (Safari/iPhone)", codigo);
  console.log(`\n${falhas === 0 ? "TUDO OK" : falhas + " FALHA(S)"}`);
  process.exit(falhas ? 1 : 0);
})();
