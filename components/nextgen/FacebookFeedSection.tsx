"use client";

import { useEffect, useRef, useState } from "react";

const FB_PAGE_URL = "https://web.facebook.com/profile.php?id=61551955325688";
const FB_PAGE_URL_ENC = encodeURIComponent(FB_PAGE_URL);

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function FacebookFeedSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 500);
        setWidth(Math.max(w, 280));
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const iframeSrc =
    `https://www.facebook.com/plugins/page.php` +
    `?href=${FB_PAGE_URL_ENC}` +
    `&tabs=timeline` +
    `&width=${width}` +
    `&height=600` +
    `&small_header=true` +
    `&adapt_container_width=true` +
    `&hide_cover=false` +
    `&show_facepile=false`;

  return (
    <section className="py-24 bg-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-10">

        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-12 bg-gold/40" aria-hidden="true" />
              <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-medium">
                Réseaux sociaux
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-light text-white leading-snug">
              Nos dernières<br />
              <em className="font-semibold not-italic text-gold">actualités</em>
            </h2>
            <p className="text-white/45 text-sm mt-4 max-w-sm leading-relaxed">
              Suivez la vie du domaine : événements, promotions, photos de séjours et bons plans directement depuis notre page Facebook.
            </p>
          </div>

          <a
            href={FB_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#1877F2] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#0f65d4] transition-colors duration-200 shrink-0"
            style={{ minHeight: "48px" }}
          >
            <FacebookIcon className="w-5 h-5" />
            Suivre notre page
          </a>
        </div>

        {/* Contenu */}
        <div className="grid lg:grid-cols-[1fr_500px] gap-10 items-start">

          {/* Infos à gauche */}
          <div className="space-y-6">
            {[
              {
                icon: "📸",
                title: "Photos & vidéos",
                desc: "Découvrez les plus beaux moments de Rihanala Village à travers les yeux de nos hôtes.",
              },
              {
                icon: "🎉",
                title: "Événements & promotions",
                desc: "Offres spéciales, week-ends thématiques, séminaires — restez informés en premier.",
              },
              {
                icon: "🌊",
                title: "La vie du domaine",
                desc: "Foulpointe, la côte Est, la nature malgache… Un aperçu de votre prochain séjour.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-2xl transition-colors duration-200"
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(200,169,110,.10)",
                }}
              >
                <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-white/45 text-sm leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}

            <div
              className="p-5 rounded-2xl"
              style={{
                background: "rgba(200,169,110,.08)",
                border: "1px solid rgba(200,169,110,.20)",
              }}
            >
              <div className="text-gold font-semibold text-sm mb-1">Interagissez avec nous</div>
              <p className="text-white/55 text-sm leading-relaxed">
                Commentez, partagez, et taguez <strong className="text-white/70">@RihanalaVillageFoulpointe</strong> lors de votre séjour — nous adorons voir vos photos !
              </p>
            </div>
          </div>

          {/* Feed Facebook à droite */}
          <div ref={containerRef} className="w-full">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgba(200,169,110,.15)",
                boxShadow: "0 24px 64px rgba(0,0,0,.35)",
              }}
            >
              <iframe
                key={width}
                src={iframeSrc}
                width={width}
                height={600}
                style={{ border: "none", display: "block", width: "100%" }}
                scrolling="no"
                allow="encrypted-media"
                title="Actualités Facebook — Rihanala Village"
                loading="lazy"
              />
            </div>

            <a
              href={FB_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-4 text-white/35 hover:text-gold text-xs transition-colors duration-200"
            >
              <FacebookIcon className="w-3.5 h-3.5" />
              Voir toutes les publications sur Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
