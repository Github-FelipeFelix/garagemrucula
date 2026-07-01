"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type BIP = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Banner de instalação do PWA. Android/Chrome: botão "Instalar" (beforeinstallprompt).
// iPhone/Safari (não dispara o evento): mostra as instruções de "Adicionar à Tela de Início".
export function InstallApp() {
  const [deferred, setDeferred] = useState<BIP | null>(null);
  const [iOS, setIOS] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
    if (standalone) {
      setHidden(true);
      return;
    }
    if (/iphone|ipad|ipod/.test(nav.userAgent.toLowerCase())) setIOS(true);

    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIP);
    };
    const onInstalled = () => setHidden(true);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (hidden || (!deferred && !iOS)) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
    setHidden(true);
  }

  return (
    <div className="relative mx-auto flex max-w-6xl items-center gap-3 rounded-2xl border border-rucula/30 bg-petroleo/25 py-3 pl-4 pr-9">
      <Download className="hidden shrink-0 text-rucula-bright sm:block" />
      <div className="flex-1">
        <p className="font-semibold">Instale o app da Garagem Rúcula 📲</p>
        {iOS && !deferred ? (
          <p className="text-sm text-muted">
            No iPhone: toque em <Share size={13} className="inline align-text-bottom" /> (Compartilhar)
            e depois em “Adicionar à Tela de Início”.
          </p>
        ) : (
          <p className="text-sm text-muted">Acesso rápido no celular, igual a um aplicativo.</p>
        )}
      </div>
      {deferred && (
        <button onClick={install} className="btn btn-primary shrink-0">
          Instalar
        </button>
      )}
      <button
        onClick={() => setHidden(true)}
        className="absolute right-2 top-2 text-muted hover:text-ink"
        aria-label="Fechar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
