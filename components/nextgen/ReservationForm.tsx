"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";

const schema = z.object({
  prenom: z.string().min(2),
  nom: z.string().min(2),
  email: z.string().email(),
  telephone: z.string().min(6),
  hebergementId: z.string().min(1),
  dateArrivee: z.string().min(1),
  dateDepart: z.string().min(1),
  nbAdultes: z.number().int().min(1).max(100),
  nbEnfants: z.number().int().min(0).max(50),
  messageSpecial: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface HebergementOption {
  id: string;
  nom: string;
  nomEn: string;
  capacite: number;
  type: string;
}

interface ReservationFormProps {
  hebergements: HebergementOption[];
  locale: string;
}

export default function ReservationForm({ hebergements, locale }: ReservationFormProps) {
  const isEn = locale === "en";
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError(
        isEn
          ? "An error occurred. Please try again or contact us by WhatsApp."
          : "Une erreur est survenue. Réessayez ou contactez-nous via WhatsApp."
      );
    } finally {
      setSending(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
        <h2 className="font-accent text-2xl text-primary">
          {isEn ? "Request sent!" : "Demande envoyée !"}
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          {isEn
            ? "Our team will contact you within 24 hours to confirm your booking."
            : "Notre équipe vous contacte sous 24h pour confirmer votre réservation."}
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const labelClass = "label-admin";
  const errClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Hébergement */}
      <div>
        <label className={labelClass}>
          {isEn ? "Accommodation *" : "Hébergement *"}
        </label>
        <select className={inputClass} {...register("hebergementId")}>
          <option value="">-- {isEn ? "Select" : "Sélectionnez"} --</option>
          {hebergements.map((h) => (
            <option key={h.id} value={h.id}>
              {isEn ? h.nomEn : h.nom} ({isEn ? "up to" : "jusqu'à"} {h.capacite}{" "}
              {isEn ? "persons" : "personnes"})
            </option>
          ))}
        </select>
        {errors.hebergementId && <p className={errClass}>{isEn ? "Required" : "Requis"}</p>}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            {isEn ? "Arrival date *" : "Date d'arrivée *"}
          </label>
          <input type="date" className={inputClass} {...register("dateArrivee")} />
          {errors.dateArrivee && <p className={errClass}>{isEn ? "Required" : "Requis"}</p>}
        </div>
        <div>
          <label className={labelClass}>
            {isEn ? "Departure date *" : "Date de départ *"}
          </label>
          <input type="date" className={inputClass} {...register("dateDepart")} />
          {errors.dateDepart && <p className={errClass}>{isEn ? "Required" : "Requis"}</p>}
        </div>
      </div>

      {/* Personnes */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{isEn ? "Adults *" : "Adultes *"}</label>
          <input
            type="number"
            min={1}
            className={inputClass}
            {...register("nbAdultes", { valueAsNumber: true })}
            defaultValue={2}
          />
        </div>
        <div>
          <label className={labelClass}>{isEn ? "Children" : "Enfants"}</label>
          <input
            type="number"
            min={0}
            className={inputClass}
            {...register("nbEnfants", { valueAsNumber: true })}
            defaultValue={0}
          />
        </div>
      </div>

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{isEn ? "First name *" : "Prénom *"}</label>
          <input type="text" className={inputClass} {...register("prenom")} />
          {errors.prenom && <p className={errClass}>{isEn ? "Required (min 2 chars)" : "Requis (min 2 caractères)"}</p>}
        </div>
        <div>
          <label className={labelClass}>{isEn ? "Last name *" : "Nom *"}</label>
          <input type="text" className={inputClass} {...register("nom")} />
          {errors.nom && <p className={errClass}>{isEn ? "Required" : "Requis"}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email *</label>
          <input type="email" className={inputClass} {...register("email")} />
          {errors.email && <p className={errClass}>{isEn ? "Valid email required" : "Email valide requis"}</p>}
        </div>
        <div>
          <label className={labelClass}>{isEn ? "Phone *" : "Téléphone *"}</label>
          <input type="tel" className={inputClass} {...register("telephone")} />
          {errors.telephone && <p className={errClass}>{isEn ? "Required" : "Requis"}</p>}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className={labelClass}>
          {isEn ? "Special requests" : "Demandes particulières"}
        </label>
        <textarea
          rows={4}
          className={inputClass}
          placeholder={
            isEn
              ? "Dietary requirements, accessibility needs, programme..."
              : "Régimes alimentaires, accessibilité, programme de séjour..."
          }
          {...register("messageSpecial")}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="flex items-center justify-center gap-2 w-full bg-primary text-white font-semibold py-4 rounded-xl hover:bg-primary-h transition-colors disabled:opacity-60 text-sm cursor-pointer"
      >
        <Send className="w-4 h-4" />
        {sending
          ? isEn ? "Sending..." : "Envoi en cours..."
          : isEn ? "Send my request" : "Envoyer ma demande"}
      </button>

      <p className="text-xs text-center text-slate-400">
        {isEn
          ? "Free · No commitment · Your data is used only to process your request."
          : "Gratuit · Sans engagement · Vos données sont utilisées uniquement pour traiter votre demande."}
      </p>
    </form>
  );
}
