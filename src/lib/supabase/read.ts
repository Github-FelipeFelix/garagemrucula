import { createClient } from "@supabase/supabase-js";

// Client de leitura publica (anon, SEM cookies/sessao). Como nao le cookies, as paginas
// publicas podem ser cacheadas/ISR e nao disparam DYNAMIC_SERVER_USAGE. Respeita RLS (role anon).
export function createReadClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
