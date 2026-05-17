import { useTranslations } from "next-intl";
import Link from "next/link";

const FACEBOOK_ICON_PATH =
  "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z";

interface FooterProps {
  locale: string;
}

const WHATSAPP_ICON_PATH =
  "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.118 1.523 5.854L0 24l6.331-1.503A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.886 0-3.655-.498-5.19-1.37l-.373-.22-3.876.92.978-3.77-.243-.389A9.98 9.98 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z";

const NAV_LINKS = [
  { key: "accueil",       href: "#" },
  { key: "hebergements",  href: "#hebergements" },
  { key: "services",      href: "#services" },
  { key: "galerie",       href: "#galerie" },
  { key: "actualites",    href: "#actualites" },
  { key: "contact",       href: "#contact" },
] as const;

const LOCALES = ["fr", "en", "mg"] as const;

export default function Footer({ locale }: FooterProps) {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");

  return (
    <footer className="bg-dark text-white pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 pb-11 border-b border-white/8">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-gold flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-dark text-lg leading-none select-none">R</span>
              </div>
              <div>
                <div className="font-display text-[1.15rem] leading-none text-white">Rihanala Village</div>
                <div className="text-gold text-[10px] tracking-widest uppercase mt-0.5">Foulpointe · Madagascar</div>
              </div>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed max-w-sm">{t("description")}</p>
            <div className="flex items-center gap-3 mt-5">
              {/* Facebook */}
              <a
                href="https://www.facebook.com/RihanalaVillageFoulpointe"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/8 rounded-full flex items-center justify-center hover:bg-gold/20 transition-colors duration-200"
                aria-label="Rihanala Village sur Facebook"
                style={{ minWidth: "44px", minHeight: "44px" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={FACEBOOK_ICON_PATH} />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/261346808466"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/8 rounded-full flex items-center justify-center hover:bg-[#25D366]/20 transition-colors duration-200"
                aria-label="Contacter sur WhatsApp"
                style={{ minWidth: "44px", minHeight: "44px" }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={WHATSAPP_ICON_PATH} />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-4">{t("nav_label")}</h2>
            <ul className="space-y-3 text-sm">
              {NAV_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <a href={href} className="text-white/45 hover:text-white transition-colors duration-200">
                    {key === "accueil" ? t("accueil") : tn(key as "hebergements" | "services" | "galerie" | "actualites" | "contact")}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Langue */}
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-4">{t("contact_label")}</h2>
            <ul className="space-y-3 text-sm text-white/45">
              <li className="leading-snug">La Haute Ville, Parcelle 4, Mahavelona (Foulpointe)</li>
              <li>
                <a href="tel:+261346808466" className="hover:text-white transition-colors duration-200">
                  +261 34 68 084 66
                </a>
              </li>
            </ul>

            {/* Language switcher */}
            <div className="mt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gold mb-3">{t("langue_label")}</h2>
              <div className="flex gap-2">
                {LOCALES.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    className={
                      locale === loc
                        ? "text-xs bg-gold text-dark px-3 py-1.5 rounded-full font-semibold"
                        : "text-xs text-white/45 hover:text-white px-3 py-1.5 rounded-full border border-white/10 hover:border-white/30 transition-colors duration-200"
                    }
                    style={{ minHeight: "36px", display: "flex", alignItems: "center" }}
                  >
                    {loc.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <div>{t("copyright")}</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/60 transition-colors duration-200">{t("mentions")}</a>
            <a href="#" className="hover:text-white/60 transition-colors duration-200">{t("confidentialite")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
