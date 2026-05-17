"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { UtensilsCrossed, Monitor, Heart, Leaf } from "lucide-react";

const SERVICES = [
  { key: "restaurant", Icon: UtensilsCrossed },
  { key: "seminaire",  Icon: Monitor },
  { key: "priere",     Icon: Heart },
  { key: "espaces",    Icon: Leaf },
] as const;

const SERVICES_FALLBACK = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format";

interface ServicesSectionProps {
  imageUrl?: string | null;
}

export default function ServicesSection({ imageUrl }: ServicesSectionProps) {
  const t = useTranslations("services");

  return (
    <section id="services" className="py-24 relative overflow-hidden" style={{ background: "#0E1C14" }}>
      {/* Décoration bas-gauche */}
      <div
        className="absolute bottom-0 left-0 w-80 h-80 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at bottom left, rgba(200,169,110,.07) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid lg:grid-cols-2 gap-14 items-center">

          {/* Image avec badge */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.40)" }}>
              <Image
                src={imageUrl || SERVICES_FALLBACK}
                alt="Restaurant Rihanala Village — gastronomie malgache"
                width={800}
                height={480}
                className="w-full h-96 object-cover"
                loading="lazy"
              />
            </div>
            {/* Badge */}
            <div
              className="absolute -bottom-5 -right-5 rounded-2xl p-5 shadow-xl text-center"
              style={{
                background: "linear-gradient(135deg, var(--color-gold-d), var(--color-gold))",
                width: "11rem",
              }}
            >
              <div className="font-display text-4xl font-bold text-dark leading-none">60</div>
              <div className="text-dark/70 text-xs mt-1.5 leading-snug">{t("badge")}</div>
            </div>

            {/* Décoration coin */}
            <div
              className="absolute -top-5 -left-5 w-28 h-28 rounded-2xl pointer-events-none -z-10"
              aria-hidden="true"
              style={{ border: "2px solid rgba(200,169,110,.18)", background: "rgba(200,169,110,.04)" }}
            />
          </div>

          {/* Liste services */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold/40" aria-hidden="true" />
              <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-semibold">
                {t("section_label")}
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-8 leading-snug">
              {t("title_1")}<br />
              <em className="font-semibold not-italic text-gold">{t("title_2")}</em>
            </h2>

            <div className="space-y-2">
              {SERVICES.map(({ key, Icon }) => (
                <div
                  key={key}
                  className="group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                  style={{ border: "1px solid transparent" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(200,169,110,.08)";
                    el.style.borderColor = "rgba(200,169,110,.28)";
                    el.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "transparent";
                    el.style.transform = "translateX(0)";
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-105"
                    style={{ background: "rgba(200,169,110,.14)", minWidth: "44px", minHeight: "44px" }}
                  >
                    <Icon className="w-5 h-5 text-gold transition-colors duration-200" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-[15px] mb-0.5">
                      {t(`${key}_nom` as "restaurant_nom")}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,.55)" }}>
                      {t(`${key}_desc` as "restaurant_desc")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
