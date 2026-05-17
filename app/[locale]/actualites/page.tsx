import Image from "next/image";
import Link from "next/link";
import { Calendar, Tag } from "lucide-react";
import { prisma } from "@/lib/db";
import { generatePageMetadata } from "@/lib/seo";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface ActualitesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ActualitesPageProps) {
  const { locale } = await params;
  if (locale === "en") {
    return generatePageMetadata({
      title: "News & Blog — Rihanala Village",
      description:
        "Discover the latest news from Rihanala Village: events, offers and tips for your stay in Foulpointe, East Coast Madagascar.",
      path: "/actualites",
      locale: locale as Locale,
    });
  }
  return generatePageMetadata({
    title: "Actualités & Blog — Rihanala Village",
    description:
      "Découvrez les dernières actualités de Rihanala Village : événements, offres et conseils pour votre séjour à Foulpointe, côte Est Madagascar.",
    path: "/actualites",
    locale: locale as Locale,
  });
}

async function getActualites() {
  try {
    return await prisma.actualite.findMany({
      where: { estPublie: true },
      orderBy: [{ estEnVedette: "desc" }, { publieLe: "desc" }],
      include: { auteur: { select: { nom: true } } },
    });
  } catch {
    return [];
  }
}

export default async function ActualitesPage({ params }: ActualitesPageProps) {
  const { locale } = await params;
  const actualites = await getActualites();

  const isEn = locale === "en";

  return (
    <>
      <div className="min-h-screen bg-surface">
        {/* Header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-6 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-4">
              {isEn ? "Blog" : "Actualités"}
            </p>
            <h1 className="font-accent text-4xl md:text-5xl text-primary mb-4">
              {isEn ? "News & Stories" : "Nos actualités"}
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto">
              {isEn
                ? "Events, tips and stories from Rihanala Village and Foulpointe."
                : "Événements, conseils et récits de Rihanala Village et de Foulpointe."}
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-16">
          {actualites.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-slate-400 text-sm">
                {isEn ? "No article published yet." : "Aucun article publié pour l'instant."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {actualites.map((a) => {
                const titre = isEn ? a.titreEn : a.titre;
                const resume = isEn ? a.resumeEn : a.resume;
                return (
                  <article
                    key={a.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <Link href={`/${locale}/actualites/${a.slug}`}>
                      <div className="relative h-52 bg-slate-100">
                        {a.imageUrl ? (
                          <Image
                            src={a.imageUrl}
                            alt={a.imageAlt ?? titre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        {a.estEnVedette && (
                          <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full">
                            {isEn ? "Featured" : "À la une"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="p-6">
                      {a.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {a.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary/60 bg-primary/6 px-2 py-0.5 rounded-full"
                            >
                              <Tag className="w-2.5 h-2.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <Link href={`/${locale}/actualites/${a.slug}`}>
                        <h2 className="font-accent text-xl text-primary mb-2 line-clamp-2 hover:underline">
                          {titre}
                        </h2>
                      </Link>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4">{resume}</p>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(a.publieLe).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                        <span>{a.auteur.nom}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <FloatingWhatsApp />
    </>
  );
}
