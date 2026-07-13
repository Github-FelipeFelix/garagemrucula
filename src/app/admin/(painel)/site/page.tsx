import { getSiteSettings } from "@/lib/settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

// Sempre lê o valor salvo mais recente (não cacheia a tela de edição).
export const dynamic = "force-dynamic";

export default async function AdminSitePage() {
  const settings = await getSiteSettings();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Textos e fotos do site</h1>
      <p className="mt-1 text-sm text-muted">
        Edite o subtítulo da página inicial, a página &quot;Sobre&quot; e as fotos do seu espaço. Ao
        salvar, as mudanças aparecem no site na hora.
      </p>
      <SiteSettingsForm initial={settings} />
    </div>
  );
}
