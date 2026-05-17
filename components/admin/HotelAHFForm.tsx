"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, MapPin, Phone, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "@/components/ui/SocialIcons";
import { SingleImageUploader, MultiImageUploader } from "@/components/admin/ImageUploader";

interface HotelAHFData {
  id?: string;
  nom?: string;
  slug?: string;
  description?: string;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  siteWeb?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photoCouverture?: string | null;
  photos?: string[];
  estActif?: boolean;
  ordre?: number;
}

interface HotelAHFFormProps {
  initial?: HotelAHFData;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const inputClass =
  "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

export default function HotelAHFForm({ initial }: HotelAHFFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [nom, setNom] = useState(initial?.nom ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [adresse, setAdresse] = useState(initial?.adresse ?? "");
  const [telephone, setTelephone] = useState(initial?.telephone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [siteWeb, setSiteWeb] = useState(initial?.siteWeb ?? "");
  const [facebook, setFacebook] = useState(initial?.facebook ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(initial?.longitude?.toString() ?? "");
  const [photoCouverture, setPhotoCouverture] = useState(initial?.photoCouverture ?? "");
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? [""]);
  const [estActif, setEstActif] = useState(initial?.estActif ?? true);
  const [ordre, setOrdre] = useState(initial?.ordre?.toString() ?? "0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNomChange(value: string) {
    setNom(value);
    if (!isEdit) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      nom,
      slug,
      description,
      adresse:         adresse     || null,
      telephone:       telephone   || null,
      email:           email       || null,
      siteWeb:         siteWeb     || null,
      facebook:        facebook    || null,
      instagram:       instagram   || null,
      latitude:        latitude    ? parseFloat(latitude)  : null,
      longitude:       longitude   ? parseFloat(longitude) : null,
      photoCouverture: photoCouverture || null,
      photos:          photos.filter(Boolean),
      estActif,
      ordre:           parseInt(ordre, 10) || 0,
    };

    try {
      const res = await fetch(
        isEdit ? `/api/ahf/${initial!.id}` : "/api/ahf",
        {
          method:  isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur");
      }
      router.push("/admin/ahf");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Identité ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
          Informations générales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nom de l'hôtel *</label>
            <input
              type="text"
              value={nom}
              onChange={(e) => handleNomChange(e.target.value)}
              required
              placeholder="Hôtel Bord de Mer Foulpointe"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              placeholder="hotel-bord-de-mer"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Ordre d'affichage</label>
            <input
              type="number"
              value={ordre}
              onChange={(e) => setOrdre(e.target.value)}
              min={0}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              placeholder="Décrivez l'hôtel : ambiance, services, points forts..."
              className={inputClass + " resize-none"}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={estActif}
            onClick={() => setEstActif((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
              estActif ? "bg-primary" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                estActif ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-slate-600">
            {estActif ? "Visible sur le site" : "Masqué"}
          </span>
        </div>
      </section>

      {/* ── Coordonnées ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
          <Phone className="w-4 h-4" /> Coordonnées
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+261 34 00 000 00"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <Mail className="inline w-3 h-3 mr-1" />Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@hotel.mg"
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              <MapPin className="inline w-3 h-3 mr-1" />Adresse
            </label>
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="Rue principale, Mahavelona (Foulpointe)"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Réseaux & Web ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
          <Globe className="w-4 h-4" /> Site web & Réseaux sociaux
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>
              <Globe className="inline w-3 h-3 mr-1" />Site web
            </label>
            <input
              type="url"
              value={siteWeb}
              onChange={(e) => setSiteWeb(e.target.value)}
              placeholder="https://www.monhotel.mg"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <FacebookIcon className="inline w-3 h-3 mr-1" />Page Facebook
            </label>
            <input
              type="url"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="https://facebook.com/monhotel"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              <InstagramIcon className="inline w-3 h-3 mr-1" />Instagram
            </label>
            <input
              type="url"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="https://instagram.com/monhotel"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── GPS ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Localisation GPS
        </h2>
        <p className="text-xs text-slate-400">
          Ouvrez Google Maps, faites un clic droit sur le lieu et copiez les coordonnées.
        </p>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Latitude</label>
            <input
              type="number"
              step="0.000001"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="-17.6833"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Longitude</label>
            <input
              type="number"
              step="0.000001"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="49.5167"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ── Photos ── */}
      <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
          Photos
        </h2>

        <SingleImageUploader
          value={photoCouverture}
          onChange={setPhotoCouverture}
          folder="rihanala/ahf"
          label="Photo de couverture"
          hint="Photo principale affichée sur la liste et en haut de la page détail"
        />

        <MultiImageUploader
          values={photos.filter(Boolean)}
          onChange={setPhotos}
          folder="rihanala/ahf"
          label="Galerie photos"
          max={12}
        />
      </section>

      {/* ── Actions ── */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-h transition-colors text-sm disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer l'hôtel"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/ahf")}
          className="text-slate-500 hover:text-slate-700 text-sm transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
