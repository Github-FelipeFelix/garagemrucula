import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admins";

// Retorna o usuario logado se ele for admin; senao null. Para uso em Server Components / rotas.
export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
