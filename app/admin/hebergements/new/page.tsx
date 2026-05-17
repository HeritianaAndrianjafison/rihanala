import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import HebergementForm from "@/components/admin/HebergementForm";

export default function NewHebergementPage() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/hebergements"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Retour aux hébergements
        </Link>
        <h1 className="text-2xl font-bold text-slate-800">Nouvel hébergement</h1>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <HebergementForm />
      </div>
    </div>
  );
}
