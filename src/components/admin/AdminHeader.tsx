"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/admin", label: "Carros" },
  { href: "/admin/leads", label: "Leads" },
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

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.png" alt="" width={90} height={66} className="h-8 w-auto" />
            <span className="font-display font-bold">Painel</span>
          </Link>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  isActive(n.href) ? "text-senna" : "text-muted hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-sm text-muted hover:text-ink">
            ver site
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink"
          >
            <LogOut size={16} /> sair
          </button>
        </div>
      </div>
    </header>
  );
}
