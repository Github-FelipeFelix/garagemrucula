import { AdminHeader } from "@/components/admin/AdminHeader";

// O proxy.ts ja garante que so admin logado chega aqui.
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdminHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
