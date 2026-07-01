"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TrocarSenhaPage() {
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (senha.length < 6) {
      setMsg({ tipo: "erro", texto: "A senha precisa ter pelo menos 6 caracteres." });
      return;
    }
    if (senha !== confirma) {
      setMsg({ tipo: "erro", texto: "As duas senhas não são iguais." });
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSaving(false);
    if (error) {
      setMsg({ tipo: "erro", texto: "Não deu pra trocar. Tente sair e entrar de novo." });
      return;
    }
    setMsg({ tipo: "ok", texto: "Senha trocada com sucesso! Use a nova da próxima vez que entrar." });
    setSenha("");
    setConfirma("");
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 font-display text-2xl font-bold">Trocar senha</h1>
      <p className="mb-5 text-sm text-muted">Escolha uma senha nova pra entrar no painel.</p>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4">
        <div>
          <label className="label">Nova senha</label>
          <input
            type="password"
            className="input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            placeholder="pelo menos 6 caracteres"
          />
        </div>
        <div>
          <label className="label">Repita a nova senha</label>
          <input
            type="password"
            className="input"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {msg && (
          <p className={`text-sm ${msg.tipo === "ok" ? "text-rucula-bright" : "text-red-400"}`}>
            {msg.texto}
          </p>
        )}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
