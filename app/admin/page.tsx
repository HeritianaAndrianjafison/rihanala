import { prisma } from "@/lib/db";
import { Bed, Newspaper, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

async function getDashboardStats() {
  try {
    const [
      hebergementsActifs,
      hebergementsTotal,
      articlesPublies,
      articlesBrouillons,
      avisEnAttente,
      avisApprouves,
    ] = await Promise.all([
      prisma.hebergement.count({ where: { estActif: true } }),
      prisma.hebergement.count(),
      prisma.actualite.count({ where: { estPublie: true } }),
      prisma.actualite.count({ where: { estPublie: false } }),
      prisma.avis.count({ where: { estApprouve: false } }),
      prisma.avis.count({ where: { estApprouve: true } }),
    ]);
    return { hebergementsActifs, hebergementsTotal, articlesPublies, articlesBrouillons, avisEnAttente, avisApprouves };
  } catch {
    return {
      hebergementsActifs: 0, hebergementsTotal: 0,
      articlesPublies: 0, articlesBrouillons: 0,
      avisEnAttente: 0, avisApprouves: 0,
    };
  }
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  href: string;
  alert?: boolean;
}

function StatCard({ icon, label, value, sub, href, alert }: StatCardProps) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl p-6 flex items-start gap-4 hover:shadow-md transition-shadow duration-200 group"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${alert && value > 0 ? "bg-amber-50" : "bg-primary/6"}`}>
        <span className={alert && value > 0 ? "text-amber-500" : "text-primary"}>{icon}</span>
      </div>
      <div className="min-w-0">
        <div className={`text-3xl font-bold font-display leading-none mb-1 ${alert && value > 0 ? "text-amber-500" : "text-primary"}`}>
          {value}
        </div>
        <div className="text-slate-600 text-sm font-medium">{label}</div>
        {sub && <div className="text-slate-400 text-xs mt-0.5">{sub}</div>}
      </div>
      {alert && value > 0 && (
        <AlertCircle className="w-5 h-5 text-amber-400 ml-auto shrink-0 mt-0.5" aria-hidden="true" />
      )}
    </Link>
  );
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-1">Vue d'ensemble de Rihanala Village</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          icon={<Bed className="w-6 h-6" aria-hidden="true" />}
          label="Hébergements actifs"
          value={stats.hebergementsActifs}
          sub={`${stats.hebergementsTotal} au total`}
          href="/admin/hebergements"
        />
        <StatCard
          icon={<Newspaper className="w-6 h-6" aria-hidden="true" />}
          label="Articles publiés"
          value={stats.articlesPublies}
          sub={`${stats.articlesBrouillons} brouillon${stats.articlesBrouillons !== 1 ? "s" : ""}`}
          href="/admin/actualites"
        />
        <StatCard
          icon={<MessageSquare className="w-6 h-6" aria-hidden="true" />}
          label="Avis à modérer"
          value={stats.avisEnAttente}
          sub={`${stats.avisApprouves} approuvé${stats.avisApprouves !== 1 ? "s" : ""}`}
          href="/admin/avis"
          alert
        />
      </div>

      {/* Quick links */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
          Actions rapides
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/admin/hebergements/new", label: "Ajouter un hébergement", Icon: Bed },
            { href: "/admin/actualites/new",   label: "Rédiger un article",      Icon: Newspaper },
            { href: "/admin/galerie",           label: "Gérer la galerie",        Icon: CheckCircle2 },
            { href: "/admin/avis",              label: "Modérer les avis",        Icon: Clock },
          ].map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center gap-3 text-sm text-slate-600 hover:border-primary/30 hover:text-primary hover:bg-primary/3 transition-all duration-150"
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
