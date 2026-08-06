import { prisma } from "@/lib/db";
import { Mail, Phone, Users, MessageSquare, Check, Clock } from "lucide-react";
import DemandeActions from "@/components/admin/DemandeActions";

async function getDemandes() {
  try {
    return await prisma.demandeContact.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export default async function AdminReservationsPage() {
  const demandes = await getDemandes();
  const nouvelles = demandes.filter((d) => d.statut === "NOUVELLE");
  const traitees  = demandes.filter((d) => d.statut !== "NOUVELLE");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Demandes de contact</h1>
        <p className="text-slate-500 text-sm mt-1">
          {nouvelles.length} nouvelle{nouvelles.length !== 1 ? "s" : ""} · {traitees.length} traitée{traitees.length !== 1 ? "s" : ""}
        </p>
      </div>

      {nouvelles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" aria-hidden="true" />
            Nouvelles demandes ({nouvelles.length})
          </h2>
          <div className="space-y-3">
            {nouvelles.map((d) => (
              <div key={d.id} className="bg-white rounded-xl p-5 shadow-sm border border-amber-100">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-slate-800">{d.prenom} {d.nom}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Nouvelle</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <a href={`mailto:${d.email}`} className="hover:text-primary truncate">{d.email}</a>
                      </span>
                      {d.telephone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <a href={`tel:${d.telephone}`} className="hover:text-primary">{d.telephone}</a>
                        </span>
                      )}
                      {d.nbPersonnes && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 shrink-0" />
                          {d.nbPersonnes} personne{d.nbPersonnes > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {d.typeHebergement && (
                      <span className="inline-block text-xs bg-primary/8 text-primary px-2.5 py-1 rounded-full">
                        {d.typeHebergement}
                      </span>
                    )}
                    {d.message && (
                      <p className="text-sm text-slate-600 flex items-start gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                        {d.message}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      {new Date(d.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <DemandeActions id={d.id} statut={d.statut} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {traitees.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-green-600 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Check className="w-4 h-4" aria-hidden="true" />
            Traitées ({traitees.length})
          </h2>
          <div className="space-y-2">
            {traitees.map((d) => (
              <div key={d.id} className="bg-white rounded-xl p-4 border border-green-50 opacity-75">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-medium text-slate-700">{d.prenom} {d.nom}</span>
                      <a href={`mailto:${d.email}`} className="text-slate-400 hover:text-primary truncate">{d.email}</a>
                      {d.typeHebergement && <span className="text-slate-400">{d.typeHebergement}</span>}
                    </div>
                  </div>
                  <DemandeActions id={d.id} statut={d.statut} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {demandes.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Aucune demande reçue pour le moment.</p>
        </div>
      )}
    </div>
  );
}
