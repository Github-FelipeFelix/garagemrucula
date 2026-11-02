// Cenário real do incidente: site no ar com carros → Supabase passa a responder 402
// → a regeneração ISR (revalidate=60) NÃO pode trocar a página boa por uma vazia.
// Depois: Supabase volta → as páginas se atualizam sozinhas.
const SITE = "http://localhost:3100";
const MOCK = "http://localhost:54321";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0;

async function get(path) {
  const r = await fetch(SITE + path, { redirect: "manual" });
  return { status: r.status, cache: r.headers.get("x-nextjs-cache"), html: await r.text() };
}
function checar(nome, ok, extra = "") {
  console.log(`${ok ? "OK  " : "FALHA"} ${nome}${extra ? " — " + extra : ""}`);
  if (!ok) falhas++;
}
const temCarros = (h) => h.includes("Fusca Mock Turbo") && h.includes("Kombi Mock Rebaixada");
const vazio = (h) => h.includes("Em breve, novos carros") || h.includes("Nenhum carro encontrado");
const naoEncontrado = (h) => h.includes("não encontrad") || h.includes("404");
const deuErro = (h) => h.includes("Algo deu errado");

(async () => {
  for (let i = 0; i < 60; i++) {
    try { await fetch(SITE + "/robots.txt"); break; } catch { await esperar(1000); }
  }

  console.log("\n== 1) Supabase OK ==");
  let h = await get("/");
  checar("home mostra os carros", temCarros(h.html), `status ${h.status}, cache ${h.cache}`);
  checar("home traz o subtítulo do banco", h.html.includes("MOCK subtitulo vindo do banco"));
  h = await get("/carros");
  checar("/carros mostra os carros", temCarros(h.html), `cache ${h.cache}`);
  h = await get("/carros/fusca-mock");
  checar("anúncio 200 com título (1ª visita)", h.status === 200 && h.html.includes("Fusca Mock Turbo"), `cache ${h.cache}`);
  h = await get("/carros/fusca-mock");
  checar("anúncio em cache na 2ª visita (ISR)", h.cache === "HIT" && h.html.includes("Fusca Mock Turbo"), `cache ${h.cache}`);
  h = await get("/carros/nao-existe");
  checar("carro inexistente mostra 'não encontrado'", naoEncontrado(h.html) && !deuErro(h.html), `status ${h.status}, cache ${h.cache}`);
  h = await get("/carros/nao-existe");
  console.log(`     (2ª visita ao inexistente: status ${h.status}, cache ${h.cache})`);
  let st = await (await fetch(SITE + "/api/status")).json();
  checar("/api/status ok", st.ok === true, JSON.stringify(st));

  console.log("\n== 2) Supabase passa a responder 402 (o bloqueio de agora) ==");
  await fetch(MOCK + "/__mode/402");
  console.log("     esperando 62s pro revalidate=60 vencer...");
  await esperar(62000);
  await get("/"); // dispara a regeneração em segundo plano (que vai falhar)
  await get("/carros");
  await get("/carros/fusca-mock");
  await esperar(4000);
  h = await get("/");
  checar("home CONTINUA com os carros (não esvaziou)", temCarros(h.html) && !vazio(h.html), `status ${h.status}, cache ${h.cache}`);
  checar("home mantém o subtítulo do banco (não caiu no padrão)", h.html.includes("MOCK subtitulo vindo do banco"));
  h = await get("/carros");
  checar("/carros CONTINUA com os carros", temCarros(h.html) && !vazio(h.html), `status ${h.status}, cache ${h.cache}`);
  h = await get("/carros/fusca-mock");
  checar("anúncio já visitado CONTINUA no ar", h.status === 200 && h.html.includes("Fusca Mock Turbo") && !deuErro(h.html), `status ${h.status}, cache ${h.cache}`);
  h = await get("/carros/kombi-mock");
  checar("anúncio nunca visitado: erro honesto, não 'não encontrado'", deuErro(h.html) && !naoEncontrado(h.html), `status ${h.status}`);
  st = await (await fetch(SITE + "/api/status")).json();
  checar("/api/status acusa fora do ar", st.ok === false && st.status === 402, JSON.stringify(st));

  console.log("\n== 3) Supabase volta (Fusca editado + carro novo) ==");
  await fetch(MOCK + "/__mode/ok2");
  console.log("     esperando 62s...");
  await esperar(62000);
  await get("/");
  await get("/carros/fusca-mock");
  await esperar(4000);
  h = await get("/");
  checar("home se atualizou sozinha (carro novo aparece)", h.html.includes("Opala Mock Recem-Chegado"), `cache ${h.cache}`);
  h = await get("/carros/fusca-mock");
  checar("anúncio se atualizou sozinho (título editado)", h.html.includes("Fusca Mock Turbo (atualizado)"), `cache ${h.cache}`);
  h = await get("/carros/opala-mock");
  checar("anúncio do carro novo abre", h.status === 200 && h.html.includes("Opala Mock Recem-Chegado"), `status ${h.status}`);
  h = await get("/carros/kombi-mock");
  checar("anúncio que deu erro na queda volta ao normal", h.status === 200 && h.html.includes("Kombi Mock Rebaixada") && !deuErro(h.html), `status ${h.status}, cache ${h.cache}`);

  console.log(`\n${falhas === 0 ? "TUDO OK" : falhas + " FALHA(S)"}`);
  process.exit(falhas ? 1 : 0);
})();
