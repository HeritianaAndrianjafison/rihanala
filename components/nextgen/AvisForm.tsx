"use client";

import { useState } from "react";
import { Star, Send, CheckCircle2 } from "lucide-react";

const STAR_PATH = "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z";

interface FormState {
  auteurNom: string;
  auteurPays: string;
  note: number;
  commentaire: string;
}

const INITIAL: FormState = { auteurNom: "", auteurPays: "Madagascar", note: 5, commentaire: "" };

export default function AvisForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string | number) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.auteurNom.trim()) return setError("Veuillez entrer votre nom.");
    if (!form.commentaire.trim() || form.commentaire.length < 10)
      return setError("Le commentaire doit faire au moins 10 caractères.");

    setLoading(true);
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setForm(INITIAL);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mt-14 max-w-xl mx-auto text-center">
        <div className="lg-card rounded-2xl p-8 flex flex-col items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-gold" />
          <h3 className="font-display text-xl text-white">Merci pour votre avis !</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Votre avis a été soumis et sera publié après validation par notre équipe.
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-gold text-sm underline underline-offset-4 cursor-pointer"
          >
            Laisser un autre avis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-14 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <span className="text-gold text-[11px] tracking-[0.3em] uppercase font-medium">
          Votre expérience
        </span>
        <h3 className="font-display text-2xl font-light text-white mt-1">
          Laissez un avis
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="lg-card rounded-2xl p-6 space-y-5">
        {/* Note étoiles */}
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">
            Votre note *
          </label>
          <div
            className="flex gap-1"
            onMouseLeave={() => setHovered(0)}
            role="group"
            aria-label="Note de 1 à 5 étoiles"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => set("note", star)}
                onMouseEnter={() => setHovered(star)}
                className="cursor-pointer transition-transform hover:scale-110"
                aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
              >
                <svg
                  className={`w-8 h-8 transition-colors ${
                    star <= (hovered || form.note) ? "text-gold" : "text-white/20"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={STAR_PATH} />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Nom */}
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">
            Nom *
          </label>
          <input
            type="text"
            value={form.auteurNom}
            onChange={(e) => set("auteurNom", e.target.value)}
            placeholder="Votre nom"
            maxLength={80}
            className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        {/* Pays / Ville */}
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">
            Ville / Pays
          </label>
          <input
            type="text"
            value={form.auteurPays}
            onChange={(e) => set("auteurPays", e.target.value)}
            placeholder="Madagascar"
            maxLength={80}
            className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">
            Commentaire * <span className="normal-case text-white/30">({form.commentaire.length}/1000)</span>
          </label>
          <textarea
            value={form.commentaire}
            onChange={(e) => set("commentaire", e.target.value)}
            placeholder="Partagez votre expérience à Rihanala Village..."
            rows={4}
            maxLength={1000}
            className="w-full bg-white/8 border border-white/12 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-gold/50 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gold text-dark font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          style={{ minHeight: "50px" }}
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" aria-hidden="true" />
              Soumettre mon avis
            </>
          )}
        </button>

        <p className="text-white/25 text-xs text-center">
          Votre avis sera publié après validation par notre équipe.
        </p>
      </form>
    </div>
  );
}
