import { prisma } from "@/lib/db";
import Link from "next/link";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  CHAMBRE_DOUBLE:   "Chambre Double",
  CHAMBRE_FAMILIALE:"Chambre Familiale",
  SUITE:            "Suite",
  DORTOIR:          "Dortoir",
};

async function getHebergements() {
  try {
    return await prisma.hebergement.findMany({
      orderBy: [{ estEnVedette: "desc" }, { ordre: "asc" }],
      include: { photos: { where: { estCouverture: true }, take: 1 }, _count: { select: { equipements: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminHebergementsPage() {
  const hebergements = await getHebergements();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hébergements</h1>
          <p className="text-slate-500 text-sm mt-1">{hebergements.length} hébergement{hebergements.length !== 1 ? "s" : ""} au total</p>
        </div>
        <Link
          href="/admin/hebergements/new"
          className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-primary-h transition-colors cursor-pointer"
          style={{ minHeight: "44px" }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Ajouter
        </Link>
      </div>

      {hebergements.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">Aucun hébergement créé.</p>
          <Link
            href="/admin/hebergements/new"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-h transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Créer le premier hébergement
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacité</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix de base</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hebergements.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{h.nom}</div>
                    {h.estEnVedette && (
                      <span className="inline-block text-[10px] bg-gold/15 text-gold font-semibold px-2 py-0.5 rounded-full mt-1">
                        En vedette
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {TYPE_LABELS[h.type]}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{h.capacite}p</td>
                  <td className="px-6 py-4 text-slate-600">
                    {h.prixBase > 0 ? `${h.prixBase.toLocaleString("fr-FR")} Ar` : "Sur demande"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      h.estActif ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {h.estActif ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {h.estActif ? "Actif" : "Inactif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/hebergements/${h.id}/edit`}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Modifier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
