// ANTES DE COMMITAR DOCS: varre o que vai pro GitHub (repo PÚBLICO) atrás de nomes
// de outros projetos do Felipe, caminho local do OneDrive, usuário do Windows e
// e-mail corporativo. Os nomes NÃO estão aqui (este arquivo é público): ficam em
// .claude/hooks/nomes-sensiveis.json, local e no .gitignore — e o comando não
// precisa citá-los (o hook de isolamento barra comando que cita outro projeto).
//   node scripts/qa/varre-sensivel.cjs varrer   (da raiz do projeto)
// Olha só o que é NOVO: linhas adicionadas no diff + arquivos não versionados.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const NOMES = path.join(process.cwd(), ".claude", "hooks", "nomes-sensiveis.json");
if (!fs.existsSync(NOMES)) {
  console.error("falta a lista local:", NOMES);
  process.exit(2);
}

const nomes = JSON.parse(fs.readFileSync(NOMES, "utf8"));
const padroes = [
  ...nomes.map((n) => ({ rotulo: "outro projeto", re: new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i") })),
  { rotulo: "pasta do OneDrive corporativo", re: new RegExp("OneDrive" + " - ") }, // montado assim pra não se achar
  { rotulo: "caminho com usuário do Windows", re: /[Cc]:[\\/]+Users[\\/]+|\/c\/Users\// },
  { rotulo: "e-mail corporativo", re: /felipe\.felix@/i },
];
const achados = [];
const checar = (arquivo, n, texto) => {
  for (const p of padroes) if (p.re.test(texto)) achados.push(`${arquivo}:${n}  [${p.rotulo}]  ${texto.trim().slice(0, 110)}`);
};

// 1) linhas ADICIONADAS nos arquivos já versionados
const diff = execSync("git diff HEAD --unified=0 --no-color", { encoding: "utf8", maxBuffer: 50e6 });
let arq = "", n = 0;
for (const l of diff.split("\n")) {
  if (l.startsWith("+++ b/")) arq = l.slice(6);
  else if (l.startsWith("@@")) n = Number((l.match(/\+(\d+)/) || [])[1] || 0);
  else if (l.startsWith("+") && !l.startsWith("+++")) { checar(arq, n, l.slice(1)); n++; }
}
// 2) arquivos NOVOS que vão entrar (passados como argumento ou os não versionados de scripts/qa)
const novos = process.argv.slice(3).length ? process.argv.slice(3)
  : execSync("git ls-files --others --exclude-standard", { encoding: "utf8" }).split("\n").filter(Boolean);
for (const f of novos) {
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) continue;
  fs.readFileSync(f, "utf8").split("\n").forEach((t, i) => checar(f + " (novo)", i + 1, t));
}
console.log(achados.length ? achados.join("\n") : "NADA SENSÍVEL no que vai ser publicado.");
console.log(`\n${achados.length} ocorrência(s).`);
