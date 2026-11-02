// Conta quantas variantes (larguras) cada <img> do anúncio oferece no srcset —
// é o que um robô que "baixa todas as imagens" pede, e cada variante nova faz a
// Vercel puxar o original do Supabase. Também testa o que o otimizador aceita.
const SITE = "http://localhost:3100";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let falhas = 0;
const checar = (nome, ok, extra = "") => {
  console.log(`${ok ? "OK  " : "FALHA"} ${nome}${extra ? " — " + extra : ""}`);
  if (!ok) falhas++;
};

(async () => {
  for (let i = 0; i < 60; i++) {
    try { await fetch(SITE + "/robots.txt"); break; } catch { await esperar(1000); }
  }
  const html = await (await fetch(SITE + "/carros/fusca-mock")).text();
  const imgs = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
  const fotos = imgs.filter((t) => t.includes("foto-"));
  let total = 0;
  const porTipo = {};
  for (const t of fotos) {
    const srcset = (t.match(/srcSet="([^"]*)"/i) || t.match(/srcset="([^"]*)"/i) || [])[1] || "";
    const n = srcset ? srcset.split(", ").length : 1;
    const larguras = [...srcset.matchAll(/w=(\d+)/g)].map((m) => m[1]).join(",");
    const tipo = /width="80"/.test(t) ? "miniatura" : "galeria";
    porTipo[tipo] = porTipo[tipo] || [];
    porTipo[tipo].push(n);
    total += n;
    console.log(`     ${tipo.padEnd(9)} ${n} opções (w=${larguras})`);
  }
  checar("miniaturas com no máx. 2 opções", (porTipo.miniatura || []).every((n) => n <= 2) && (porTipo.miniatura || []).length > 0);
  checar("galeria com no máx. 5 opções", (porTipo.galeria || []).every((n) => n <= 5));
  console.log(`     total de variantes que um robô pediria nesta página: ${total}`);

  const otim = async (q) => (await fetch(`${SITE}/_next/image?${q}`)).status;
  const nossa = encodeURIComponent("http://localhost:54321/storage/v1/object/public/car-media/cars/foto-1.jpg");
  const alheia = encodeURIComponent("https://outro-projeto.supabase.co/storage/v1/object/public/qualquer/x.jpg");
  const outroBucket = encodeURIComponent("http://localhost:54321/storage/v1/object/public/outro-bucket/x.jpg");
  checar("largura removida (3840) é recusada", (await otim(`url=${nossa}&w=3840&q=75`)) === 400);
  checar("qualidade removida (60) é recusada", (await otim(`url=${nossa}&w=640&q=60`)) === 400);
  checar("imagem de outro projeto Supabase é recusada", (await otim(`url=${alheia}&w=640&q=75`)) === 400);
  checar("outro bucket do nosso Supabase é recusado", (await otim(`url=${outroBucket}&w=640&q=75`)) === 400);
  console.log(`\n${falhas === 0 ? "TUDO OK" : falhas + " FALHA(S)"}`);
  process.exit(falhas ? 1 : 0);
})();
