import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Globe, Building2 } from "lucide-react";
import { FacebookIcon } from "@/components/ui/SocialIcons";
import { prisma } from "@/lib/db";
import { generatePageMetadata } from "@/lib/seo";
import type { Locale } from "@/types";

interface AHFPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AHFPageProps) {
  const { locale } = await params;
  return generatePageMetadata({
    title: locale === "en"
      ? "AHF — Foulpointe Hotel Association"
      : "AHF — Association des Hôtels de Foulpointe",
    description: locale === "en"
      ? "Discover all AHF member hotels in Foulpointe, Madagascar. Find your ideal accommodation on the east coast."
      : "Découvrez tous les hôtels membres de l'AHF à Foulpointe, Madagascar. Trouvez votre hébergement idéal sur la côte Est.",
    path: "/ahf",
    locale: locale as Locale,
  });
}

async function getHotels() {
  try {
    return await prisma.hotelAHF.findMany({
      where: { estActif: true },
      orderBy: [{ ordre: "asc" }, { nom: "asc" }],
    });
  } catch {
    return [];
  }
}

export default async function AHFPage({ params }: AHFPageProps) {
  const { locale } = await params;
  const isEn = locale === "en";
  const hotels = await getHotels();

  return (
    <main className="min-h-screen bg-surface">
      {/* Hero banner */}
      <section className="bg-dark pt-28 pb-16 px-5">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-gold text-xs tracking-[0.25em] uppercase mb-4">
            {isEn ? "Foulpointe · Madagascar" : "Foulpointe · Madagascar"}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4 leading-tight">
            {isEn ? (
              <>Association of <span className="text-gold">Foulpointe Hotels</span></>
            ) : (
              <>Association des <span className="text-gold">Hôtels de Foulpointe</span></>
            )}
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto">
            {isEn
              ? "The AHF brings together hotels and accommodation establishments in Foulpointe to promote quality tourism on the east coast of Madagascar."
              : "L'AHF regroupe les hôtels et établissements d'hébergement de Foulpointe pour promouvoir un tourisme de qualité sur la côte Est de Madagascar."}
          </p>

          {/* Compteur membres */}
          <div className="inline-flex items-center gap-3 mt-8 bg-white/8 border border-white/12 rounded-2xl px-6 py-4">
            <Building2 className="w-6 h-6 text-gold" />
            <div className="text-left">
              <div className="text-3xl font-display font-bold text-white leading-none">
                {hotels.length}
              </div>
              <div className="text-white/50 text-xs mt-0.5">
                {isEn
                  ? `member hotel${hotels.length !== 1 ? "s" : ""}`
                  : `hôtel${hotels.length !== 1 ? "s" : ""} membre${hotels.length !== 1 ? "s" : ""}`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grille hôtels */}
      <section className="py-16 px-5 bg-sky-100">
        <div className="max-w-6xl mx-auto">
          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">
                {isEn
                  ? "No member hotels registered yet."
                  : "Aucun hôtel membre enregistré pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/${locale}/ahf/${hotel.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    {hotel.photoCouverture ? (
                      <Image
                        src={hotel.photoCouverture}
                        alt={hotel.nom}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-slate-300" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent" />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <h2 className="font-display text-xl text-slate-800 group-hover:text-primary transition-colors leading-tight">
                      {hotel.nom}
                    </h2>

                    <p className="text-slate-500 text-sm leading-relaxed flex-1">
                      {hotel.description.slice(0, 120)}
                      {hotel.description.length > 120 ? "…" : ""}
                    </p>

                    {/* Infos rapides */}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 pt-2 border-t border-slate-100">
                      {hotel.adresse && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{hotel.adresse}</span>
                        </span>
                      )}
                      {hotel.telephone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {hotel.telephone}
                        </span>
                      )}
                    </div>

                    {/* Liens rapides */}
                    <div className="flex gap-2 flex-wrap">
                      {hotel.siteWeb && (
                        <span className="flex items-center gap-1 text-xs text-primary/70">
                          <Globe className="w-3 h-3" /> Site web
                        </span>
                      )}
                      {hotel.facebook && (
                        <span className="flex items-center gap-1 text-xs text-primary/70">
                          <FacebookIcon className="w-3 h-3" /> Facebook
                        </span>
                      )}
                    </div>

                    <span className="mt-1 text-primary text-sm font-semibold group-hover:underline">
                      {isEn ? "View details →" : "Voir les détails →"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA rejoindre AHF */}
      <section className="bg-white border-t border-slate-100 py-16 px-5">
        <div className="max-w-xl mx-auto text-center">
          <Building2 className="w-10 h-10 text-gold mx-auto mb-4" />
          <h2 className="font-accent text-2xl text-slate-800 mb-3">
            {isEn ? "Join the AHF" : "Rejoindre l'AHF"}
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {isEn
              ? "Are you a hotel in Foulpointe? Join our association and be listed in our directory."
              : "Vous êtes un hôtel à Foulpointe ? Rejoignez notre association et soyez référencé dans notre annuaire."}
          </p>
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-h transition-colors text-sm"
          >
            {isEn ? "Contact us" : "Nous contacter"}
          </Link>
        </div>
      </section>
    </main>
  );
}
