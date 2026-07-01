"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, ExternalLink, KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Carros" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/vendas", label: "Vendas" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const navLink = (href: string, label: string, extra = "") =>
    `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
      isActive(href) ? "bg-bg text-senna" : "text-muted hover:text-ink"
    } ${extra}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between py-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={90} height={66} className="h-8 w-auto" />
            <span className="font-display font-bold">Painel</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Link href="/" target="_blank" className="hidden items-center gap-1 hover:text-ink sm:flex">
              <ExternalLink size={14} /> ver site
            </Link>
            <Link href="/admin/senha" className="hidden items-center gap-1 hover:text-ink sm:flex">
              <KeyRound size={14} /> senha
            </Link>
            <button type="button" onClick={logout} className="flex items-center gap-1.5 hover:text-ink">
              <LogOut size={16} /> sair
            </button>
          </div>
        </div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto pb-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={navLink(n.href, n.label)}>
              {n.label}
            </Link>
          ))}
          <Link href="/admin/senha" className={navLink("/admin/senha", "senha", "sm:hidden")}>
            senha
          </Link>
          <Link href="/" target="_blank" className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink sm:hidden">
            ver site
          </Link>
        </nav>
      </div>
    </header>
  );
}
