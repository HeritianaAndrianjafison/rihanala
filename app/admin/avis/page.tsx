import { prisma } from "@/lib/db";
import { CheckCircle2, XCircle, Star } from "lucide-react";
import AvisActions from "@/components/admin/AvisActions";

async function getAvis() {
  try {
    return await prisma.avis.findMany({
      orderBy: [{ estApprouve: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < note ? "text-gold fill-gold" : "text-slate-200"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default async function AdminAvisPage() {
  const avis = await getAvis();
  const enAttente  = avis.filter((a) => !a.estApprouve);
  const approuves  = avis.filter((a) => a.estApprouve);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Avis clients</h1>
          <p className="text-slate-500 text-sm mt-1">
            {enAttente.length} en attente · {approuves.length} approuvé{approuves.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {enAttente.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <XCircle className="w-4 h-4" aria-hidden="true" />
            En attente de modération ({enAttente.length})
          </h2>
          <div className="space-y-3">
            {enAttente.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating note={a.note} />
                      <span className="font-semibold text-slate-800 text-sm">{a.auteurNom}</span>
                      <span className="text-slate-400 text-xs">{a.auteurPays}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{a.commentaire}</p>
                    <p className="text-slate-400 text-xs mt-2">
                      {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <AvisActions id={a.id} estApprouve={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approuves.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            Approuvés ({approuves.length})
          </h2>
          <div className="space-y-3">
            {approuves.map((a) => (
              <div key={a.id} className="bg-white rounded-xl p-5 shadow-sm border border-green-50 opacity-80">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <StarRating note={a.note} />
                      <span className="font-semibold text-slate-800 text-sm">{a.auteurNom}</span>
                      <span className="text-slate-400 text-xs">{a.auteurPays}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{a.commentaire}</p>
                  </div>
                  <AvisActions id={a.id} estApprouve />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {avis.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Aucun avis soumis pour le moment.</p>
        </div>
      )}
    </div>
  );
}
