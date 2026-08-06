import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, MapPin, Phone, Calendar } from "lucide-react";

const HERO_FALLBACK = "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=1800&q=85&auto=format&fit=crop";

interface HeroSectionProps {
  imageUrl?: string | null;
}

export default function HeroSection({ imageUrl }: HeroSectionProps) {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen flex items-end pb-28 sm:pb-24 overflow-hidden">
      {/* Image de fond — lumineuse, couleurs vives */}
      <Image
        src={imageUrl || HERO_FALLBACK}
        alt="Vue panoramique sur la côte Est de Madagascar"
        fill
        priority
        className="object-cover"
        style={{ filter: "brightness(1.08) saturate(1.20)", transform: "scale(1.04)" }}
        sizes="100vw"
      />

      {/* Overlay multicouche — assombrit bas + gauche pour lisibilité texte */}
      <div className="hero-overlay absolute inset-0 z-[2]" aria-hidden="true" />

      {/* Lumière ambiante — haut gauche */}
      <div className="hero-light-leak" aria-hidden="true" />
      <div className="hero-light-leak-2" aria-hidden="true" />

      {/* Barre shimmer dorée */}
      <div className="absolute top-0 left-0 right-0 h-0.5 shimmer-bar z-10" aria-hidden="true" />

      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10 w-full" style={{ zIndex: 10 }}>
        <div className="max-w-2xl">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5 au1">
            <div className="h-px w-10 bg-gold shrink-0" aria-hidden="true" />
            <span
              className="text-white text-[11px] tracking-[0.3em] uppercase font-semibold"
              style={{ textShadow: "0 1px 8px rgba(0,0,0,.65)" }}
            >
              {t("eyebrow")}
            </span>
          </div>

          {/* Titre H1 */}
          <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl font-light text-white leading-[1.08] mb-4 au2" style={{ textShadow: "0 2px 32px rgba(0,0,0,.70), 0 1px 6px rgba(0,0,0,.55)" }}>
            {t("title_1")}<br />
            <em className="font-semibold not-italic text-gold">{t("title_2")}</em><br />
            {t("title_3")}
          </h1>

          {/* Sous-titre */}
          <p className="text-white/95 text-base sm:text-lg leading-relaxed mb-7 max-w-lg au3" style={{ textShadow: "0 1px 16px rgba(0,0,0,.70)" }}>
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 au4">
            <a
              href="#hebergements"
              className="group bg-gold text-dark font-semibold px-7 py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-gold-d transition-colors duration-200 cursor-pointer"
              style={{ minHeight: "50px" }}
            >
              {t("cta_primary")}
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                aria-hidden="true"
              />
            </a>
            <a
              href="#contact"
              className="hero-glass-btn text-white font-medium px-7 py-3.5 rounded-full cursor-pointer flex items-center justify-center"
              style={{ minHeight: "50px" }}
            >
              {t("cta_secondary")}
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute right-10 bottom-0 hidden md:flex flex-col items-center gap-2 scroll-bounce"
          aria-hidden="true"
        >
          <span
            className="text-white/35 text-[10px] tracking-widest uppercase"
            style={{ writingMode: "vertical-rl" }}
          >
            {t("scroll")}
          </span>
          <div className="w-px h-14 bg-gradient-to-b from-white/35 to-transparent" />
        </div>
      </div>

      {/* Quick info strip */}
      <div className="hero-strip-glass absolute bottom-0 left-0 right-0">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-3 flex items-center justify-between gap-3">

          {/* Mobile : localisation + bouton appel uniquement */}
          <div className="flex items-center gap-2 text-white min-w-0">
            <MapPin className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium truncate">{t("location")}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-white">
            <Phone className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{t("phone_label")}</span>
          </div>

          <div className="hidden md:flex items-center gap-2.5 text-white">
            <Calendar className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{t("hours")}</span>
          </div>

          <a
            href="tel:+261346808466"
            className="bg-gold text-dark text-sm font-bold px-4 py-2.5 rounded-full hover:bg-gold-d transition-colors duration-200 cursor-pointer shrink-0 flex items-center"
            style={{ minHeight: "40px" }}
          >
            {t("cta_call")}
          </a>
        </div>
      </div>
    </section>
  );
}
