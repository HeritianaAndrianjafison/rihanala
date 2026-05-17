import { prisma } from "@/lib/db";
import { Calendar, Users, Mail, Phone } from "lucide-react";

const STATUT_STYLES: Record<string, string> = {
  EN_ATTENTE: "bg-amber-50 text-amber-700",
  CONFIRMEE: "bg-green-50 text-green-700",
  ANNULEE: "bg-red-50 text-red-700",
  TERMINEE: "bg-slate-100 text-slate-500",
};

const STATUT_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  CONFIRMEE: "Confirmée",
  ANNULEE: "Annulée",
  TERMINEE: "Terminée",
};

async function getReservations() {
  try {
    return await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
      include: { hebergement: { select: { nom: true, slug: true } } },
    });
  } catch {
    return [];
  }
}

export default async function AdminReservationsPage() {
  const reservations = await getReservations();
  const enAttente = reservations.filter((r) => r.statut === "EN_ATTENTE");

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Réservations</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reservations.length} demande{reservations.length !== 1 ? "s" : ""}
            {enAttente.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {enAttente.length}
              </span>
            )}
          </p>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-sm">Aucune demande de réservation reçue.</p>
          <p className="text-slate-400 text-xs mt-2">
            Les demandes soumises via le formulaire apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-slate-800">
                      {r.prenom} {r.nom}
                    </span>
                    <span
                      className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        STATUT_STYLES[r.statut] ?? "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {STATUT_LABELS[r.statut] ?? r.statut}
                    </span>
                  </div>
                  <p className="text-sm text-primary font-medium">{r.hebergement.nom}</p>
                </div>
                <p className="text-xs text-slate-400">
                  Reçue le {new Date(r.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {new Date(r.dateArrivee).toLocaleDateString("fr-FR")} →{" "}
                    {new Date(r.dateDepart).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    {r.nbAdultes} adulte{r.nbAdultes > 1 ? "s" : ""}
                    {r.nbEnfants > 0 ? `, ${r.nbEnfants} enfant${r.nbEnfants > 1 ? "s" : ""}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <a
                    href={`mailto:${r.email}`}
                    className="hover:text-primary transition-colors truncate"
                  >
                    {r.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <a href={`tel:${r.telephone}`} className="hover:text-primary transition-colors">
                    {r.telephone}
                  </a>
                </div>
              </div>

              {r.messageSpecial && (
                <div className="mt-4 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 italic">
                  "{r.messageSpecial}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
