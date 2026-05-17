import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowLeft, Tag, User } from "lucide-react";
import { prisma } from "@/lib/db";
import { generatePageMetadata } from "@/lib/seo";
import { JsonLd, getArticleJsonLd } from "@/components/seo/JsonLd";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface ArticleDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getActualite(slug: string) {
  try {
    return await prisma.actualite.findUnique({
      where: { slug, estPublie: true },
      include: { auteur: { select: { nom: true } } },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ArticleDetailPageProps) {
  const { locale, slug } = await params;
  const a = await getActualite(slug);
  if (!a) return {};
  const titre = locale === "en" ? a.titreEn : a.titre;
  const resume = locale === "en" ? a.resumeEn : a.resume;
  return generatePageMetadata({
    title: titre,
    description: resume,
    path: `/actualites/${slug}`,
    locale: locale as Locale,
    image: a.imageUrl ?? undefined,
  });
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { locale, slug } = await params;
  const a = await getActualite(slug);
  if (!a) notFound();

  const isEn = locale === "en";
  const titre = isEn ? a.titreEn : a.titre;
  const resume = isEn ? a.resumeEn : a.resume;
  const contenu = isEn ? a.contenuEn : a.contenu;

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          titre: a.titre,
          resume: a.resume,
          slug: a.slug,
          publieLe: a.publieLe,
          updatedAt: a.updatedAt,
          imageUrl: a.imageUrl ?? undefined,
          auteurNom: a.auteur.nom,
        })}
      />

      <div className="min-h-screen bg-surface">
        {/* Image de couverture */}
        {a.imageUrl && (
          <div className="relative w-full h-[400px] md:h-[500px] bg-slate-200">
            <Image
              src={a.imageUrl}
              alt={a.imageAlt ?? titre}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-6 py-12">
          {/* Retour */}
          <Link
            href={`/${locale}/actualites`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            {isEn ? "All articles" : "Tous les articles"}
          </Link>

          {/* Tags */}
          {a.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {a.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary/60 bg-primary/6 px-3 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Titre */}
          <h1 className="font-accent text-4xl md:text-5xl text-primary mb-4 leading-tight">
            {titre}
          </h1>

          {/* Résumé */}
          <p className="text-lg text-slate-500 mb-6 leading-relaxed">{resume}</p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 pb-8 border-b border-slate-200 mb-10">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {a.auteur.nom}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(a.publieLe).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Contenu HTML (Tiptap) */}
          <div
            className="prose prose-slate prose-lg max-w-none prose-headings:font-accent prose-headings:text-primary prose-a:text-primary prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: contenu }}
          />

          {/* CTA bas d'article */}
          <div className="mt-16 p-8 bg-primary rounded-2xl text-center text-white">
            <p className="font-accent text-2xl mb-2">
              {isEn ? "Planning a stay?" : "Vous planifiez un séjour ?"}
            </p>
            <p className="text-white/80 text-sm mb-6">
              {isEn
                ? "Rihanala Village welcomes families, groups and retreats in Foulpointe."
                : "Rihanala Village accueille familles, groupes et retraites à Foulpointe."}
            </p>
            <Link
              href={`/${locale}/contact`}
              className="inline-block bg-white text-primary font-semibold px-8 py-3 rounded-xl hover:bg-surface transition-colors text-sm"
            >
              {isEn ? "Contact us" : "Nous contacter"}
            </Link>
          </div>
        </div>
      </div>

      <FloatingWhatsApp />
    </>
  );
}
