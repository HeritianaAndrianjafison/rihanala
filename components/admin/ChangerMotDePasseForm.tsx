"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type FieldState = { value: string; show: boolean };

const INITIAL: FieldState = { value: "", show: false };

export default function ChangerMotDePasseForm() {
  const [ancien,     setAncien]     = useState<FieldState>(INITIAL);
  const [nouveau,    setNouveau]    = useState<FieldState>(INITIAL);
  const [confirm,    setConfirm]    = useState<FieldState>(INITIAL);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  function toggle(setter: React.Dispatch<React.SetStateAction<FieldState>>) {
    setter((prev) => ({ ...prev, show: !prev.show }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (nouveau.value !== confirm.value) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }
    if (nouveau.value.length < 8) {
      setError("Le nouveau mot de passe doit faire au moins 8 caractères.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/changer-mdp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ancienMdp: ancien.value, nouveauMdp: nouveau.value }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Erreur inattendue.");
      return;
    }

    setSuccess(true);
    setAncien(INITIAL);
    setNouveau(INITIAL);
    setConfirm(INITIAL);
    setTimeout(() => setSuccess(false), 4000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      {(
        [
          { label: "Mot de passe actuel", state: ancien, setter: setAncien },
          { label: "Nouveau mot de passe",           state: nouveau, setter: setNouveau },
          { label: "Confirmer le nouveau mot de passe", state: confirm, setter: setConfirm },
        ] as const
      ).map(({ label, state, setter }) => (
        <div key={label}>
          <label className="label-admin">{label}</label>
          <div className="relative">
            <input
              type={state.show ? "text" : "password"}
              value={state.value}
              onChange={(e) => setter((prev) => ({ ...prev, value: e.target.value }))}
              required
              autoComplete="off"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              style={{ minHeight: "48px" }}
            />
            <button
              type="button"
              onClick={() => toggle(setter)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              aria-label={state.show ? "Masquer" : "Afficher"}
            >
              {state.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ))}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-h transition-colors disabled:opacity-60 cursor-pointer text-sm"
          style={{ minHeight: "44px" }}
        >
          <Lock className="w-4 h-4" aria-hidden="true" />
          {loading ? "Modification..." : "Modifier le mot de passe"}
        </button>
        {success && (
          <span className="text-green-600 text-sm font-medium">
            ✓ Mot de passe modifié
          </span>
        )}
      </div>
    </form>
  );
}
