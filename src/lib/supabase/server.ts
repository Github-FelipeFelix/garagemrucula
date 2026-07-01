import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client de servidor (anon key + cookies). Respeita RLS. Em Next 16 cookies() e async.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Chamado de um Server Component (sem escrita de cookie) — o middleware refresca a sessao.
          }
        },
      },
    },
  );
}
