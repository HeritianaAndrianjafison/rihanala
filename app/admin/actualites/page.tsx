import Link from "next/link";
import { prisma } from "@/lib/db";
import { Plus, Edit2, Eye, EyeOff } from "lucide-react";

async function getActualites() {
  try {
    return await prisma.actualite.findMany({
      orderBy: [{ estPublie: "asc" }, { publieLe: "desc" }],
      include: { auteur: { select: { nom: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminActualitesPage() {
  const actualites = await getActualites();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Actualités</h1>
          <p className="text-slate-500 text-sm mt-1">{actualites.length} article{actualites.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/actualites/new"
          className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm hover:bg-primary-h transition-colors cursor-pointer"
          style={{ minHeight: "44px" }}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Rédiger
        </Link>
      </div>

      {actualites.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm mb-4">Aucun article rédigé.</p>
          <Link
            href="/admin/actualites/new"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-h transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Rédiger le premier article
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Titre</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Auteur</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actualites.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 truncate max-w-xs">{a.titre}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.auteur.nom}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {new Date(a.publieLe).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      a.estPublie ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {a.estPublie ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {a.estPublie ? "Publié" : "Brouillon"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/actualites/${a.id}/edit`}
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
