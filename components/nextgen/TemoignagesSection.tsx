import { useTranslations } from "next-intl";
import type { IAvis } from "@/types";
import AvisForm from "./AvisForm";

interface TemoignagesSectionProps {
  avis: IAvis[];
}

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

const PLACEHOLDER_AVIS: IAvis[] = [
  { id: "1", auteurNom: "Marie-Claire R.", auteurPays: "Antananarivo, Madagascar", note: 5, commentaire: "Un séjour magnifique à Foulpointe. Le cadre est exceptionnel, l'accueil chaleureux et les bungalows très confortables. Nous reviendrons !", reponse: null, estApprouve: true, createdAt: new Date() },
  { id: "2", auteurNom: "Pasteur Jean-Pierre M.", auteurPays: "Toamasina, Madagascar", note: 5, commentaire: "Parfait pour notre retraite de groupe. La salle de séminaire est bien équipée, le restaurant délicieux et le domaine immense. Très professionnel.", reponse: null, estApprouve: true, createdAt: new Date() },
  { id: "3", auteurNom: "Thomas K.", auteurPays: "France", note: 4, commentaire: "Great place to disconnect from the city! Beautiful green surroundings, friendly staff and very spacious rooms. Highly recommend for families.", reponse: null, estApprouve: true, createdAt: new Date() },
];

function StarRating({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5 mb-4" aria-label={`Note : ${note} étoiles sur 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < note ? "text-gold" : "text-white/20"}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </div>
  );
}

export default function TemoignagesSection({ avis }: TemoignagesSectionProps) {
  const t = useTranslations("temoignages");
  const displayAvis = avis.length > 0 ? avis : PLACEHOLDER_AVIS;

  return (
    <section id="temoignages" className="py-24 bg-primary">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-14 bg-gold/35" aria-hidden="true" />
            <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-medium">
              {t("section_label")}
            </span>
            <div className="h-px w-14 bg-gold/35" aria-hidden="true" />
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white leading-snug">
            {t("title_1")}<br />
            <em className="font-semibold not-italic text-gold">{t("title_2")}</em>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {displayAvis.slice(0, 3).map((a) => (
            <div key={a.id} className="lg-card rounded-2xl p-6 cursor-pointer">
              <StarRating note={a.note} />
              <p className="text-white/80 text-sm leading-relaxed mb-5 italic font-light">
                "{a.commentaire}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-gold font-bold text-sm" aria-hidden="true">
                    {a.auteurNom.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{a.auteurNom}</div>
                  <div className="text-white/35 text-xs">{a.auteurPays}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <AvisForm />
      </div>
    </section>
  );
}
