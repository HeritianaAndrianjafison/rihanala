"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";

interface Parametre {
  cle: string;
  valeur: string;
  type: string;
}

interface ParametresFormProps {
  parametres: Parametre[];
}

const LABELS: Record<string, string> = {
  telephone:        "Téléphone",
  email_contact:    "Email de contact",
  facebook_url:     "URL Facebook",
  whatsapp_message: "Message WhatsApp par défaut",
};

export default function ParametresForm({ parametres }: ParametresFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(parametres.map((p) => [p.cle, p.valeur]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);

    await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSaving(false);
    setSaved(true);
    router.refresh();

    setTimeout(() => setSaved(false), 3000);
  }

  if (parametres.length === 0) {
    return (
      <p className="text-slate-400 text-sm text-center py-8">
        Aucun paramètre configuré. Lancez le seed pour initialiser les valeurs par défaut.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {parametres.map((p) => (
        <div key={p.cle}>
          <label className="label-admin">{LABELS[p.cle] ?? p.cle}</label>
          <input
            type={p.cle.includes("email") ? "email" : p.cle.includes("url") ? "url" : "text"}
            value={values[p.cle] ?? ""}
            onChange={(e) => setValues((prev) => ({ ...prev, [p.cle]: e.target.value }))}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            style={{ minHeight: "48px" }}
          />
        </div>
      ))}

      <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-h transition-colors disabled:opacity-60 cursor-pointer text-sm"
          style={{ minHeight: "44px" }}
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Enregistré</span>}
      </div>
    </div>
  );
}
