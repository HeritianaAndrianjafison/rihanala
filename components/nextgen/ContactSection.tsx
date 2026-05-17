"use client";

import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, MapPin, Phone, Car, Waves } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  prenom:          z.string().min(2, "Prénom requis"),
  nom:             z.string().min(2, "Nom requis"),
  email:           z.string().email("Email invalide"),
  telephone:       z.string().optional(),
  typeHebergement: z.string().optional(),
  nbPersonnes:     z.number().int().min(1).optional(),
  message:         z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

const HEBERGEMENT_OPTIONS = [
  "Chambre Double (2p)",
  "Chambre Familiale (4-8p)",
  "Suite",
  "Dortoir (10p)",
  "Dortoir (20p)",
];

interface LocalisationItem {
  Icon: LucideIcon;
  labelKey: string;
  valueKey: string | null;
  value?: string;
  href?: string;
}

const LOCALISATION_ITEMS: LocalisationItem[] = [
  { Icon: MapPin, labelKey: "adresse_label", valueKey: "adresse" },
  { Icon: Phone,  labelKey: "tel_label",     valueKey: null,      value: "+261 34 68 084 66", href: "tel:+261346808466" },
  { Icon: Car,    labelKey: "depuis_label",  valueKey: "depuis" },
  { Icon: Waves,  labelKey: "mer_label",     valueKey: "mer" },
];

export default function ContactSection() {
  const t  = useTranslations("contact");
  const tl = useTranslations("localisation");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(data: ContactFormData) {
    await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    reset();
  }

  const inputClass = cn(
    "w-full border border-dark/10 rounded-xl px-4 py-3 text-sm text-dark",
    "focus:outline-none focus:border-primary/40",
    "transition-all bg-white placeholder-dark/30"
  );

  return (
    <>
      {/* Localisation — fond clair */}
      <section className="py-24 relative overflow-hidden" style={{ background: "#0A1610" }}>
        <div
          className="absolute top-0 right-0 w-96 h-96 pointer-events-none"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse at top right, rgba(200,169,110,.07) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-12 bg-gold/40" aria-hidden="true" />
                <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-semibold">
                  {tl("section_label")}
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-8 leading-snug">
                {tl("title_1")}<br />
                <em className="font-semibold not-italic text-gold">{tl("title_2")}</em>
              </h2>

              <dl className="space-y-5">
                {LOCALISATION_ITEMS.map(({ Icon, labelKey, valueKey, value, href }) => (
                  <div key={labelKey} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gold/15 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-5 h-5 text-gold" aria-hidden="true" />
                    </div>
                    <div>
                      <dt className="font-semibold text-white text-[15px] mb-0.5">
                        {tl(labelKey)}
                      </dt>
                      <dd className="text-sm" style={{ color: "rgba(255,255,255,.55)" }}>
                        {href ? (
                          <a href={href} className="text-gold hover:underline">
                            {value ?? tl(valueKey!)}
                          </a>
                        ) : (
                          value ?? tl(valueKey!)
                        )}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <a
                href="https://www.google.com/maps/dir/?api=1&destination=-17.6881238,49.5140787&travelmode=driving"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-primary-h transition-colors duration-200 cursor-pointer"
                style={{ minHeight: "44px" }}
              >
                <MapPin className="w-4 h-4" aria-hidden="true" />
                {tl("maps")}
              </a>
            </div>

            {/* Carte Google Maps — satellite + itinéraire depuis RN5 */}
            <div
              className="rounded-2xl overflow-hidden relative shadow-sm"
              style={{ border: "1px solid rgba(200,169,110,.20)", height: "420px" }}
            >
              <iframe
                src="https://maps.google.com/maps?saddr=-17.6728,49.5065&daddr=-17.6881238,49.5140787&hl=fr&dirflg=d&t=h&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Itinéraire vers Rihanala Village depuis la RN5 — Foulpointe, Madagascar"
              />
              {/* Badge route */}
              <div
                className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold pointer-events-none"
                style={{
                  background: "rgba(27,77,62,.92)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                  WebkitBackdropFilter: "blur(8px)",
                  border: "1px solid rgba(200,169,110,.35)",
                  boxShadow: "0 4px 12px rgba(0,0,0,.25)",
                }}
              >
                <Car className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Depuis la RN5 · ~2 km
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire — fond vert forêt vibrant */}
      <section id="contact" className="py-24 relative overflow-hidden" style={{ background: "#1A3528" }}>
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{ background: "radial-gradient(ellipse 60% 55% at 50% 100%, rgba(200,169,110,.08) 0%, transparent 60%)" }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-10">
          <div className="text-center mb-11">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-px w-14" style={{ background: "rgba(200,169,110,.45)" }} aria-hidden="true" />
              <span className="text-[11px] tracking-[0.3em] uppercase font-semibold" style={{ color: "var(--color-gold)" }}>
                {t("section_label")}
              </span>
              <div className="h-px w-14" style={{ background: "rgba(200,169,110,.45)" }} aria-hidden="true" />
            </div>
            <h2 className="font-display font-light text-white leading-snug" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
              {t("title_1")}<br />
              <em className="font-semibold not-italic" style={{ color: "var(--color-gold)" }}>{t("title_2")}</em>
            </h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,.50)" }}>{t("subtitle")}</p>
          </div>

          {/* Carte formulaire — blanc sur vert */}
          <div
            className="rounded-3xl p-7 md:p-11"
            style={{
              background: "rgba(255,255,255,.96)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 24px 64px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.95)",
            }}
          >
            {isSubmitSuccessful ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl text-primary mb-2">Demande envoyée !</h3>
                <p className="text-dark/55 text-sm">Nous vous répondrons dans les 24h.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="prenom" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("prenom")} <span className="text-gold">{t("required")}</span>
                    </label>
                    <input
                      id="prenom"
                      type="text"
                      autoComplete="given-name"
                      placeholder="Jean-Pierre"
                      {...register("prenom")}
                      className={inputClass}
                      style={{ minHeight: "48px" }}
                    />
                    {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="nom" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("nom")} <span className="text-gold">{t("required")}</span>
                    </label>
                    <input
                      id="nom"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Rakoto"
                      {...register("nom")}
                      className={inputClass}
                      style={{ minHeight: "48px" }}
                    />
                    {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("email")} <span className="text-gold">{t("required")}</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jean@exemple.mg"
                      {...register("email")}
                      className={inputClass}
                      style={{ minHeight: "48px" }}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="tel" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("tel")}
                    </label>
                    <input
                      id="tel"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+261 34 XX XXX XX"
                      {...register("telephone")}
                      className={inputClass}
                      style={{ minHeight: "48px" }}
                    />
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("type")}
                    </label>
                    <select
                      id="type"
                      {...register("typeHebergement")}
                      className={cn(inputClass, "cursor-pointer text-dark/65")}
                      style={{ minHeight: "48px" }}
                    >
                      <option value="">{t("type_placeholder")}</option>
                      {HEBERGEMENT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="nb" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("nb")}
                    </label>
                    <input
                      id="nb"
                      type="number"
                      min={1}
                      max={60}
                      placeholder="2"
                      {...register("nbPersonnes", { valueAsNumber: true })}
                      className={inputClass}
                      style={{ minHeight: "48px" }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="msg" className="block text-[11px] font-semibold text-primary uppercase tracking-widest mb-2">
                      {t("message")}
                    </label>
                    <textarea
                      id="msg"
                      rows={4}
                      placeholder={t("message_placeholder")}
                      {...register("message")}
                      className={cn(inputClass, "resize-none leading-relaxed")}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary text-white font-semibold py-4 rounded-xl hover:bg-primary-h transition-colors duration-200 text-sm tracking-wide cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ minHeight: "52px" }}
                    >
                      {isSubmitting ? "Envoi en cours..." : t("submit")}
                      {!isSubmitting && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
                    </button>
                    <p className="text-center text-dark/35 text-xs mt-3">{t("guarantee")}</p>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
