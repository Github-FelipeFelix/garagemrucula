import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client com SERVICE ROLE — bypassa RLS. Apenas no servidor, para escrita sensivel
// (CRUD de carros, leitura de leads/historico de vendas). Nunca importar no cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
