// Tela de login: senha errada continua "senha inválida"; servidor fora mostra
// aviso honesto (banner + erro) e o Google NÃO sai pra página de erro crua.
// Uso: node teste-login.cjs <url-do-site> [mock]   (mock = alterna modos no :54321)
const { chromium, devices } = require(process.env.USERPROFILE + "/.dev-browser/node_modules/playwright");
const SITE = process.argv[2];
const COM_MOCK = process.argv[3] === "mock";
const SHOTS = __dirname;
const MSG_FORA = "fora do ar no momento";
let falhas = 0;
const checar = (nome, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FALHA"} ${nome}${extra ? " — " + extra : ""}`);
  if (!ok) falhas++;
};
const modo = (m) => fetch("http://localhost:54321/__mode/" + m);

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices["iPhone 13"] });
  const page = await ctx.newPage();
  const erros = [];
  page.on("pageerror", (e) => erros.push(e.message));

  async function abrirLogin() {
    await page.goto(SITE + "/admin/login", { waitUntil: "networkidle" });
    await page.waitForTimeout(800); // checagem /api/status roda após montar
  }
  async function tentarSenha() {
    await page.fill('input[type="email"]', "teste-nao-existe@example.com");
    await page.fill('input[type="password"]', "senha-qualquer");
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => !document.querySelector('button[type="submit"]')?.disabled, null, { timeout: 15000 });
    return (await page.textContent("form")) || "";
  }

  if (COM_MOCK) {
    console.log("\n== Banco no ar ==");
    await modo("ok");
    await abrirLogin();
    checar("sem banner de 'fora do ar'", !(await page.content()).includes(MSG_FORA));
    let txt = await tentarSenha();
    checar("senha errada → 'E-mail ou senha inválidos.'", txt.includes("E-mail ou senha inválidos."), txt.trim().slice(-80));
    await page.click("text=Entrar com Google");
    await page.waitForURL((u) => !u.pathname.startsWith("/admin/login"), { timeout: 15000 }).catch(() => {});
    checar("Google redireciona pro provedor", page.url().includes("/auth/v1/authorize") && page.url().includes("provider=google"), page.url().slice(0, 90));
    await modo("402");
  }

  console.log("\n== Banco fora (402) ==");
  await abrirLogin();
  const banner = page.locator('p[role="status"]');
  checar("banner 'fora do ar' aparece ao abrir", (await banner.count()) === 1 && (await banner.textContent()).includes(MSG_FORA));
  await page.screenshot({ path: SHOTS + "/login-fora-do-ar.png" });
  let txt = await tentarSenha();
  checar("login por senha → aviso 'fora do ar' (não 'senha inválida')", txt.includes(MSG_FORA) && !txt.includes("senha inválidos"), txt.trim().slice(-90));
  await abrirLogin();
  await page.click("text=Entrar com Google");
  await page.waitForTimeout(2500);
  checar("Google NÃO sai do site (fica no login com o aviso)", new URL(page.url()).pathname === "/admin/login", page.url());
  checar("Google mostra o aviso 'fora do ar'", (await page.textContent("form")).includes(MSG_FORA));
  await page.screenshot({ path: SHOTS + "/login-google-fora-do-ar.png" });
  checar("sem erro de JavaScript na página", erros.length === 0, erros.join(" | "));

  if (COM_MOCK) await modo("ok");
  await browser.close();
  console.log(`\n${falhas === 0 ? "TUDO OK" : falhas + " FALHA(S)"}`);
  process.exit(falhas ? 1 : 0);
})();
