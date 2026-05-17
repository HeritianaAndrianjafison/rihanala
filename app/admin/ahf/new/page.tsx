import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import HotelAHFForm from "@/components/admin/HotelAHFForm";

export default function AdminAHFNewPage() {
  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/ahf"
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Nouvel hôtel AHF</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Enregistrer un nouveau membre de l'Association des Hôtels de Foulpointe
          </p>
        </div>
      </div>

      <HotelAHFForm />
    </div>
  );
}
