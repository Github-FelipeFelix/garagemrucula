/**
 * Gera TODOS os assets de marca a partir da arte original do primo (pasta "Logos Garagem/").
 * Rodar da raiz do projeto:  node scripts/gerar-logos.cjs
 *
 * Fonte da verdade:
 *   Logos Garagem/Arte_Rucula_02.png  -> badge redondo (Kombi). Interior do circulo eh
 *                                        BRANCO OPACO na propria arte, entao ele ja fica
 *                                        legivel no fundo preto do site (nao inverter).
 *   Logos Garagem/Arte_Rucula.png     -> folha com 2 lockups "GARAGEM + Rucula".
 *                                        Usamos o de cima (GARAGEM condensado), que le melhor
 *                                        em tamanho pequeno que o de baixo (GARAGEM espacado).
 *
 * O wordmark eh PRETO (feito pra fundo claro) -> no fundo preto ele fica oco. Por isso geramos
 * a versao NEGATIVA (preto<->branco invertidos, verde preservado e clareado pra #4ade80, que eh
 * a variante clara da paleta -- regra do projeto: sobre fundo escuro usar a variante CLARA).
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "Logos Garagem");
const PUB = path.join(ROOT, "public");
const APP = path.join(ROOT, "src", "app");

const BADGE = path.join(SRC, "Arte_Rucula_02.png");
const SHEET = path.join(SRC, "Arte_Rucula.png");
const BG = { r: 10, g: 10, b: 10, alpha: 1 }; // #0a0a0a, o fundo do site
const GREEN = [0x4a, 0xde, 0x80]; // #4ade80 (verde claro da paleta)

/** Recorte do lockup de cima da folha (medido pelo perfil de alpha: y 0..972). */
const LOCKUP = { left: 0, top: 0, width: 2387, height: 973 };

/**
 * Versao negativa: inverte o que eh cinza (preto<->branco) e reaproveita o verde,
 * misturando proporcionalmente ao croma pra nao serrar as bordas anti-aliased.
 */
async function negativo(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 8) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const croma = Math.max(r, g, b) - Math.min(r, g, b);
    const inv = [255 - r, 255 - g, 255 - b];
    const t = Math.min(1, croma / 60); // 0 = cinza puro, 1 = verde saturado
    data[i] = Math.round(inv[0] * (1 - t) + GREEN[0] * t);
    data[i + 1] = Math.round(inv[1] * (1 - t) + GREEN[1] * t);
    data[i + 2] = Math.round(inv[2] * (1 - t) + GREEN[2] * t);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Badge centrado num quadrado de fundo #0a0a0a, ocupando `pct` do lado (icones do PWA). */
async function iconeQuadrado(badge, size, pct) {
  const inner = Math.round(size * pct);
  const art = await sharp(badge).resize(inner, inner, { fit: "inside" }).toBuffer();
  const m = await sharp(art).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: BG } })
    .composite([{ input: art, left: Math.round((size - m.width) / 2), top: Math.round((size - m.height) / 2) }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const escreve = async (buf, dest) => {
  await fs.promises.writeFile(dest, buf);
  // sharp nao le .ico -> nesse caso so reporta o tamanho.
  const dim = dest.endsWith(".ico") ? "" : await sharp(buf).metadata().then((m) => `  ${m.width}x${m.height}`);
  console.log(`  ok ${path.relative(ROOT, dest)}${dim}  ${(buf.length / 1024).toFixed(0)}kB`);
};

(async () => {
  for (const f of [BADGE, SHEET]) {
    if (!fs.existsSync(f)) throw new Error(`arte nao encontrada: ${f}`);
  }
  console.log("Gerando assets de marca…");

  // 1) Badge redondo (arte original, sem tratamento) — hero, Sobre, login do admin.
  const badge1024 = await sharp(BADGE).resize(1024, 1024, { fit: "inside" }).png({ compressionLevel: 9 }).toBuffer();
  await escreve(badge1024, path.join(PUB, "logo-badge.png"));

  // 2) Wordmark negativo — header, rodape, header do admin.
  const lockup = await sharp(SHEET).extract(LOCKUP).trim({ threshold: 10 }).toBuffer();
  const wordmark = await sharp(await negativo(lockup)).resize({ width: 1400 }).png({ compressionLevel: 9 }).toBuffer();
  await escreve(wordmark, path.join(PUB, "logo-wordmark.png"));

  // 3) Icones do PWA / favicon (badge sobre #0a0a0a, como os antigos).
  await escreve(await iconeQuadrado(badge1024, 192, 0.94), path.join(PUB, "icon-192.png"));
  const icon512 = await iconeQuadrado(badge1024, 512, 0.94);
  await escreve(icon512, path.join(PUB, "icon-512.png"));
  await escreve(await iconeQuadrado(badge1024, 512, 0.78), path.join(PUB, "icon-maskable-512.png")); // safe zone
  await escreve(await iconeQuadrado(badge1024, 180, 0.94), path.join(PUB, "apple-touch-icon.png"));
  await escreve(icon512, path.join(APP, "icon.png"));

  // 4) favicon.ico (32 + 48, o navegador escolhe).
  const pngToIco = (await import("png-to-ico")).default; // pacote eh ESM
  const ico = await pngToIco([await iconeQuadrado(badge1024, 48, 0.96), await iconeQuadrado(badge1024, 32, 0.96)]);
  await escreve(ico, path.join(APP, "favicon.ico"));

  // 5) og.jpg (1200x630) — preview do WhatsApp/Google: badge + wordmark sobre o preto com glow.
  const W = 1200, H = 630;
  const glow = Buffer.from(
    `<svg width="${W}" height="${H}"><defs>
       <radialGradient id="a" cx="26%" cy="45%" r="55%">
         <stop offset="0%" stop-color="#24a54b" stop-opacity="0.30"/>
         <stop offset="100%" stop-color="#24a54b" stop-opacity="0"/>
       </radialGradient>
       <radialGradient id="b" cx="82%" cy="80%" r="45%">
         <stop offset="0%" stop-color="#013c43" stop-opacity="0.55"/>
         <stop offset="100%" stop-color="#013c43" stop-opacity="0"/>
       </radialGradient>
     </defs><rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/></svg>`
  );
  const ogBadge = await sharp(badge1024).resize({ width: 450 }).toBuffer();
  const ogWord = await sharp(wordmark).resize({ width: 560 }).toBuffer();
  const wm = await sharp(ogWord).metadata();
  const og = await sharp({ create: { width: W, height: H, channels: 4, background: BG } })
    .composite([
      { input: glow },
      { input: ogBadge, left: 100, top: Math.round((H - 450) / 2) },
      { input: ogWord, left: 610, top: Math.round((H - wm.height) / 2) },
    ])
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toBuffer();
  await escreve(og, path.join(PUB, "og.jpg"));

  // 6) O logo antigo (fusca + kombi + Senna) sai de cena.
  const antigo = path.join(PUB, "logo.png");
  if (fs.existsSync(antigo)) {
    await fs.promises.unlink(antigo);
    console.log("  removido public/logo.png (logo antigo)");
  }
  console.log("Pronto.");
})();
