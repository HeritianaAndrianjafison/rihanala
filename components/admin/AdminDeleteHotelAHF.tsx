"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface AdminDeleteHotelAHFProps {
  id: string;
  nom: string;
}

export default function AdminDeleteHotelAHF({ id, nom }: AdminDeleteHotelAHFProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await fetch(`/api/ahf/${id}`, { method: "DELETE" });
      router.push("/admin/ahf");
      router.refresh();
    } catch {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
        <span className="text-red-700">Supprimer « {nom} » ?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {deleting ? "..." : "Confirmer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-slate-500 hover:text-slate-700 text-xs"
        >
          Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 border border-red-200 rounded-xl px-3 py-2 hover:border-red-300 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" /> Supprimer
    </button>
  );
}
