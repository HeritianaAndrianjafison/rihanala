"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { SingleImageUploader, MultiImageUploader } from "@/components/admin/ImageUploader";
import type { HebergementType } from "@/types";

const hebergementSchema = z.object({
  nom:             z.string().min(3, "Nom requis (min 3 caractères)"),
  nomEn:           z.string().min(3, "Nom EN requis"),
  type:            z.enum(["CHAMBRE_DOUBLE", "CHAMBRE_FAMILIALE", "SUITE", "DORTOIR"] as const),
  description:     z.string().min(150, "Description min 150 caractères (SEO)"),
  descriptionEn:   z.string().min(50),
  capacite:        z.number().int().min(1),
  superficie:      z.number().optional(),
  prixBase:        z.number().min(0),
  prixWeekend:     z.number().optional(),
  estActif:        z.boolean(),
  estEnVedette:    z.boolean(),
  ordre:           z.number().int().min(0),
});

type HebergementFormData = z.infer<typeof hebergementSchema>;

interface InitialPhoto {
  url: string;
  estCouverture: boolean;
}

interface HebergementFormProps {
  defaultValues?: Partial<HebergementFormData>;
  hebergementId?: string;
  initialPhotos?: InitialPhoto[];
}

const TYPE_OPTIONS: { value: HebergementType; label: string }[] = [
  { value: "CHAMBRE_DOUBLE",    label: "Chambre Double" },
  { value: "CHAMBRE_FAMILIALE", label: "Chambre Familiale" },
  { value: "SUITE",             label: "Suite" },
  { value: "DORTOIR",           label: "Dortoir" },
];

const inputClass = cn(
  "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white",
  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
);

export default function HebergementForm({
  defaultValues,
  hebergementId,
  initialPhotos = [],
}: HebergementFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  const initialCover = initialPhotos.find((p) => p.estCouverture)?.url ?? "";
  const initialOthers = initialPhotos.filter((p) => !p.estCouverture).map((p) => p.url);

  const [coverUrl, setCoverUrl] = useState(initialCover);
  const [otherUrls, setOtherUrls] = useState<string[]>(initialOthers);

  const isEditing = !!hebergementId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HebergementFormData>({
    resolver: zodResolver(hebergementSchema),
    defaultValues: {
      estActif:     true,
      estEnVedette: false,
      prixBase:     0,
      ordre:        0,
      ...defaultValues,
    },
  });

  async function onSubmit(data: HebergementFormData) {
    setSaving(true);
    setServerError("");

    const url    = isEditing ? `/api/hebergements/${hebergementId}` : "/api/hebergements";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setServerError(body.error ?? "Une erreur est survenue.");
      setSaving(false);
      return;
    }

    const saved = await res.json();
    const id = isEditing ? hebergementId : saved.id;

    // Sauvegarder les photos
    if (id && (coverUrl || otherUrls.length > 0)) {
      await fetch(`/api/hebergements/${id}/photos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cover: coverUrl || null, others: otherUrls }),
      });
    }

    setSaving(false);
    router.push("/admin/hebergements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="space-y-8">

        {/* ── Section : Informations générales ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Informations générales
          </h2>
          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="label-admin">Nom (FR) *</label>
              <input type="text" {...register("nom")} className={inputClass} placeholder="Chambre Double" style={{ minHeight: "48px" }} />
              {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom.message}</p>}
            </div>

            <div>
              <label className="label-admin">Nom (EN) *</label>
              <input type="text" {...register("nomEn")} className={inputClass} placeholder="Double Room" style={{ minHeight: "48px" }} />
              {errors.nomEn && <p className="text-red-500 text-xs mt-1">{errors.nomEn.message}</p>}
            </div>

            <div>
              <label className="label-admin">Type d'hébergement *</label>
              <select {...register("type")} className={cn(inputClass, "cursor-pointer")} style={{ minHeight: "48px" }}>
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-admin">Capacité (personnes) *</label>
              <input type="number" min={1} {...register("capacite", { valueAsNumber: true })} className={inputClass} placeholder="2" style={{ minHeight: "48px" }} />
              {errors.capacite && <p className="text-red-500 text-xs mt-1">{errors.capacite.message}</p>}
            </div>

            <div>
              <label className="label-admin">Prix de base (Ar/nuit) — 0 = sur demande</label>
              <input type="number" min={0} {...register("prixBase", { valueAsNumber: true })} className={inputClass} placeholder="0" style={{ minHeight: "48px" }} />
            </div>

            <div>
              <label className="label-admin">Prix weekend (Ar/nuit) — optionnel</label>
              <input type="number" min={0} {...register("prixWeekend", { valueAsNumber: true })} className={inputClass} placeholder="0" style={{ minHeight: "48px" }} />
            </div>

            <div>
              <label className="label-admin">Superficie (m²) — optionnel</label>
              <input type="number" min={1} {...register("superficie", { valueAsNumber: true })} className={inputClass} placeholder="25" style={{ minHeight: "48px" }} />
            </div>

            <div>
              <label className="label-admin">Ordre d'affichage</label>
              <input type="number" min={0} {...register("ordre", { valueAsNumber: true })} className={inputClass} placeholder="1" style={{ minHeight: "48px" }} />
            </div>

            <div className="md:col-span-2 flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" {...register("estActif")} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-slate-700">Hébergement actif</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" {...register("estEnVedette")} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-slate-700">Mettre en vedette</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Section : Descriptions ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Descriptions
          </h2>
          <div className="space-y-5">
            <div>
              <label className="label-admin">Description (FR) * — min 150 caractères pour le SEO</label>
              <textarea
                rows={5}
                {...register("description")}
                className={cn(inputClass, "resize-none leading-relaxed")}
                placeholder="Description complète en français : ambiance, équipements, vue, ce qui rend cet hébergement unique…"
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div>
              <label className="label-admin">Description (EN) *</label>
              <textarea
                rows={5}
                {...register("descriptionEn")}
                className={cn(inputClass, "resize-none leading-relaxed")}
                placeholder="Complete description in English…"
              />
              {errors.descriptionEn && <p className="text-red-500 text-xs mt-1">{errors.descriptionEn.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Section : Photos ── */}
        <div>
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Photos
          </h2>
          <div className="space-y-6">
            <SingleImageUploader
              value={coverUrl}
              onChange={setCoverUrl}
              folder="rihanala/hebergements"
              label="Photo de couverture"
              hint="Photo principale affichée sur les cartes et en en-tête · Ratio 16:9 recommandé"
            />

            <MultiImageUploader
              values={otherUrls}
              onChange={setOtherUrls}
              folder="rihanala/hebergements"
              label="Galerie de photos"
              max={12}
            />
          </div>

          {!coverUrl && otherUrls.length === 0 && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Ajoutez au minimum 1 photo de couverture avant de publier cet hébergement.
            </p>
          )}
        </div>

      </div>

      {serverError && (
        <p className="mt-4 text-red-500 text-sm text-center">{serverError}</p>
      )}

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-200">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold px-7 py-3 rounded-xl hover:bg-primary-h transition-colors disabled:opacity-60 cursor-pointer text-sm"
          style={{ minHeight: "48px" }}
        >
          {saving ? "Enregistrement…" : isEditing ? "Enregistrer les modifications" : "Créer l'hébergement"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/hebergements")}
          className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors cursor-pointer px-4"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
