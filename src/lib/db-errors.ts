// Erros do PostgREST/Postgres que significam "a migração ainda não rodou"
// (tabela ou coluna inexistente). SÓ estes podem degradar pra vazio (regra 3).
//
// Qualquer outra falha — rede, 5xx, 402 de cota do Supabase — tem que ESTOURAR:
// no ISR, uma regeneração que falha mantém no ar a última versão boa da página.
// Devolver [] nesses casos publica uma vitrine vazia por cima da boa — foi o que
// aconteceu em out/2026, quando o Supabase passou a responder 402 (cota de
// egress do plano grátis estourada) e o site inteiro ficou "sem carros".
const MISSING_SCHEMA = new Set(["42P01", "42703", "PGRST204", "PGRST205"]);

export function isMissingSchema(error: { code?: string } | null | undefined): boolean {
  return !!error?.code && MISSING_SCHEMA.has(error.code);
}
