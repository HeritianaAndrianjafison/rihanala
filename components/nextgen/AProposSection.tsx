import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, Heart, Leaf, Star } from "lucide-react";

const VALUES = [
  { key: "valeur_1", Icon: Heart },
  { key: "valeur_2", Icon: Leaf },
  { key: "valeur_3", Icon: Star },
] as const;

export default function AProposSection() {
  const t = useTranslations("a_propos");

  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-gold/40" aria-hidden="true" />
                <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-medium">
                  {t("section_label")}
                </span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-light text-primary mb-6 leading-snug">
                {t("title_1")}<br />
                <em className="font-semibold not-italic">{t("title_2")}</em>
              </h1>
              <p className="text-dark/65 text-base leading-relaxed mb-8 max-w-xl">
                {t("intro")}
              </p>

              <div className="space-y-6">
                <div>
                  <h2 className="font-semibold text-primary text-lg mb-2">{t("histoire_title")}</h2>
                  <p className="text-dark/60 text-sm leading-relaxed">{t("histoire_text")}</p>
                </div>
                <div>
                  <h2 className="font-semibold text-primary text-lg mb-2">{t("mission_title")}</h2>
                  <p className="text-dark/60 text-sm leading-relaxed">{t("mission_text")}</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&q=80&auto=format&fit=crop"
                alt="Rihanala Village — Côte Est Madagascar"
                width={800}
                height={600}
                className="rounded-2xl w-full h-[28rem] object-cover"
                loading="lazy"
              />
              <div className="absolute -bottom-5 -left-5 bg-primary rounded-2xl p-5 shadow-xl text-center w-44">
                <div className="font-display text-4xl font-bold text-gold leading-none">15 000</div>
                <div className="text-white/70 text-xs mt-1.5 leading-snug">m² de domaine verdoyant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="text-center mb-12">
            <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-medium">
              {t("valeurs_label")}
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {VALUES.map(({ key, Icon }) => (
              <div key={key} className="text-center p-8 bg-surface rounded-2xl">
                <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-primary text-lg mb-3">
                  {t(`${key}_title` as "valeur_1_title")}
                </h3>
                <p className="text-dark/55 text-sm leading-relaxed">
                  {t(`${key}_text` as "valeur_1_text")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-2xl mx-auto px-5 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-4 leading-snug">
            {t("cta_title")}
          </h2>
          <p className="text-white/60 mb-8 text-sm leading-relaxed">{t("cta_text")}</p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-gold text-dark font-semibold px-8 py-4 rounded-full hover:bg-gold-d transition-colors duration-200 cursor-pointer"
            style={{ minHeight: "52px" }}
          >
            {t("cta_btn")}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
        </div>
      </section>
    </div>
  );
}
