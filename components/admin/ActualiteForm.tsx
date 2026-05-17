"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Eye, EyeOff } from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-slate-200 rounded-xl h-[300px] bg-slate-50 animate-pulse" />
  ),
});

interface ActualiteData {
  id?: string;
  slug?: string;
  titre?: string;
  titreEn?: string;
  resume?: string;
  resumeEn?: string;
  contenu?: string;
  contenuEn?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  estPublie?: boolean;
  estEnVedette?: boolean;
  tags?: string[];
  publieLe?: Date;
}

interface ActualiteFormProps {
  initialData?: ActualiteData;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function ActualiteForm({ initialData }: ActualiteFormProps) {
  const router = useRouter();
  const isEdit = !!initialData?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [titre, setTitre] = useState(initialData?.titre ?? "");
  const [titreEn, setTitreEn] = useState(initialData?.titreEn ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [resume, setResume] = useState(initialData?.resume ?? "");
  const [resumeEn, setResumeEn] = useState(initialData?.resumeEn ?? "");
  const [contenu, setContenu] = useState(initialData?.contenu ?? "");
  const [contenuEn, setContenuEn] = useState(initialData?.contenuEn ?? "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "");
  const [imageAlt, setImageAlt] = useState(initialData?.imageAlt ?? "");
  const [estPublie, setEstPublie] = useState(initialData?.estPublie ?? false);
  const [estEnVedette, setEstEnVedette] = useState(initialData?.estEnVedette ?? false);
  const [tagsRaw, setTagsRaw] = useState((initialData?.tags ?? []).join(", "));
  const [activeTab, setActiveTab] = useState<"fr" | "en">("fr");

  useEffect(() => {
    if (!isEdit && titre) setSlug(slugify(titre));
  }, [titre, isEdit]);

  const resumeCount = resume.length;
  const resumeEnCount = resumeEn.length;

  async function handleSave() {
    if (!titre.trim()) { setError("Le titre est requis."); return; }
    if (!slug.trim()) { setError("Le slug est requis."); return; }
    if (!resume.trim()) { setError("Le résumé est requis."); return; }

    setSaving(true);
    setError(null);

    const payload = {
      slug: slug.trim(),
      titre: titre.trim(),
      titreEn: titreEn.trim() || titre.trim(),
      resume: resume.trim(),
      resumeEn: resumeEn.trim() || resume.trim(),
      contenu,
      contenuEn: contenuEn || contenu,
      imageUrl: imageUrl.trim() || null,
      imageAlt: imageAlt.trim() || null,
      estPublie,
      estEnVedette,
      tags: tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    const url = isEdit ? `/api/actualites/${initialData.id}` : "/api/actualites";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de la sauvegarde.");
      return;
    }

    router.push("/admin/actualites");
    router.refresh();
  }

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Statut */}
      <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <button
            type="button"
            onClick={() => setEstPublie((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              estPublie ? "bg-green-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                estPublie ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
            {estPublie ? (
              <><Eye className="w-4 h-4 text-green-600" /> Publié</>
            ) : (
              <><EyeOff className="w-4 h-4 text-slate-400" /> Brouillon</>
            )}
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={estEnVedette}
            onChange={(e) => setEstEnVedette(e.target.checked)}
            className="rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-slate-700">À la une</span>
        </label>
      </div>

      {/* Titre & slug */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <label className="label-admin">Titre (FR) *</label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className={inputClass}
            placeholder="Titre de l'article..."
          />
        </div>
        <div>
          <label className="label-admin">Slug URL *</label>
          <div className="flex gap-2 items-center">
            <span className="text-xs text-slate-400 shrink-0">/fr/actualites/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="label-admin">
            Résumé FR *{" "}
            <span className={resumeCount > 300 ? "text-red-500" : "text-slate-400"}>
              ({resumeCount}/300)
            </span>
          </label>
          <textarea
            rows={3}
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            className={inputClass}
            placeholder="Résumé visible dans la liste et sur Google (max 300 caractères)"
            maxLength={300}
          />
        </div>
      </div>

      {/* Contenu — Tabs FR / EN */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          {(["fr", "en"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "fr" ? "Contenu Français" : "Content English"}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "fr" ? (
            <RichTextEditor value={contenu} onChange={setContenu} />
          ) : (
            <div className="space-y-4">
              <div>
                <label className="label-admin">Titre EN</label>
                <input
                  type="text"
                  value={titreEn}
                  onChange={(e) => setTitreEn(e.target.value)}
                  className={inputClass}
                  placeholder="English title..."
                />
              </div>
              <div>
                <label className="label-admin">
                  Summary EN{" "}
                  <span className={resumeEnCount > 300 ? "text-red-500" : "text-slate-400"}>
                    ({resumeEnCount}/300)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={resumeEn}
                  onChange={(e) => setResumeEn(e.target.value)}
                  className={inputClass}
                  maxLength={300}
                />
              </div>
              <RichTextEditor value={contenuEn} onChange={setContenuEn} />
            </div>
          )}
        </div>
      </div>

      {/* Image & tags */}
      <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
          Image & Tags
        </h3>
        <div>
          <label className="label-admin">URL image de couverture</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className={inputClass}
            placeholder="https://res.cloudinary.com/..."
          />
        </div>
        <div>
          <label className="label-admin">Texte alternatif image</label>
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => setImageAlt(e.target.value)}
            className={inputClass}
            placeholder="Description de l'image pour l'accessibilité et le SEO"
          />
        </div>
        <div>
          <label className="label-admin">Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
            className={inputClass}
            placeholder="Événement, Foulpointe, Famille..."
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary-h transition-colors disabled:opacity-60 text-sm cursor-pointer"
        >
          <Save className="w-4 h-4" />
          {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Publier"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/actualites")}
          className="text-sm text-slate-500 hover:text-slate-700 px-4 py-3 cursor-pointer"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
