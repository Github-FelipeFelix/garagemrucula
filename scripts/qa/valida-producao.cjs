// Obs.: o HTML de TODA página traz "Página não encontrada" (o Next embute o 404 no payload) — checar pelo <title>.
// Validação do deploy em PRODUÇÃO (somente leitura; a única "escrita" é uma
// tentativa de login com e-mail inexistente, que o Supabase só recusa).
const { chromium, devices } = require(process.env.USERPROFILE + "/.dev-browser/node_modules/playwright");
const SITE = "https://www.garagemrucula.com.br";
let falhas = 0;
const checar = (nome, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FALHA"} ${nome}${extra ? " — " + extra : ""}`);
  if (!ok) falhas++;
};
const get = async (p) => {
  const r = await fetch(SITE + p, { headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1" } });
  return { status: r.status, h: r.headers, html: await r.text() };
};
const links = (html, base) => [...new Set([...html.matchAll(new RegExp(`href="/${base}/([a-z0-9-]+)"`, "g"))].map((m) => m[1]))];
const vazio = (h) => /Em breve, novos carros|Nenhum carro encontrado|Em breve, peças/.test(h);

(async () => {
  let r = await get("/");
  checar("home com carros", links(r.html, "carros").length > 0 && !vazio(r.html), `${links(r.html, "carros").length} carros, ${links(r.html, "pecas").length} peças`);
  r = await get("/carros");
  const carros = links(r.html, "carros");
  checar("/carros com os carros", carros.length >= 7, `${carros.length} anúncios`);
  r = await get("/pecas");
  const pecas = links(r.html, "pecas");
  checar("/pecas com as peças", pecas.length >= 3, `${pecas.length} peças`);

  const slug = carros[0];
  let a = await get(`/carros/${slug}`);
  await new Promise((r) => setTimeout(r, 3000));
  a = await get(`/carros/${slug}`); // 2ª visita (logo após um deploy a 1ª geração pode dar MISS)
  checar(`anúncio /carros/${slug} abre`, a.status === 200 && /<title>(?!Carro não encontrado)[^<]+ · Garagem Rucula<\/title>/.test(a.html), `status ${a.status}`);
  checar("anúncio em cache na 2ª visita (ISR)", /HIT|STALE|PRERENDER/.test(a.h.get("x-vercel-cache") || ""), `x-vercel-cache=${a.h.get("x-vercel-cache")}`);
  const imgs = [...a.html.matchAll(/<img[^>]*>/g)].map((m) => m[0]).filter((t) => t.includes("supabase.co"));
  const opcoes = (t) => ((t.match(/srcSet="([^"]*)"/i) || [])[1] || "").split(", ").filter(Boolean).length;
  const minis = imgs.filter((t) => /width="80"/.test(t));
  const galeria = imgs.filter((t) => /sizes="\(max-width: 1024px\) 100vw, 768px"/.test(t));
  checar("miniaturas com 2 opções no srcset", minis.length > 0 && minis.every((t) => opcoes(t) === 2), `${minis.length} miniaturas: ${[...new Set(minis.map(opcoes))]}`);
  checar("foto principal com 5 opções", galeria.length > 0 && galeria.every((t) => opcoes(t) === 5), `${galeria.length} fotos: ${[...new Set(galeria.map(opcoes))]}`);
  const umaFoto = ((galeria[0] || "").match(/src="([^"]+)"/) || [])[1]?.replace(/&amp;/g, "&");
  if (umaFoto) {
    const f = await fetch(new URL(umaFoto, SITE), { headers: { Accept: "image/avif,image/webp,*/*" } });
    const b = Buffer.from(await f.arrayBuffer());
    checar("foto do anúncio carrega pelo otimizador", f.ok && /image\//.test(f.headers.get("content-type")), `${f.status} ${f.headers.get("content-type")} ${(b.length / 1024).toFixed(0)} KB`);
  }
  const og = (a.html.match(/<meta property="og:image" content="([^"]+)"/) || [])[1];
  if (og) {
    const o = await fetch(og.replace(/&amp;/g, "&"));
    const b = Buffer.from(await o.arrayBuffer());
    checar("OG do carro (prévia do WhatsApp)", o.ok && /image\/png/.test(o.headers.get("content-type")) && b.length > 20000, `${o.status} ${(b.length / 1024).toFixed(0)} KB`);
  } else checar("OG do carro presente", false);
  if (pecas[0]) {
    const p = await get(`/pecas/${pecas[0]}`);
    checar(`peça /pecas/${pecas[0]} abre`, p.status === 200 && /<title>(?!Peça não encontrada)[^<]+ · Garagem Rucula<\/title>/.test(p.html), `status ${p.status}`);
  }
  const st = await (await fetch(SITE + "/api/status")).json();
  checar("/api/status ok", st.ok === true, JSON.stringify(st));
  const sm = await (await fetch(SITE + "/sitemap.xml")).text();
  checar("sitemap com os anúncios", (sm.match(/\/carros\//g) || []).length >= 7, `${(sm.match(/\/carros\//g) || []).length} carros`);

  // Login no iPhone: sem banner de "fora do ar"; senha errada = "senha inválida".
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ ...devices["iPhone 13"] })).newPage();
  const errosJs = [];
  page.on("pageerror", (e) => errosJs.push(e.message));
  await page.goto(SITE + "/admin/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  checar("login sem banner de 'fora do ar'", (await page.locator('p[role="status"]').count()) === 0);
  await page.fill('input[type="email"]', "teste-nao-existe@example.com");
  await page.fill('input[type="password"]', "senha-qualquer-errada");
  await page.click('button[type="submit"]');
  await page.waitForFunction(() => !document.querySelector('button[type="submit"]')?.disabled, null, { timeout: 15000 });
  const txt = (await page.textContent("form")) || "";
  checar("senha errada → 'E-mail ou senha inválidos.'", txt.includes("E-mail ou senha inválidos."), txt.trim().slice(-60));
  checar("sem erro de JavaScript no login", errosJs.length === 0, errosJs.join(" | "));
  await browser.close();

  console.log(`\n${falhas === 0 ? "PRODUÇÃO OK" : falhas + " FALHA(S)"}`);
  process.exit(falhas ? 1 : 0);
})().catch((e) => { console.error("ERRO:", e.message); process.exit(1); });
