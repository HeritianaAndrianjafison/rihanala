"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Camera, QrCode, ArrowRight, Trophy, Wallet,
  X, Loader2, AlertCircle, TrendingUp, Clock,
  Star, ChevronRight, Sparkles,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FideliteConfig {
  valeurPoint:      number;
  seuilConversion:  number;
  valeurRecompense: number;
}

interface Transaction {
  id:             string;
  montantDepense: number;
  pointsGagnes:   number;
  categorie:      string | null;
  createdAt:      string;
}

interface ClientData {
  prenom:        string;
  nom:           string;
  pointsActuels: number;
  pointsCumules: number;
  cagnotte:      number;
  transactions:  Transaction[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ar(n: number) { return `${Math.round(n).toLocaleString("fr-FR")} Ar`; }
function pct(pts: number, seuil: number) { return Math.min((pts / seuil) * 100, 100); }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function normalize(code: string) { return code.trim().replace(/[\s\-]/g, "").toLowerCase(); }

const CAT_LABEL: Record<string, string> = {
  HEBERGEMENT: "Hébergement",
  RESTAURANT:  "Restaurant",
  ACTIVITE:    "Activité",
  AUTRE:       "Autre",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FidelitePubliquePage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "fr";

  const [code, setCode]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [client, setClient]       = useState<ClientData | null>(null);
  const [config, setConfig]       = useState<FideliteConfig | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);

  const inputRef  = useRef<HTMLInputElement>(null);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraOpen(false);
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const lookup = useCallback(async (rawCode: string) => {
    const c = normalize(rawCode);
    if (!c) return;
    setLoading(true); setError(null); setClient(null);
    try {
      const res  = await fetch(`/api/fidelite/scan/${encodeURIComponent(c)}`);
      const data = await res.json();
      if (!res.ok)      { setError(data.error ?? "Code inconnu"); return; }
      if (data.vierge)  { setError("Cette carte n'est pas encore activée. Présentez-la à l'accueil."); return; }
      if (!data.client) { setError("Aucun profil associé à cette carte."); return; }
      setClient(data.client);
      setConfig(data.config);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraOpen(true); setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) { video.srcObject = stream; await video.play(); }
      const jsQR = (await import("jsqr")).default;
      const tick = () => {
        const v = videoRef.current, c = canvasRef.current;
        if (!v || !c || v.readyState < v.HAVE_ENOUGH_DATA) { rafRef.current = requestAnimationFrame(tick); return; }
        c.width = v.videoWidth; c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }
        ctx.drawImage(v, 0, 0);
        const img = ctx.getImageData(0, 0, c.width, c.height);
        const qr  = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (qr?.data) { stopCamera(); lookup(qr.data); return; }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Impossible d'accéder à la caméra.");
      setCameraOpen(false);
    }
  }, [lookup, stopCamera]);

  const handleReset = () => {
    setClient(null); setConfig(null); setError(null); setCode("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const progress   = client && config ? pct(client.pointsActuels, config.seuilConversion) : 0;
  const circumference = 2 * Math.PI * 54;
  const dashOffset    = circumference - (progress / 100) * circumference;

  return (
    <>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-ring { 0%{opacity:.4;transform:scale(1)} 100%{opacity:0;transform:scale(1.6)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .float { animation: float 6s ease-in-out infinite; }
        .float-slow { animation: float 9s ease-in-out infinite 1.5s; }
        .ring-pulse::before {
          content:""; position:absolute; inset:-8px; border-radius:50%;
          border:2px solid #C8A96E; opacity:.3;
          animation: pulse-ring 2.4s ease-out infinite;
        }
        .progress-bar-shimmer {
          background: linear-gradient(90deg, #2E8B57 0%, #C8A96E 50%, #2E8B57 100%);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div className="min-h-screen" style={{ background: "linear-gradient(160deg,#0b1a11 0%,#0F1F17 55%,#0d1a14 100%)" }}>

        {/* ── Blobs décoratifs ──────────────────────────────────────────────── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="float absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-15"
            style={{ background: "radial-gradient(circle,#1B4D3E,transparent)" }} />
          <div className="float-slow absolute top-1/3 -right-24 w-72 h-72 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle,#C8A96E,transparent)" }} />
          <div className="float absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-8"
            style={{ background: "radial-gradient(circle,#2E8B57,transparent)" }} />
        </div>

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <header className="relative pt-14 pb-10 px-6 text-center">
          <div className="inline-block relative ring-pulse mb-5">
            <div className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ background: "linear-gradient(135deg,#C8A96E,#a8843a)" }}>
              <span className="text-[#0F1F17] font-black text-3xl leading-none select-none">R</span>
            </div>
          </div>
          <h1 className="text-white font-bold text-2xl tracking-wide">Rihanala Village</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Trophy className="w-4 h-4 text-[#C8A96E]" />
            <span className="text-[#C8A96E] text-sm font-semibold tracking-widest uppercase">Programme Fidélité</span>
            <Trophy className="w-4 h-4 text-[#C8A96E]" />
          </div>
          <p className="text-white/30 text-xs mt-2">Foulpointe · Madagascar</p>
        </header>

        {/* ── Alerte erreur ────────────────────────────────────────────────── */}
        {error && (
          <div className="relative mx-4 mb-4 max-w-2xl lg:mx-auto">
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-red-400/25 bg-red-500/10 backdrop-blur-sm">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="text-red-300 text-sm flex-1">{error}</span>
              <button onClick={() => setError(null)} className="cursor-pointer text-red-400/60 hover:text-red-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <main className="relative px-4 pb-16 max-w-4xl mx-auto">

          {/* ══════════════════════════════════════════════════════════════════
              ÉTAT : RÉSULTAT CLIENT
          ══════════════════════════════════════════════════════════════════ */}
          {client && config ? (
            <div className="space-y-5">

              {/* ── Carte principale ──────────────────────────────────────── */}
              <div className="relative rounded-3xl overflow-hidden"
                style={{ background: "linear-gradient(135deg,#1B4D3E 0%,#0d2b1f 100%)", boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}>
                {/* Pattern décoratif */}
                <div className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg,#C8A96E 0,#C8A96E 1px,transparent 0,transparent 50%)",
                    backgroundSize: "16px 16px",
                  }} />
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle,#C8A96E,transparent)", transform: "translate(30%,-30%)" }} />

                <div className="relative p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                    {/* Anneau de progression SVG */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative w-36 h-36">
                        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
                          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
                          <circle
                            cx="60" cy="60" r="54" fill="none"
                            stroke="url(#prog)" strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            style={{ transition: "stroke-dashoffset 1s ease" }}
                          />
                          <defs>
                            <linearGradient id="prog" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%"   stopColor="#2E8B57" />
                              <stop offset="100%" stopColor="#C8A96E" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-white font-black text-3xl leading-none">{client.pointsActuels}</span>
                          <span className="text-white/40 text-xs">points</span>
                        </div>
                      </div>
                      <p className="text-white/40 text-xs mt-2 text-center">
                        {Math.round(progress)}% du palier<br/>({config.seuilConversion} pts)
                      </p>
                    </div>

                    {/* Infos client */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[#C8A96E]/70 text-xs font-semibold uppercase tracking-widest mb-1">Membre fidèle</p>
                      <h2 className="text-white text-3xl font-bold leading-tight mb-1 truncate">
                        {client.prenom} {client.nom}
                      </h2>
                      {/* Barre progression */}
                      <div className="mt-3 mb-4">
                        <div className="w-full bg-white/8 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full progress-bar-shimmer"
                            style={{ width: `${progress}%`, transition: "width 1s ease" }}
                          />
                        </div>
                        <p className="text-white/30 text-xs mt-1">
                          Encore {config.seuilConversion - client.pointsActuels} pts pour convertir en cagnotte
                        </p>
                      </div>

                      {/* Mini stats inline */}
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#C8A96E]/60" />
                          <div>
                            <div className="text-white/40 text-[10px] uppercase tracking-wider">Total cumulé</div>
                            <div className="text-white text-sm font-bold">{client.pointsCumules} pts</div>
                          </div>
                        </div>
                        <div className="w-px bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#C8A96E]/60" />
                          <div>
                            <div className="text-white/40 text-[10px] uppercase tracking-wider">Visites</div>
                            <div className="text-white text-sm font-bold">{client.transactions.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Cagnotte + Stats (2 colonnes desktop) ────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Cagnotte */}
                <div className="relative rounded-2xl overflow-hidden p-5"
                  style={{ background: "linear-gradient(135deg,rgba(200,169,110,.15),rgba(200,169,110,.05))", border: "1px solid rgba(200,169,110,.25)" }}>
                  <div className="absolute top-3 right-3 opacity-10">
                    <Wallet className="w-16 h-16 text-[#C8A96E]" />
                  </div>
                  <p className="text-[#C8A96E]/60 text-xs font-semibold uppercase tracking-widest mb-2">Cagnotte disponible</p>
                  <p className="text-[#C8A96E] text-3xl font-black mb-1">{ar(client.cagnotte)}</p>
                  {client.cagnotte > 0
                    ? <p className="text-[#C8A96E]/50 text-xs">Utilisable sur votre prochain séjour</p>
                    : <p className="text-white/25 text-xs">Continuez à accumuler des points !</p>
                  }
                </div>

                {/* Prochain palier */}
                <div className="relative rounded-2xl overflow-hidden p-5"
                  style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}>
                  <div className="absolute top-3 right-3 opacity-10">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">Prochain palier</p>
                  <p className="text-white text-3xl font-black mb-1">{config.seuilConversion} pts</p>
                  <p className="text-white/30 text-xs">= {ar(config.valeurRecompense)} en cagnotte</p>
                  {client.pointsActuels >= config.seuilConversion && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                      <Star className="w-3 h-3" />
                      Palier atteint !
                    </div>
                  )}
                </div>
              </div>

              {/* ── Historique ───────────────────────────────────────────── */}
              {client.transactions.length > 0 && (
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)" }}>
                  <div className="px-5 py-4 flex items-center gap-2"
                    style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}>
                    <Clock className="w-4 h-4 text-[#C8A96E]/60" />
                    <span className="text-white/50 text-xs font-semibold uppercase tracking-widest flex-1">Dernières visites</span>
                    <span className="text-white/20 text-xs">{client.transactions.length} au total</span>
                  </div>
                  <div>
                    {client.transactions.slice(0, 5).map((tx, i) => (
                      <div key={tx.id}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
                        style={{ borderTop: i > 0 ? "1px solid rgba(255,255,255,.05)" : undefined }}>
                        {/* Icône catégorie */}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(200,169,110,.12)" }}>
                          <span className="text-[#C8A96E] text-xs font-bold">
                            {(CAT_LABEL[tx.categorie ?? ""] ?? "?").charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-sm font-semibold">{ar(tx.montantDepense)}</div>
                          {tx.categorie && (
                            <div className="text-white/30 text-xs">{CAT_LABEL[tx.categorie] ?? tx.categorie}</div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-[#C8A96E] text-sm font-bold">+{tx.pointsGagnes} pts</div>
                          <div className="text-white/25 text-xs">{formatDate(tx.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Actions ──────────────────────────────────────────────── */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-4 rounded-2xl text-white/50 text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
                  style={{ border: "1px solid rgba(255,255,255,.08)" }}
                >
                  Vérifier une autre carte
                </button>
                <a
                  href={`/${locale}/reservation`}
                  className="flex items-center gap-2 px-5 py-4 rounded-2xl text-[#0F1F17] text-sm font-bold shrink-0 hover:brightness-110 transition-all cursor-pointer"
                  style={{ background: "linear-gradient(135deg,#C8A96E,#a8843a)" }}
                >
                  Réserver
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          ) : (

            /* ══════════════════════════════════════════════════════════════
                ÉTAT : FORMULAIRE DE SCAN
            ══════════════════════════════════════════════════════════════ */
            <div className="space-y-5">

              {/* ── Carte principale scan ────────────────────────────────── */}
              <div className="rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg,rgba(27,77,62,.7),rgba(15,31,23,.8))",
                  border: "1px solid rgba(200,169,110,.2)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 40px 100px rgba(0,0,0,.5)",
                }}>
                <div className="p-6 lg:p-8">
                  {/* Icône centrale */}
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                        style={{ background: "rgba(200,169,110,.12)", border: "1px solid rgba(200,169,110,.2)" }}>
                        <QrCode className="w-10 h-10 text-[#C8A96E]" />
                      </div>
                    </div>
                    <h2 className="text-white text-xl font-bold text-center">Consulter mes points</h2>
                    <p className="text-white/40 text-sm mt-1 text-center">Votre carte de fidélité vous attend</p>
                  </div>

                  {/* Input + bouton */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && lookup(code)}
                        placeholder="Numéro de carte…"
                        autoComplete="off"
                        className="flex-1 bg-white/6 border text-white placeholder:text-white/25 rounded-2xl px-5 py-4 text-sm font-mono focus:outline-none transition-all"
                        style={{ borderColor: "rgba(200,169,110,.2)" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(200,169,110,.5)")}
                        onBlur={e  => (e.target.style.borderColor = "rgba(200,169,110,.2)")}
                      />
                      <button
                        onClick={() => lookup(code)}
                        disabled={loading || !code.trim()}
                        className="px-5 py-4 rounded-2xl font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center shrink-0"
                        style={{ background: "linear-gradient(135deg,#C8A96E,#a8843a)", color: "#0F1F17", minWidth: "56px" }}
                      >
                        {loading
                          ? <Loader2 className="w-5 h-5 animate-spin" />
                          : <ArrowRight className="w-5 h-5" />
                        }
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                      <span className="text-white/25 text-xs">ou</span>
                      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,.08)" }} />
                    </div>

                    <button
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white/70 font-semibold text-sm transition-all cursor-pointer hover:text-white"
                      style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)" }}
                    >
                      <Camera className="w-5 h-5" />
                      Scanner par caméra
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Comment ça marche ────────────────────────────────────── */}
              <div className="rounded-3xl overflow-hidden"
                style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)" }}>
                <div className="px-6 py-5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C8A96E]" />
                    <span className="text-[#C8A96E] text-xs font-bold uppercase tracking-widest">Comment ça marche ?</span>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {[
                    { n: "01", title: "Gagnez des points", desc: "Chaque ariary dépensé à l'hôtel vous rapporte des points fidélité" },
                    { n: "02", title: "Atteignez un palier", desc: "Une fois le seuil atteint, vos points se convertissent automatiquement en cagnotte" },
                    { n: "03", title: "Profitez de vos avantages", desc: "Utilisez votre cagnotte pour réduire le montant de vos prochains séjours" },
                  ].map(({ n, title, desc }) => (
                    <div key={n} className="flex gap-4 px-6 py-5">
                      <div className="shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm"
                        style={{ background: "rgba(200,169,110,.12)", color: "#C8A96E" }}>
                        {n}
                      </div>
                      <div>
                        <div className="text-white/80 font-semibold text-sm mb-0.5">{title}</div>
                        <div className="text-white/35 text-xs leading-relaxed">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Bannière réservation ─────────────────────────────────── */}
              <a
                href={`/${locale}/reservation`}
                className="flex items-center justify-between px-6 py-5 rounded-2xl cursor-pointer group hover:brightness-110 transition-all"
                style={{ background: "linear-gradient(135deg,#1B4D3E,#0d2b1f)", border: "1px solid rgba(200,169,110,.15)" }}
              >
                <div>
                  <p className="text-white font-bold text-sm">Prêt à séjourner chez nous ?</p>
                  <p className="text-white/40 text-xs mt-0.5">Réservez et commencez à cumuler des points</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:translate-x-1 transition-transform"
                  style={{ background: "rgba(200,169,110,.15)" }}>
                  <ChevronRight className="w-5 h-5 text-[#C8A96E]" />
                </div>
              </a>
            </div>
          )}
        </main>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="relative text-center px-4 pb-10">
          <a href={`/${locale}`} className="inline-flex items-center gap-1.5 text-white/25 text-xs hover:text-white/50 transition-colors">
            ← Retour au site
          </a>
          <p className="text-white/15 text-xs mt-3">Rihanala Village · La Haute Ville, Foulpointe</p>
          <p className="text-white/12 text-xs mt-1">+261 34 68 084 66</p>
        </footer>

        {/* ── Overlay caméra ───────────────────────────────────────────────── */}
        {cameraOpen && (
          <div className="fixed inset-0 z-50 bg-black/97 flex flex-col items-center justify-center p-6">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 mb-3">
                <Camera className="w-4 h-4 text-[#C8A96E]" />
                <span className="text-white/70 text-sm">Scanner en cours…</span>
              </div>
              <p className="text-white/40 text-xs">Pointez vers le QR code de votre carte</p>
            </div>

            <div className="relative w-full max-w-xs">
              <video ref={videoRef} className="w-full rounded-3xl object-cover" playsInline muted
                style={{ maxHeight: "320px" }} />
              <canvas ref={canvasRef} className="hidden" />
              {/* Viewfinder */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-52 h-52 relative">
                  <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#C8A96E] rounded-tl-lg" />
                  <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#C8A96E] rounded-tr-lg" />
                  <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#C8A96E] rounded-bl-lg" />
                  <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#C8A96E] rounded-br-lg" />
                  {/* Ligne de scan animée */}
                  <div className="absolute left-2 right-2 h-0.5 rounded-full"
                    style={{
                      background: "linear-gradient(90deg,transparent,#C8A96E,transparent)",
                      top: "50%",
                      animation: "float 2s ease-in-out infinite",
                    }} />
                </div>
              </div>
            </div>

            <button
              onClick={stopCamera}
              className="mt-8 flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white/70 text-sm font-semibold transition-colors cursor-pointer hover:bg-white/10"
              style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)" }}
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
          </div>
        )}
      </div>
    </>
  );
}
