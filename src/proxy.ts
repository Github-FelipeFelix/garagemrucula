import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Proxy (ex-"middleware", renomeado no Next 16). Protege o /admin por e-mail hardcoded.
const ADMIN_EMAILS = ["garagemrucula@gmail.com", "felipeherrera.contato@gmail.com"];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() tambem refresca a sessao (mantem o cookie valido).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isAdminApi = pathname.startsWith("/api/admin");
  const allowed = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  // API do admin: sempre 401 se nao autorizado.
  if (isAdminApi && !allowed) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Paginas /admin (menos o login).
  if (pathname.startsWith("/admin") && !isLogin) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!allowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Ja logado como admin acessando /admin/login -> vai pro painel.
  if (isLogin && allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
