"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Users, Wind, Tv, Bath, Home, UtensilsCrossed, ChefHat, Star, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IHebergement } from "@/types";

// ── Icônes équipements ─────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Wind, Tv, Bath, Home, Users, UtensilsCrossed, ChefHat,
};

function EquipementIcon({ icone, nom }: { icone?: string | null; nom: string }) {
  const Icon = icone ? ICON_MAP[icone] : null;
  return (
    <span className="flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
      {nom}
    </span>
  );
}

// ── Filtres ────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "filter_all",       type: null },
  { key: "filter_couple",    type: "CHAMBRE_DOUBLE" },
  { key: "filter_famille",   type: "CHAMBRE_FAMILIALE" },
  { key: "filter_groupe",    type: "DORTOIR" },
  { key: "filter_seminaire", type: "DORTOIR" },
] as const;

interface HebergementsSectionProps {
  hebergements: IHebergement[];
}

const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] } },
};

const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export default function HebergementsSection({ hebergements }: HebergementsSectionProps) {
  const t = useTranslations("hebergements");
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = activeFilter
    ? hebergements.filter((h) => h.type === activeFilter)
    : hebergements;

  const cover = (h: IHebergement) =>
    h.photos.find((p) => p.estCouverture)?.url ?? h.photos[0]?.url ?? null;

  return (
    <section
      id="hebergements"
      className="py-24 relative overflow-hidden"
      style={{ background: "#0A1610" }}
    >
      {/* Décoration subtile haut-droite */}
      <div
        className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
        aria-hidden="true"
        style={{ background: "radial-gradient(ellipse at top right, rgba(200,169,110,.06) 0%, transparent 65%)" }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-14 bg-gold/40" aria-hidden="true" />
            <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-semibold">
              {t("section_label")}
            </span>
            <div className="h-px w-14 bg-gold/40" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white leading-snug mb-4">
            {t("title_1")}<br />
            <em className="font-semibold not-italic text-gold">{t("title_2")}</em>
          </h2>
          <p className="max-w-lg mx-auto text-base leading-relaxed" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,.55)" }}>
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-2 mb-11">
          {FILTERS.map(({ key, type }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(type)}
              className={cn(
                "text-sm px-5 py-2.5 rounded-full border transition-all duration-200 cursor-pointer font-medium",
                activeFilter === type
                  ? "bg-gold text-dark border-gold shadow-md"
                  : "bg-transparent text-white/70 border-white/20 hover:border-gold/60 hover:bg-white/8"
              )}
              style={{ minHeight: "44px" }}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Grille cards */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger}
        >
          {filtered.map((h) => (
            <motion.div
              key={h.id}
              className="room-card rounded-2xl overflow-hidden relative"
              variants={fadeInUp}
              style={{
                background: "#12251B",
                boxShadow: "0 4px 24px rgba(0,0,0,.30)",
                border: "1px solid rgba(200,169,110,.14)",
              }}
            >
              {/* Badge vedette */}
              {h.estEnVedette && (
                <div className="lg-badge absolute top-3.5 left-3.5 z-10 text-dark text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Star className="w-3 h-3" aria-hidden="true" />
                  {t("en_vedette")}
                </div>
              )}

              {/* Photo */}
              <div className="overflow-hidden h-56" style={{ background: "rgba(255,255,255,.04)" }}>
                {cover(h) ? (
                  <Image
                    src={cover(h)!}
                    alt={h.photos.find((p) => p.estCouverture)?.altFr ?? h.nom}
                    width={600}
                    height={400}
                    className="card-img w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted">
                    <Home className="w-12 h-12" aria-hidden="true" />
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-6">
                <span className="text-[11px] text-gold font-semibold uppercase tracking-widest">
                  {h.estEnVedette
                    ? t("badge_prestige")
                    : t(`badge_${h.type.toLowerCase().replace("chambre_", "").replace("_", "")}` as "badge_prestige")}
                </span>
                <div className="flex items-start justify-between mt-1 mb-3">
                  <h3 className="font-accent text-xl text-white">{h.nom}</h3>
                  <div className="text-right shrink-0 ml-2">
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,.40)" }}>{t("a_partir_de")}</div>
                    <div className="font-display text-xl text-gold font-semibold">
                      {h.prixBase > 0 ? `${h.prixBase.toLocaleString("fr-FR")} Ar` : t("sur_demande")}
                    </div>
                  </div>
                </div>

                <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: "var(--font-body)", color: "rgba(255,255,255,.55)" }}>
                  {h.description}
                </p>

                {/* Équipements */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-5" style={{ color: "rgba(255,255,255,.45)" }}>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {h.capacite} {h.capacite > 1 ? "personnes" : "personne"}
                  </span>
                  {h.equipements.slice(0, 2).map((eq) => (
                    <EquipementIcon key={eq.id} icone={eq.icone} nom={eq.nom} />
                  ))}
                </div>

                <Link
                  href={`/${locale}/hebergements/${h.slug}`}
                  className={cn(
                    "w-full text-sm font-semibold py-3 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2",
                    h.estEnVedette
                      ? "bg-gold text-dark hover:opacity-90"
                      : "border border-gold/35 text-gold hover:bg-gold hover:text-dark hover:border-gold"
                  )}
                  style={{ minHeight: "44px" }}
                >
                  {t("voir_details")}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          ))}

          {/* CTA card conseil */}
          <motion.div
            className="rounded-2xl p-8 flex flex-col justify-between md:col-span-2 lg:col-span-2 animate-float relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(27,77,62,.95) 0%, rgba(10,30,18,.98) 100%)",
              border: "1px solid rgba(200,169,110,.22)",
              boxShadow: "0 24px 64px rgba(27,77,62,.20), inset 0 1px 0 rgba(200,169,110,.22)",
            }}
            variants={fadeInUp}
          >
            <div
              className="absolute top-0 left-[6%] right-[6%] h-px pointer-events-none"
              style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,110,.55) 40%, rgba(255,255,255,.28) 50%, rgba(200,169,110,.55) 60%, transparent)" }}
              aria-hidden="true"
            />
            <div>
              <span className="text-gold text-[11px] uppercase tracking-widest font-semibold">
                {t("conseil_label")}
              </span>
              <h3 className="font-display text-3xl font-light text-white mt-3 mb-4 leading-snug">
                {t("conseil_title_1")}<br />
                <em className="font-semibold not-italic text-gold">{t("conseil_title_2")}</em>
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">{t("conseil_text")}</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="https://wa.me/261346808466"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold px-6 py-3 rounded-full flex items-center gap-2 text-sm transition-colors duration-200 cursor-pointer hover:opacity-90"
                style={{ background: "#25D366", color: "#fff", minHeight: "44px" }}
              >
                {t("whatsapp")}
              </a>
              <a
                href="#contact"
                className="border border-white/25 text-white font-medium px-6 py-3 rounded-full text-sm hover:bg-white/10 hover:border-white/50 transition-all duration-200 cursor-pointer flex items-center"
                style={{ minHeight: "44px" }}
              >
                {t("formulaire")}
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
