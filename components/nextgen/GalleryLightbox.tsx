"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface GalleryPhoto {
  id: string;
  url: string;
  alt: string;
}

interface GalleryLightboxProps {
  coverPhoto: GalleryPhoto | null;
  galleryPhotos: GalleryPhoto[];
  totalCount: number;
  locale: string;
}

export default function GalleryLightbox({
  coverPhoto,
  galleryPhotos,
  totalCount,
}: GalleryLightboxProps) {
  const allPhotos: GalleryPhoto[] = [
    ...(coverPhoto ? [coverPhoto] : []),
    ...galleryPhotos,
  ];

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = (index: number) => setLightboxIndex(index);
  const close = () => setLightboxIndex(null);

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + allPhotos.length) % allPhotos.length));
  }, [allPhotos.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % allPhotos.length));
  }, [allPhotos.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, prev, next]);

  return (
    <>
      {/* Mobile : photo principale + bande de miniatures */}
      <div className="lg:hidden">
        <div
          className="relative w-full h-60 sm:h-80 rounded-2xl overflow-hidden bg-slate-200 cursor-zoom-in"
          onClick={() => openAt(0)}
        >
          {coverPhoto ? (
            <Image
              src={coverPhoto.url}
              alt={coverPhoto.alt}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Pas encore de photo
            </div>
          )}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full">
              1 / {allPhotos.length}
            </div>
          )}
        </div>
        {galleryPhotos.length > 0 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {galleryPhotos.slice(0, 6).map((p, i) => (
              <div
                key={p.id}
                className="relative w-24 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-200 cursor-zoom-in"
                onClick={() => openAt(i + 1)}
              >
                <Image
                  src={p.url}
                  alt={p.alt}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                {i === 5 && totalCount > 7 && (
                  <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{totalCount - 7}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop : grille 5 colonnes */}
      <div className="hidden lg:grid grid-cols-5 gap-3 rounded-2xl overflow-hidden h-[420px]">
        <div
          className="col-span-3 relative bg-slate-200 cursor-zoom-in"
          onClick={() => openAt(0)}
        >
          {coverPhoto ? (
            <Image
              src={coverPhoto.url}
              alt={coverPhoto.alt}
              fill
              className="object-cover"
              sizes="60vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
              Pas encore de photo
            </div>
          )}
        </div>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {galleryPhotos.slice(0, 4).map((p, i) => (
            <div
              key={p.id}
              className="relative bg-slate-200 cursor-zoom-in"
              onClick={() => openAt(i + 1)}
            >
              <Image
                src={p.url}
                alt={p.alt}
                fill
                className="object-cover"
                sizes="20vw"
              />
              {i === 3 && totalCount > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">+{totalCount - 5}</span>
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - galleryPhotos.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-100" />
          ))}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightboxIndex !== null && allPhotos[lightboxIndex] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92"
          onClick={close}
        >
          {/* Image centrale */}
          <div
            className="relative w-full max-w-4xl mx-4 aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allPhotos[lightboxIndex].url}
              alt={allPhotos[lightboxIndex].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Compteur */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-medium px-4 py-1.5 rounded-full">
            {lightboxIndex + 1} / {allPhotos.length}
          </div>

          {/* Fermer */}
          <button
            onClick={close}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Précédent */}
          {allPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition-colors cursor-pointer"
              aria-label="Précédente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Suivant */}
          {allPhotos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 rounded-full p-3 transition-colors cursor-pointer"
              aria-label="Suivante"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </>
  );
}
