import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Users, Maximize2, ArrowLeft, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { generatePageMetadata } from "@/lib/seo";
import { JsonLd, getRoomJsonLd } from "@/components/seo/JsonLd";
import FloatingWhatsApp from "@/components/nextgen/FloatingWhatsApp";
import type { Locale } from "@/types";

interface HebergementDetailPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getHebergement(slug: string) {
  try {
    return await prisma.hebergement.findUnique({
      where: { slug, estActif: true },
      include: {
        photos: { orderBy: [{ estCouverture: "desc" }, { ordre: "asc" }] },
        equipements: true,
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: HebergementDetailPageProps) {
  const { locale, slug } = await params;
  const h = await getHebergement(slug);
  if (!h) return {};
  const nom = locale === "en" ? h.nomEn : h.nom;
  const desc = locale === "en" ? h.descriptionEn : h.description;
  return generatePageMetadata({
    title: `${nom} — Hébergement à Foulpointe`,
    description: desc.slice(0, 160),
    path: `/hebergements/${slug}`,
    locale: locale as Locale,
    image: h.photos.find((p) => p.estCouverture)?.url,
  });
}

const ICONE_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" />
    </svg>
  ),
  Wifi: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  ),
  Bath: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 10V6a2 2 0 012-2h4a2 2 0 012 2v4M3 10v8a2 2 0 002 2h14a2 2 0 002-2v-8" />
    </svg>
  ),
  Tv: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeWidth={2} d="M8 21h8M12 17v4" />
    </svg>
  ),
  Home: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Sofa: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 9V7a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 0a2 2 0 012 2v5H2v-5a2 2 0 012-2m16 0H4m0 7v2m16-2v2" />
    </svg>
  ),
  UtensilsCrossed: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18M9 3v3m0 0C9 8 7 9 7 12m2-6c0 2 2 3 2 6M15 3c0 2.5-2 4.5-2 7.5M15 3c0 2.5 2 4.5 2 7.5M7 12h10m-5 4v5" />
    </svg>
  ),
  ChefHat: ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 13.87A4 4 0 017.41 6a5.11 5.11 0 019.18 0A4 4 0 0118 13.87V21H6z" />
      <path strokeLinecap="round" strokeWidth={2} d="M6 17h12" />
    </svg>
  ),
};

const DefaultIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

export default async function HebergementDetailPage({ params }: HebergementDetailPageProps) {
  const { locale, slug } = await params;
  const h = await getHebergement(slug);
  if (!h) notFound();

  const t = await getTranslations({ locale, namespace: "hebergements" });
  const nom = locale === "en" ? h.nomEn : h.nom;
  const description = locale === "en" ? h.descriptionEn : h.description;
  const coverPhoto = h.photos.find((p) => p.estCouverture) ?? h.photos[0];
  const galleryPhotos = h.photos.filter((p) => !p.estCouverture).slice(0, 5);

  const whatsappMsg = `Bonjour Rihanala Village, je suis intéressé(e) par votre ${h.nom}. Pourriez-vous me donner plus d'informations ?`;
  const whatsappUrl = `https://wa.me/261346808466?text=${encodeURIComponent(whatsappMsg)}`;

  return (
    <>
      <JsonLd
        data={getRoomJsonLd({
          nom: h.nom,
          description: h.description,
          prixBase: h.prixBase,
          capacite: h.capacite,
          slug: h.slug,
          imageUrl: coverPhoto?.url,
        })}
      />

      <div className="min-h-screen bg-surface">
        {/* Retour */}
        <div className="max-w-6xl mx-auto px-6 pt-8">
          <Link
            href={`/${locale}/hebergements`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "en" ? "All accommodations" : "Tous les hébergements"}
          </Link>
        </div>

        {/* Hero photo */}
        <div className="max-w-6xl mx-auto px-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 rounded-2xl overflow-hidden h-[420px]">
            <div className="lg:col-span-3 relative bg-slate-200">
              {coverPhoto ? (
                <Image
                  src={coverPhoto.url}
                  alt={locale === "en" ? coverPhoto.altEn : coverPhoto.altFr}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  {locale === "en" ? "No photo yet" : "Pas encore de photo"}
                </div>
              )}
            </div>
            <div className="hidden lg:grid lg:col-span-2 grid-cols-2 gap-3">
              {galleryPhotos.slice(0, 4).map((p, i) => (
                <div key={p.id} className="relative bg-slate-200">
                  <Image
                    src={p.url}
                    alt={locale === "en" ? p.altEn : p.altFr}
                    fill
                    className="object-cover"
                    sizes="20vw"
                  />
                  {i === 3 && h.photos.length > 5 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{h.photos.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {Array.from({ length: Math.max(0, 4 - galleryPhotos.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-slate-100" />
              ))}
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-10">
            {/* Titre & infos */}
            <div>
              {h.estEnVedette && (
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full mb-3">
                  {t("badge_prestige")}
                </span>
              )}
              <h1 className="font-accent text-4xl text-primary mb-4">{nom}</h1>
              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {h.capacite} {locale === "en" ? "person(s)" : "personne(s)"}
                </span>
                {h.superficie && (
                  <span className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-primary" />
                    {h.superficie} m²
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-accent text-2xl text-primary mb-4">
                {locale === "en" ? "Description" : "Description"}
              </h2>
              <p className="text-slate-600 leading-relaxed text-base">{description}</p>
            </div>

            {/* Équipements */}
            {h.equipements.length > 0 && (
              <div>
                <h2 className="font-accent text-2xl text-primary mb-6">
                  {locale === "en" ? "Amenities" : "Équipements"}
                </h2>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {h.equipements.map((eq) => {
                    const Icon: React.ComponentType<{ className?: string }> =
                      (eq.icone != null ? ICONE_MAP[eq.icone] : undefined) ?? DefaultIcon;
                    return (
                      <li key={eq.id} className="flex items-center gap-3 text-sm text-slate-700">
                        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        {eq.nom}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar réservation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
              {/* Prix */}
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                  {locale === "en" ? "Price" : "Tarif"}
                </p>
                {h.prixBase > 0 ? (
                  <p className="text-3xl font-bold text-primary">
                    {h.prixBase.toLocaleString("fr-FR")}
                    <span className="text-base font-normal text-slate-400 ml-1">Ar / nuit</span>
                  </p>
                ) : (
                  <p className="text-xl font-semibold text-slate-600">{t("sur_demande")}</p>
                )}
                {h.prixWeekend && h.prixWeekend > 0 && (
                  <p className="text-sm text-slate-500 mt-1">
                    Week-end : {h.prixWeekend.toLocaleString("fr-FR")} Ar
                  </p>
                )}
              </div>

              <div className="border-t border-slate-100" />

              {/* CTA WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white font-semibold py-3.5 rounded-xl hover:bg-[#1ebe5a] transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {locale === "en" ? "Ask on WhatsApp" : "Demander sur WhatsApp"}
              </a>

              {/* CTA Formulaire */}
              <Link
                href={`/${locale}/contact`}
                className="flex items-center justify-center w-full border-2 border-primary text-primary font-semibold py-3.5 rounded-xl hover:bg-primary hover:text-white transition-colors text-sm"
              >
                {locale === "en" ? "Contact form" : "Formulaire de contact"}
              </Link>

              <p className="text-xs text-center text-slate-400">
                {locale === "en"
                  ? "Free · No commitment · Reply within 24h"
                  : "Gratuit · Sans engagement · Réponse sous 24h"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <FloatingWhatsApp />
    </>
  );
}
