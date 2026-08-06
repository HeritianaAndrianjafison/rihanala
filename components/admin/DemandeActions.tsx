"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Trash2 } from "lucide-react";

interface DemandeActionsProps {
  id: string;
  statut: string;
}

export default function DemandeActions({ id, statut }: DemandeActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markTraitee() {
    setLoading(true);
    await fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: statut === "NOUVELLE" ? "TRAITEE" : "NOUVELLE" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteDemande() {
    if (!confirm("Supprimer cette demande ?")) return;
    setLoading(true);
    await fetch(`/api/reservations/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={markTraitee}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
          statut === "NOUVELLE"
            ? "bg-green-50 text-green-700 hover:bg-green-100"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
        }`}
        style={{ minHeight: "36px" }}
      >
        <Check className="w-3.5 h-3.5" />
        {statut === "NOUVELLE" ? "Marquer traitée" : "Rouvrir"}
      </button>
      <button
        onClick={deleteDemande}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
        style={{ minHeight: "36px" }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Supprimer
      </button>
    </div>
  );
}
