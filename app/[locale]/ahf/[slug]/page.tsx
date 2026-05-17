import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { prisma } from "@/lib/db";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/types";

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

async function getHotel(slug: string) {
  try {
    return await prisma.hotelAHF.findUnique({ where: { slug, estActif: true } });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const hotel = await getHotel(slug);
  if (!hotel) return {};
  return generatePageMetadata({
    title: `${hotel.nom} — AHF Foulpointe`,
    description: hotel.description.slice(0, 160),
    path: `/ahf/${slug}`,
    locale: locale as Locale,
    image: hotel.photoCouverture ?? undefined,
  });
}

export default async function AHFDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  const isEn = locale === "en";
  const hotel = await getHotel(slug);
  if (!hotel) notFound();

  const allPhotos = [
    ...(hotel.photoCouverture ? [hotel.photoCouverture] : []),
    ...hotel.photos,
  ];

  const hasGps = hotel.latitude != null && hotel.longitude != null;

  return (
    <main className="min-h-screen bg-surface">
      {/* Breadcrumb + retour */}
      <div className="pt-24 pb-4 px-5 bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-slate-400">
          <Link href={`/${locale}/ahf`} className="flex items-center gap-1 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {isEn ? "AHF Hotels" : "Hôtels AHF"}
          </Link>
          <span>/</span>
          <span className="text-slate-600">{hotel.nom}</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Colonne gauche : galerie + description ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Galerie */}
            {allPhotos.length > 0 && (
              <div className="space-y-3">
                {/* Photo principale */}
                <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-100">
                  <Image
                    src={allPhotos[0]}
                    alt={hotel.nom}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                </div>

                {/* Photos secondaires */}
                {allPhotos.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {allPhotos.slice(1, 4).map((url, i) => (
                      <div
                        key={i}
                        className="relative h-28 rounded-xl overflow-hidden bg-slate-100"
                      >
                        <Image
                          src={url}
                          alt={`${hotel.nom} — photo ${i + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 33vw, 22vw"
                        />
                        {i === 2 && allPhotos.length > 4 && (
                          <div className="absolute inset-0 bg-dark/50 flex items-center justify-center">
                            <span className="text-white font-semibold text-lg">
                              +{allPhotos.length - 4}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Nom + description */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-slate-800 mb-2">
                {hotel.nom}
              </h1>
              {hotel.adresse && (
                <p className="flex items-center gap-1.5 text-slate-400 text-sm mb-6">
                  <MapPin className="w-4 h-4 shrink-0" />
                  {hotel.adresse}
                </p>
              )}
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                {hotel.description.split("\n").map((paragraph, i) =>
                  paragraph.trim() ? (
                    <p key={i}>{paragraph}</p>
                  ) : null
                )}
              </div>
            </div>

            {/* Carte GPS */}
            {hasGps && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  {isEn ? "Location" : "Localisation"}
                </h2>
                <a
                  href={`https://maps.google.com/?q=${hotel.latitude},${hotel.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {isEn
                    ? "Open in Google Maps"
                    : "Ouvrir dans Google Maps"}
                  {" "}({hotel.latitude?.toFixed(4)}, {hotel.longitude?.toFixed(4)})
                </a>
              </div>
            )}
          </div>

          {/* ── Colonne droite : contact + liens ── */}
          <div className="space-y-5">

            {/* Carte contact */}
            <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4 sticky top-24">
              <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                {isEn ? "Contact" : "Contact"}
              </h2>

              {hotel.telephone && (
                <a
                  href={`tel:${hotel.telephone}`}
                  className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors text-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  {hotel.telephone}
                </a>
              )}

              {hotel.email && (
                <a
                  href={`mailto:${hotel.email}`}
                  className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors text-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <span className="truncate">{hotel.email}</span>
                </a>
              )}

              {hotel.siteWeb && (
                <a
                  href={hotel.siteWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors text-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <span className="truncate">{hotel.siteWeb.replace(/^https?:\/\//, "")}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </a>
              )}

              {hotel.facebook && (
                <a
                  href={hotel.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors text-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <FacebookIcon className="w-4 h-4 text-primary" />
                  </div>
                  Page Facebook
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </a>
              )}

              {hotel.instagram && (
                <a
                  href={hotel.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-slate-700 hover:text-primary transition-colors text-sm group"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <InstagramIcon className="w-4 h-4 text-primary" />
                  </div>
                  Instagram
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </a>
              )}

              {!hotel.telephone && !hotel.email && !hotel.siteWeb && !hotel.facebook && (
                <p className="text-slate-400 text-sm">
                  {isEn ? "No contact information available." : "Aucun contact renseigné."}
                </p>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Link
                  href={`/${locale}/ahf`}
                  className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-primary transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {isEn ? "Back to all hotels" : "Retour à tous les hôtels"}
                </Link>
              </div>
            </div>

            {/* Badge AHF */}
            <div className="bg-gold/10 border border-gold/25 rounded-2xl p-4 text-center">
              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wide mb-1">
                Membre AHF
              </p>
              <p className="text-xs text-amber-600/80">
                Association des Hôtels de Foulpointe
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
