import Link from "next/link";
import { Plus, Pencil, Globe, MapPin, Eye, EyeOff } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { prisma } from "@/lib/db";

async function getHotels() {
  try {
    return await prisma.hotelAHF.findMany({
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function AdminAHFPage() {
  const hotels = await getHotels();
  const actifs = hotels.filter((h) => h.estActif).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            AHF — Association des Hôtels de Foulpointe
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {hotels.length} hôtel{hotels.length !== 1 ? "s" : ""} enregistré
            {hotels.length !== 1 ? "s" : ""} · {actifs} actif{actifs !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/ahf/new"
          className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-h transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter un hôtel
        </Link>
      </div>

      {hotels.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Aucun hôtel membre enregistré.</p>
          <Link
            href="/admin/ahf/new"
            className="inline-flex items-center gap-2 mt-4 text-primary text-sm hover:underline"
          >
            <Plus className="w-4 h-4" /> Ajouter le premier hôtel
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {hotels.map((h) => (
            <div key={h.id} className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-5">
              {/* Couverture */}
              <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {h.photoCouverture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.photoCouverture}
                    alt={h.nom}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs text-center px-1">
                    Pas de photo
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 truncate">{h.nom}</span>
                  {h.estActif ? (
                    <Eye className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate mb-2">
                  {h.description.slice(0, 100)}
                  {h.description.length > 100 ? "…" : ""}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {h.adresse && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {h.adresse}
                    </span>
                  )}
                  {h.siteWeb && (
                    <a
                      href={h.siteWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <Globe className="w-3 h-3" /> Site web
                    </a>
                  )}
                  {h.facebook && (
                    <a
                      href={h.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      <FacebookIcon className="w-3 h-3" /> Facebook
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <Link
                href={`/admin/ahf/${h.id}/edit`}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors shrink-0 border border-slate-200 rounded-xl px-3 py-2 hover:border-primary/30"
              >
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
