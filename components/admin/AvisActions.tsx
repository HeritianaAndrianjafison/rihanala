"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Trash2 } from "lucide-react";

interface AvisActionsProps {
  id: string;
  estApprouve: boolean;
}

export default function AvisActions({ id, estApprouve }: AvisActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggleApproval() {
    setLoading(true);
    await fetch(`/api/avis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estApprouve: !estApprouve }),
    });
    setLoading(false);
    router.refresh();
  }

  async function deleteAvis() {
    if (!confirm("Supprimer cet avis ?")) return;
    setLoading(true);
    await fetch(`/api/avis/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={toggleApproval}
        disabled={loading}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
          estApprouve
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
            : "bg-green-50 text-green-700 hover:bg-green-100"
        }`}
        style={{ minHeight: "36px" }}
        title={estApprouve ? "Retirer l'approbation" : "Approuver"}
      >
        {estApprouve ? (
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
        )}
        {estApprouve ? "Retirer" : "Approuver"}
      </button>
      <button
        onClick={deleteAvis}
        disabled={loading}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer disabled:opacity-50"
        style={{ minHeight: "36px" }}
        title="Supprimer"
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
        Supprimer
      </button>
    </div>
  );
}
