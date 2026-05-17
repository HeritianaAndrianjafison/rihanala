"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLink {
  key: string;
  anchor: string;
  page: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  locale: string;
  navLinks: ReadonlyArray<NavLink>;
}

const LOCALES = ["fr", "en", "mg"] as const;

export default function MobileMenu({ open, onClose, locale, navLinks }: MobileMenuProps) {
  const t = useTranslations("nav");
  const currentLocale = useLocale();
  const pathname = usePathname();
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;

  // Bloquer le scroll quand le menu est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-dark/60 z-40 transition-opacity duration-300 lg:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-72 z-50 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{
          background: "rgba(11,24,17,.96)",
          backdropFilter: "blur(28px)",
          borderLeft: "1px solid rgba(200,169,110,.15)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Menu mobile"
      >
        {/* Header panel */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <span className="font-display text-white text-lg">Menu</span>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors flex items-center justify-center"
            style={{ minWidth: "44px", minHeight: "44px" }}
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-6 py-6 flex flex-col gap-1" aria-label="Navigation mobile">
          {navLinks.map(({ key, anchor, page }) => {
            const href = (isHome && anchor) ? anchor : `/${locale}${page}`;
            return (
              <a
                key={key}
                href={href}
                onClick={onClose}
                className="text-white/70 hover:text-gold hover:bg-white/5 transition-all duration-200 px-3 py-3 rounded-xl text-base"
              >
                {t(key)}
              </a>
            );
          })}
        </nav>

        {/* Footer panel */}
        <div className="px-6 py-6 border-t border-white/8 space-y-3">
          {/* Fidélité */}
          <Link
            href={`/${locale}/fidelite`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 border border-[#C8A96E]/50 text-[#C8A96E] font-semibold rounded-full text-sm w-full hover:bg-[#C8A96E]/10 transition-colors"
            style={{ minHeight: "48px" }}
          >
            <Trophy className="w-4 h-4" aria-hidden="true" />
            Mes points fidélité
          </Link>

          {/* CTA Réserver */}
          <Link
            href={`/${locale}/reservation`}
            onClick={onClose}
            className="flex items-center justify-center bg-gold text-dark font-semibold rounded-full text-sm w-full hover:bg-gold-d transition-colors"
            style={{ minHeight: "48px" }}
          >
            {t("reserver")}
          </Link>

          {/* Language switcher */}
          <div className="flex gap-2 justify-center">
            {LOCALES.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                onClick={onClose}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-full border transition-colors duration-200",
                  currentLocale === loc
                    ? "bg-gold text-dark border-gold font-semibold"
                    : "text-white/45 border-white/10 hover:text-white hover:border-white/30"
                )}
                style={{ minHeight: "36px", display: "flex", alignItems: "center" }}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
