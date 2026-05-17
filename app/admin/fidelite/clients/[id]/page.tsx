import { prisma } from "@/lib/db";
import { getConfig } from "@/lib/fidelite";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, Trophy, Wallet, TrendingUp, Clock } from "lucide-react";

function formatCode(code: string) {
  return code.toUpperCase().match(/.{1,5}/g)?.join(" ") ?? code.toUpperCase();
}

function ar(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

function progressPct(pts: number, seuil: number) {
  return Math.min(Math.round((pts / seuil) * 100), 100);
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

const CATEGORIE_LABEL: Record<string, string> = {
  HEBERGEMENT: "Hébergement",
  RESTAURANT:  "Restaurant",
  ACTIVITE:    "Activité",
  AUTRE:       "Autre",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientProfilePage({ params }: PageProps) {
  const { id } = await params;

  type ClientWithRelations = Awaited<ReturnType<typeof prisma.clientFidelite.findUnique<{
    where: { id: string };
    include: {
      transactions: { orderBy: { createdAt: "desc" }; take: number };
      conversions:  { orderBy: { createdAt: "desc" }; take: number };
      utilisations: { orderBy: { createdAt: "desc" }; take: number };
      cartes:       { where: { estActif: boolean } };
    };
  }>>>;

  let client: ClientWithRelations | null = null;
  let config: Awaited<ReturnType<typeof getConfig>> | null = null;

  try {
    [client, config] = await Promise.all([
      prisma.clientFidelite.findUnique({
        where: { id },
        include: {
          transactions: { orderBy: { createdAt: "desc" }, take: 30 },
          conversions:  { orderBy: { createdAt: "desc" }, take: 20 },
          utilisations: { orderBy: { createdAt: "desc" }, take: 20 },
          cartes:       { where: { estActif: true } },
        },
      }),
      getConfig(),
    ]);
  } catch {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <p className="font-semibold text-amber-800 mb-1">Tables fidélité non créées</p>
        <p className="text-sm text-amber-700">Lancez <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">npx prisma db push</code></p>
      </div>
    );
  }

  if (!client) notFound();

  const carte  = client.cartes[0] ?? null;
  const qrSvg  = carte
    ? await QRCode.toString(carte.codeQR, {
        type: "svg", width: 180, margin: 1,
        color: { dark: "#1B4D3E", light: "#FFFFFF" },
      })
    : null;

  const pct = progressPct(client.pointsActuels, config.seuilConversion);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <Link href="/admin/fidelite/clients"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Membres fidélité
      </Link>

      {/* Header client */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-primary font-bold text-xl">
              {client.prenom.charAt(0)}{client.nom.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800">
              {client.prenom} {client.nom}
            </h1>
            <p className="text-slate-500 text-sm">{client.telephone}</p>
            {client.email && <p className="text-slate-400 text-xs">{client.email}</p>}
          </div>
          <div className="text-right text-xs text-slate-400">
            <p>Membre depuis</p>
            <p className="font-medium text-slate-600">{formatDate(client.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Carte QR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 flex items-center gap-5">
        {carte && qrSvg ? (
          <>
            <div
              className="w-20 h-20 rounded-xl border border-slate-100 shrink-0 overflow-hidden"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">N° de carte</p>
              <p className="font-mono text-sm font-bold text-slate-700 tracking-wider leading-relaxed">
                {formatCode(carte.codeQR)}
              </p>
              <p className="text-xs text-slate-400 mt-1">Scanner ou saisir ce numéro en fallback</p>
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-400 italic">Aucune carte QR associée à ce membre</p>
        )}
      </div>

      {/* Soldes */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-primary" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Points actuels</span>
          </div>
          <div className="text-3xl font-bold text-primary font-display leading-none mb-2">
            {client.pointsActuels}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1">
            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-slate-400">{pct}% vers le prochain palier ({config.seuilConversion} pts)</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-amber-500" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Cagnotte</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 font-display leading-none mb-2">
            {ar(client.cagnotte)}
          </div>
          <p className={`text-xs ${client.cagnotte >= config.seuilMinUtilisation ? "text-emerald-600" : "text-slate-400"}`}>
            {client.cagnotte >= config.seuilMinUtilisation
              ? "✓ Utilisable maintenant"
              : `Seuil : ${ar(config.seuilMinUtilisation)}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Total cumulé</span>
          </div>
          <div className="text-3xl font-bold text-slate-700 font-display leading-none mb-1">
            {client.pointsCumules}
          </div>
          <p className="text-xs text-slate-400">points depuis le début</p>
          <p className="text-xs text-slate-400 mt-1">{client.transactions.length} visites</p>
        </div>
      </div>

      {/* Historique transactions */}
      {client.transactions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 mb-5">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <h2 className="font-semibold text-slate-700 text-sm">Historique des dépenses</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {client.transactions.map(tx => (
              <div key={tx.id} className="flex items-center px-6 py-3.5">
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-700">{ar(tx.montantDepense)}</span>
                  {tx.categorie && (
                    <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {CATEGORIE_LABEL[tx.categorie] ?? tx.categorie}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary">+{tx.pointsGagnes} pts</div>
                  <div className="text-xs text-slate-400">{formatDate(tx.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique conversions */}
      {client.conversions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 mb-5">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">Paliers atteints</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {client.conversions.map(c => (
              <div key={c.id} className="flex items-center px-6 py-3.5">
                <div className="flex-1 text-sm text-slate-600">
                  🏆 {c.pointsUtilises} pts convertis
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-600">+{ar(c.montantCredite)}</div>
                  <div className="text-xs text-slate-400">{formatDate(c.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique utilisations */}
      {client.utilisations.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700 text-sm">Utilisations de la cagnotte</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {client.utilisations.map(u => (
              <div key={u.id} className="flex items-center px-6 py-3.5">
                <div className="flex-1 text-sm text-slate-600">
                  {u.description ?? "Paiement par cagnotte"}
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-500">−{ar(u.montantUtilise)}</div>
                  <div className="text-xs text-slate-400">{formatDate(u.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
