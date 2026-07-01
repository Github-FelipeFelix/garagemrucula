// Lista de e-mails com acesso ao /admin (regra herdada). Usada pelo proxy (edge) e no server.
// NAO importar em Client Components (evita expor no bundle).
export const ADMIN_EMAILS = ["garagemrucula@gmail.com", "felipeherrera.contato@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
}
