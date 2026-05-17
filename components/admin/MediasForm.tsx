"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2, Save, Trash2, GripVertical, CheckCircle } from "lucide-react";
import { SingleImageUploader } from "@/components/admin/ImageUploader";
import type { IPhoto } from "@/types";

interface MediasFormProps {
  heroImageUrl:     string;
  servicesImageUrl: string;
  galeriePhotos:    IPhoto[];
}

export default function MediasForm({
  heroImageUrl:     initialHero,
  servicesImageUrl: initialServices,
  galeriePhotos:    initialGalerie,
}: MediasFormProps) {
  // ── Hero ─────────────────────────────────────────────────────────────────────
  const [heroUrl, setHeroUrl]         = useState(initialHero);
  const [savingHero, setSavingHero]   = useState(false);
  const [heroOk, setHeroOk]           = useState(false);

  async function saveHero() {
    setSavingHero(true);
    setHeroOk(false);
    await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_hero: heroUrl }),
    });
    setSavingHero(false);
    setHeroOk(true);
    setTimeout(() => setHeroOk(false), 3000);
  }

  // ── Services ─────────────────────────────────────────────────────────────────
  const [servicesUrl, setServicesUrl]       = useState(initialServices);
  const [savingServices, setSavingServices] = useState(false);
  const [servicesOk, setServicesOk]         = useState(false);

  async function saveServices() {
    setSavingServices(true);
    setServicesOk(false);
    await fetch("/api/parametres", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_services: servicesUrl }),
    });
    setSavingServices(false);
    setServicesOk(true);
    setTimeout(() => setServicesOk(false), 3000);
  }

  // ── Galerie ───────────────────────────────────────────────────────────────────
  const [galerie, setGalerie] = useState<IPhoto[]>(initialGalerie);
  const [uploading, setUploading]     = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newAltFr, setNewAltFr]       = useState("");
  const [newAltEn, setNewAltEn]       = useState("");
  const [newUrl, setNewUrl]           = useState("");
  const [newCategorie, setNewCategorie] = useState<IPhoto["categorie"]>("EXTERIEURS");

  async function uploadAndAdd(file: File) {
    setUploading(true);
    setUploadError(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "rihanala/galerie");
    try {
      const res  = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur upload");
      setNewUrl(data.url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setUploading(false);
    }
  }

  async function addPhoto() {
    if (!newUrl) return;
    const res = await fetch("/api/photos/galerie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url:       newUrl,
        altFr:     newAltFr || "Photo Rihanala Village",
        altEn:     newAltEn || "Rihanala Village photo",
        categorie: newCategorie,
        ordre:     galerie.length,
      }),
    });
    if (res.ok) {
      const photo = await res.json();
      setGalerie((g) => [...g, photo]);
      setNewUrl("");
      setNewAltFr("");
      setNewAltEn("");
    }
  }

  async function deletePhoto(id: string) {
    await fetch("/api/photos/galerie", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setGalerie((g) => g.filter((p) => p.id !== id));
  }

  const CATEGORIES: { value: IPhoto["categorie"]; label: string }[] = [
    { value: "HEBERGEMENT",   label: "Hébergement" },
    { value: "RESTAURANT",    label: "Restaurant" },
    { value: "EXTERIEURS",    label: "Extérieurs" },
    { value: "ACTIVITES",     label: "Activités" },
    { value: "SALLE_REUNION", label: "Salle réunion" },
  ];

  const sectionTitle = "font-semibold text-slate-700 text-sm uppercase tracking-wide";
  const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";

  return (
    <div className="space-y-8 max-w-3xl">

      {/* ══ IMAGE HERO ════════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={sectionTitle}>Image Hero — Fond de la page d'accueil</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Grande photo plein écran visible en arrière-plan dès l'arrivée sur le site
            </p>
          </div>
          {heroOk && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Sauvegardé
            </span>
          )}
        </div>

        <SingleImageUploader
          value={heroUrl}
          onChange={setHeroUrl}
          folder="rihanala/hero"
          label="Photo Hero"
          hint="Format paysage recommandé (16:9) · Min 1920×1080 · JPG ou WebP"
        />

        <button
          type="button"
          onClick={saveHero}
          disabled={savingHero || !heroUrl}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-h transition-colors text-sm disabled:opacity-50"
        >
          {savingHero ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer l'image hero
        </button>
      </section>

      {/* ══ IMAGE SERVICES ════════════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={sectionTitle}>Image Services — Section restaurant</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Photo illustrant la section "Nos services" sur la page d'accueil
            </p>
          </div>
          {servicesOk && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle className="w-4 h-4" /> Sauvegardé
            </span>
          )}
        </div>

        <SingleImageUploader
          value={servicesUrl}
          onChange={setServicesUrl}
          folder="rihanala/services"
          label="Photo Services"
          hint="Format paysage (4:3 ou 16:9) · Restaurant, salle réunion ou espaces verts"
        />

        <button
          type="button"
          onClick={saveServices}
          disabled={savingServices || !servicesUrl}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-h transition-colors text-sm disabled:opacity-50"
        >
          {savingServices ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer l'image services
        </button>
      </section>

      {/* ══ GALERIE LANDING PAGE ══════════════════════════════════════════════ */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className={sectionTitle}>Galerie — Section galerie de la page d'accueil</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Les 5 premières photos sont affichées dans la grille galerie.
            {galerie.length >= 5 && (
              <span className="ml-1 text-amber-500 font-medium">
                {galerie.length} photo{galerie.length > 1 ? "s" : ""} — seules les 5 premières sont affichées.
              </span>
            )}
          </p>
        </div>

        {/* Photos existantes */}
        {galerie.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-4">
            Aucune photo dans la galerie — les photos de démonstration sont affichées.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {galerie.map((photo, i) => (
              <div key={photo.id} className="relative group">
                <div className={`relative h-28 rounded-xl overflow-hidden border-2 transition-colors ${i < 5 ? "border-primary/30" : "border-slate-200"}`}>
                  <Image
                    src={photo.url}
                    alt={photo.altFr}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                  {i < 5 && (
                    <div className="absolute top-1 left-1 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      #{i + 1}
                    </div>
                  )}
                </div>
                <div className="mt-1 px-0.5">
                  <p className="text-xs text-slate-500 truncate">{photo.altFr}</p>
                  <p className="text-[10px] text-slate-400">{CATEGORIES.find(c => c.value === photo.categorie)?.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <GripVertical className="absolute bottom-8 right-1 w-4 h-4 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {/* Ajouter une photo */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Ajouter une photo à la galerie
          </p>

          {/* Upload */}
          <div>
            <label className={labelCls}>Photo</label>
            <div
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/jpeg,image/png,image/webp";
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) uploadAndAdd(file);
                };
                input.click();
              }}
              className="border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-xl p-5 text-center cursor-pointer transition-all hover:bg-slate-50"
            >
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Upload en cours…
                </div>
              ) : newUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0">
                    <Image src={newUrl} alt="Aperçu" fill className="object-cover" sizes="64px" />
                  </div>
                  <span className="text-sm text-green-600 font-medium">Photo prête · cliquez pour en choisir une autre</span>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Cliquez pour uploader une photo · Téléphone ou PC
                </p>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Description FR</label>
              <input
                type="text"
                value={newAltFr}
                onChange={(e) => setNewAltFr(e.target.value)}
                placeholder="Espaces verts Rihanala…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description EN</label>
              <input
                type="text"
                value={newAltEn}
                onChange={(e) => setNewAltEn(e.target.value)}
                placeholder="Rihanala green spaces…"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Catégorie</label>
              <select
                value={newCategorie}
                onChange={(e) => setNewCategorie(e.target.value as IPhoto["categorie"])}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={addPhoto}
            disabled={!newUrl}
            className="flex items-center gap-2 bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-h transition-colors text-sm disabled:opacity-40"
          >
            <Save className="w-4 h-4" />
            Ajouter à la galerie
          </button>
        </div>
      </section>
    </div>
  );
}
