"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileMenu from "./MobileMenu";

interface HeaderProps {
  locale: string;
}

interface NavLink {
  key: string;
  anchor: string;
  page: string;
}

const NAV_LINKS: NavLink[] = [
  { key: "hebergements", anchor: "#hebergements", page: "/hebergements" },
  { key: "services",     anchor: "#services",     page: "/services" },
  { key: "galerie",      anchor: "#galerie",       page: "/galerie" },
  { key: "avis",         anchor: "#temoignages",   page: "/" },
  { key: "actualites",   anchor: "#actualites",    page: "/actualites" },
  { key: "contact",      anchor: "#contact",       page: "/contact" },
];

const LOCALES = ["fr", "en", "mg"] as const;

export default function Header({ locale }: HeaderProps) {
  const t = useTranslations("nav");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={cn(
          "nav-glass fixed top-0 left-0 right-0 z-50 px-5 md:px-10 py-4 transition-all duration-300",
          scrolled && "py-3"
        )}
        aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3 group"
            aria-label="Rihanala Village — Accueil"
          >
            <Image
              src="/logo_rihanala.png"
              alt="Rihanala Village"
              width={90}
              height={90}
              className="shrink-0 object-contain rounded-lg"
            />
            <div>
              <div className="text-white font-display font-semibold text-[1.1rem] leading-none tracking-wide">
                Rihanala Village
              </div>
              <div className="text-gold text-[10px] tracking-[0.25em] uppercase mt-0.5">
                Foulpointe · Madagascar
              </div>
            </div>
          </Link>

          {/* Nav links — desktop */}
          <div className="hidden lg:flex items-center gap-7 text-sm">
            {NAV_LINKS.map(({ key, anchor, page }) => {
              const href = (isHome && anchor) ? anchor : `/${locale}${page}`;
              return (
                <Link
                  key={key}
                  href={href}
                  className="text-white/75 hover:text-gold transition-colors duration-200"
                >
                  {t(key)}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {/* Language selector */}
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
              style={{
                background: "rgba(255,255,255,.10)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,.14)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.16)",
              }}
            >
              {LOCALES.map((loc, i) => (
                <span key={loc} className="flex items-center gap-1">
                  {i > 0 && <span className="text-white/25">|</span>}
                  <Link
                    href={`/${loc}`}
                    className={cn(
                      "transition-colors duration-200",
                      currentLocale === loc
                        ? "text-gold font-semibold"
                        : "text-white/55 hover:text-white"
                    )}
                    aria-label={`Langue : ${loc.toUpperCase()}`}
                    aria-current={currentLocale === loc ? "true" : undefined}
                  >
                    {loc.toUpperCase()}
                  </Link>
                </span>
              ))}
            </div>

            {/* Fidélité */}
            <Link
              href={`/${locale}/fidelite`}
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold px-4 rounded-full border border-[#C8A96E]/50 text-[#C8A96E] hover:bg-[#C8A96E]/10 transition-colors duration-200 cursor-pointer"
              style={{ minHeight: "44px" }}
            >
              <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
              Fidélité
            </Link>

            {/* CTA Réserver */}
            <Link
              href={`/${locale}/reservation`}
              className="hidden md:flex items-center bg-gold text-dark text-sm font-semibold px-5 rounded-full hover:bg-gold-d transition-colors duration-200 cursor-pointer"
              style={{ minHeight: "44px" }}
            >
              {t("reserver")}
            </Link>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden text-white/70 hover:text-white transition-colors flex items-center justify-center"
              style={{ minWidth: "44px", minHeight: "44px" }}
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        locale={locale}
        navLinks={NAV_LINKS}
      />
    </>
  );
}
