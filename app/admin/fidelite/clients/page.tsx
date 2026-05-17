import { prisma } from "@/lib/db";
import Link from "next/link";
import { Trophy, UserPlus, Search, ChevronRight } from "lucide-react";

function ar(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

async function getClients(q: string) {
  return prisma.clientFidelite.findMany({
    where: q
      ? {
          OR: [
            { nom:       { contains: q, mode: "insensitive" } },
            { prenom:    { contains: q, mode: "insensitive" } },
            { telephone: { contains: q } },
          ],
        }
      : undefined,
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { transactions: true } } },
  });
}

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ClientsFidelitePage({ searchParams }: PageProps) {
  const { q = "" } = await searchParams;

  let clients: Awaited<ReturnType<typeof getClients>> = [];
  let dbError: string | null = null;
  try {
    clients = await getClients(q);
  } catch (e: unknown) {
    dbError = e instanceof Error ? e.message : "Erreur base de données";
  }

  if (dbError) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
        <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-3" aria-hidden="true" />
        <h2 className="font-semibold text-amber-800 mb-1">Tables fidélité non créées</h2>
        <p className="text-sm text-amber-700">Lancez <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">npx prisma db push</code> pour créer les tables.</p>
        <p className="text-xs text-amber-500 mt-2 font-mono break-all">{dbError}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" aria-hidden="true" />
            Membres fidélité
          </h1>
          <p className="text-slate-500 text-sm mt-1">{clients.length} membre{clients.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/admin/fidelite"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          Scanner une carte
        </Link>
      </div>

      {/* Recherche */}
      <form method="GET" className="mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher par nom, prénom ou téléphone…"
            className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/40 bg-white"
          />
        </div>
      </form>

      {/* Liste */}
      {clients.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" aria-hidden="true" />
          <p>Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {clients.map((c, i) => (
            <Link
              key={c.id}
              href={`/admin/fidelite/clients/${c.id}`}
              className={`flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group ${i !== 0 ? "border-t border-slate-100" : ""}`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">
                  {c.prenom.charAt(0)}{c.nom.charAt(0)}
                </span>
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-sm">
                  {c.prenom} {c.nom}
                </div>
                <div className="text-xs text-slate-400">{c.telephone}</div>
              </div>

              {/* Points */}
              <div className="text-center hidden sm:block">
                <div className="text-lg font-bold text-primary font-display leading-none">{c.pointsActuels}</div>
                <div className="text-xs text-slate-400">points</div>
              </div>

              {/* Cagnotte */}
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-amber-600">{ar(c.cagnotte)}</div>
                <div className="text-xs text-slate-400">cagnotte</div>
              </div>

              {/* Transactions */}
              <div className="text-right hidden lg:block">
                <div className="text-sm text-slate-600">{c._count.transactions}</div>
                <div className="text-xs text-slate-400">visites</div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
