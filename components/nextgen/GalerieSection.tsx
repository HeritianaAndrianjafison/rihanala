"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Camera, ArrowRight } from "lucide-react";
import type { IPhoto } from "@/types";

interface GalerieSectionProps {
  photos: IPhoto[];
}

const GALERIE_PLACEHOLDER = [
  { src: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=900&q=80&auto=format", altFr: "Domaine extérieur Rihanala Village", cls: "g1" },
  { src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&q=80&auto=format", altFr: "Chambre confort Rihanala Village", cls: "g2" },
  { src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500&q=80&auto=format", altFr: "Espaces extérieurs verdoyants", cls: "g3" },
  { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80&auto=format", altFr: "Restaurant Rihanala Village", cls: "g4" },
  { src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80&auto=format", altFr: "Gastronomie malgache", cls: "g5" },
];

export default function GalerieSection({ photos }: GalerieSectionProps) {
  const t = useTranslations("galerie");

  const displayPhotos = photos.length >= 5
    ? photos.slice(0, 5).map((p, i) => ({ src: p.url, altFr: p.altFr, cls: `g${i + 1}` }))
    : GALERIE_PLACEHOLDER;

  return (
    <section id="galerie" className="py-24 relative overflow-hidden" style={{ background: "#1A3528" }}>
      {/* Lumière ambiante or */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse 65% 45% at 20% 0%, rgba(200,169,110,.10) 0%, transparent 55%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12" style={{ background: "rgba(200,169,110,.45)" }} aria-hidden="true" />
              <span className="text-[11px] tracking-[0.3em] uppercase font-semibold" style={{ color: "var(--color-gold)" }}>
                {t("section_label")}
              </span>
            </div>
            <h2 className="font-display font-light text-white leading-snug" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
              {t("title_1")}<br />
              <em className="font-semibold not-italic" style={{ color: "var(--color-gold-l)" }}>{t("title_2")}</em>
            </h2>
          </div>
          <a
            href="#"
            className="hidden md:flex items-center gap-2 text-sm font-medium transition-all duration-200 cursor-pointer group"
            style={{ color: "rgba(255,255,255,.60)", minHeight: "44px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--color-gold)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.60)"; }}
          >
            {t("voir_tout")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" aria-hidden="true" />
          </a>
        </div>

        {/* Gallery grid */}
        <div
          className="gallery-grid rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px rgba(0,0,0,.30)", border: "1px solid rgba(200,169,110,.12)" }}
        >
          {displayPhotos.map(({ src, altFr, cls }, i) => (
            <div key={i} className={`${cls} relative group cursor-pointer`}>
              <Image
                src={src}
                alt={altFr}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                loading="lazy"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                style={{ background: "rgba(27,77,62,.50)" }}
              >
                {cls === "g5" ? (
                  <div className="text-center text-white">
                    <Camera className="w-6 h-6 mx-auto mb-1" aria-hidden="true" />
                    <span className="text-sm font-medium">{t("plus_photos")}</span>
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(200,169,110,.90)", color: "var(--color-dark)" }}
                  >
                    <Camera className="w-4 h-4" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
