"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { QrCode, UserPlus, Users, Settings, Trophy, Wallet, ArrowRight, X, CheckCircle2, AlertCircle, Loader2, Minus, Printer, Camera, Search } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────

interface FideliteConfig {
  valeurPoint: number;
  seuilConversion: number;
  valeurRecompense: number;
  seuilMinUtilisation: number;
}

interface Transaction {
  id: string;
  montantDepense: number;
  pointsGagnes: number;
  categorie: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  pointsActuels: number;
  pointsCumules: number;
  cagnotte: number;
  transactions: Transaction[];
}

interface SearchClient {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string | null;
  cagnotte: number;
  pointsActuels: number;
}

interface ScanResult {
  vierge: boolean;
  carteId?: string;
  client?: Client;
  config: FideliteConfig;
}

type Mode = "scanner" | "profil" | "nouveau" | "transaction_ok" | "cagnotte" | "cagnotte_ok";

// ── Helpers ──────────────────────────────────────────────────────────────────

function ar(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

function progressPct(pts: number, seuil: number) {
  return Math.min(Math.round((pts / seuil) * 100), 100);
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function FideliteScanner() {
  const [mode, setMode]               = useState<Mode>("scanner");
  const [preMode, setPreMode]         = useState<"transaction" | "cagnotte">("transaction");
  const [inputVal, setInputVal]       = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [scanResult, setScanResult]   = useState<ScanResult | null>(null);
  const [txResult, setTxResult]       = useState<{ palierAtteint: boolean; nombreConversions: number; pointsGagnes: number; montantTotalCredite: number; nouveauxPointsActuels: number; nouvelleCagnotte: number } | null>(null);
  const [cagnotteOk, setCagnotteOk]   = useState<{ montantUtilise: number; nouvellesCagnotte: number } | null>(null);
  const [montant, setMontant]         = useState("");
  const [categorie, setCategorie]     = useState("RESTAURANT");
  const [montantCagnotte, setMontantCagnotte] = useState("");
  const [newClient, setNewClient]     = useState({ prenom: "", nom: "", telephone: "", email: "" });
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState<SearchClient[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef    = useRef<HTMLInputElement>(null);
  const montantRef  = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen]   = useState(false);
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const streamRef  = useRef<MediaStream | null>(null);
  const rafRef     = useRef<number | null>(null);

  // Autofocus sur le champ scan au mode scanner
  useEffect(() => {
    if (mode === "scanner") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode]);

  const reset = useCallback(() => {
    setMode("scanner");
    setInputVal("");
    setError(null);
    setScanResult(null);
    setTxResult(null);
    setMontant("");
    setMontantCagnotte("");
    setCagnotteOk(null);
    setSearchQuery("");
    setSearchResults([]);
    setNewClient({ prenom: "", nom: "", telephone: "", email: "" });
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current)    { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    setCameraOpen(false);
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  // ── Scan QR ───────────────────────────────────────────────────────────────

  const handleScan = useCallback(async (code: string) => {
    if (!code.trim()) return;
    // Strip spaces/hyphens and lowercase so typed card numbers match DB values
    const normalized = code.trim().replace(/[\s\-]/g, "").toLowerCase();
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/fidelite/scan/${encodeURIComponent(normalized)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "QR Code inconnu"); return; }
      setScanResult(data);
      if (data.client) {
        setNewClient(c => ({ ...c, telephone: data.client.telephone }));
      }
      if (data.vierge) {
        setMode("nouveau");
      } else if (preMode === "cagnotte") {
        if ((data.client?.cagnotte ?? 0) <= 0) {
          setError("Ce client n'a pas de cagnotte disponible.");
          return;
        }
        setMode("cagnotte");
      } else {
        setMode("profil");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleScan(inputVal);
  };

  const startCamera = useCallback(async () => {
    setCameraOpen(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) { video.srcObject = stream; await video.play(); }
      const jsQR = (await import("jsqr")).default;
      const tick = () => {
        const v = videoRef.current;
        const c = canvasRef.current;
        if (!v || !c || v.readyState < v.HAVE_ENOUGH_DATA) {
          rafRef.current = requestAnimationFrame(tick); return;
        }
        c.width = v.videoWidth; c.height = v.videoHeight;
        const ctx = c.getContext("2d");
        if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }
        ctx.drawImage(v, 0, 0);
        const img  = ctx.getImageData(0, 0, c.width, c.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
        if (code?.data) { stopCamera(); handleScan(code.data); return; }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
      setCameraOpen(false);
    }
  }, [handleScan, stopCamera]);

  // ── Recherche client ──────────────────────────────────────────────────────

  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/fidelite/clients?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data) ? data.slice(0, 8) : []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSelectClient = async (id: string) => {
    setLoading(true);
    setError(null);
    setSearchQuery("");
    setSearchResults([]);
    try {
      const [clientRes, configRes] = await Promise.all([
        fetch(`/api/fidelite/clients/${id}`),
        fetch("/api/fidelite/config"),
      ]);
      const client = await clientRes.json();
      const config = await configRes.json();
      if (!clientRes.ok) { setError(client.error ?? "Client introuvable"); return; }
      if (!configRes.ok) { setError("Erreur config"); return; }
      setScanResult({ vierge: false, client, config });
      if (preMode === "cagnotte") {
        if ((client.cagnotte ?? 0) <= 0) { setError("Ce client n'a pas de cagnotte disponible"); return; }
        setMode("cagnotte");
      } else {
        setMode("profil");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ── Créer client ──────────────────────────────────────────────────────────

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/fidelite/clients", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...newClient, carteId: scanResult?.carteId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur création"); return; }
      // Recharger le profil
      const profileRes  = await fetch(`/api/fidelite/clients/${data.id}`);
      const profile     = await profileRes.json();
      const config      = scanResult!.config;
      setScanResult({ vierge: false, client: profile, config });
      setMode("profil");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ── Enregistrer dépense ───────────────────────────────────────────────────

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montant.replace(/\s/g, "").replace(",", "."));
    if (isNaN(val) || val <= 0) { setError("Montant invalide"); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/fidelite/transactions", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clientId: scanResult!.client!.id, montantDepense: val, categorie }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); return; }
      setTxResult(data);
      setMode("transaction_ok");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  // ── Utiliser cagnotte ─────────────────────────────────────────────────────

  const handleCagnotte = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montantCagnotte.replace(/\s/g, "").replace(",", "."));
    if (isNaN(val) || val <= 0) { setError("Montant invalide"); return; }
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/fidelite/cagnotte/utiliser", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ clientId: scanResult!.client!.id, montantAUtiliser: val }),
      });
      const data = await res.json();
      if (!res.ok) { setError(typeof data.error === "string" ? data.error : "Solde insuffisant"); return; }
      setCagnotteOk({ montantUtilise: val, nouvellesCagnotte: data.nouvelleCagnotte });
      setScanResult(prev => prev && prev.client
        ? { ...prev, client: { ...prev.client, cagnotte: data.nouvelleCagnotte } }
        : prev
      );
      setMontantCagnotte("");
      setMode("cagnotte_ok");
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const config = scanResult?.config;
  const client = scanResult?.client;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDU
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" aria-hidden="true" />
            Programme Fidélité
          </h1>
          <p className="text-slate-500 text-sm mt-1">Scanner de carte client</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/fidelite/clients"
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <Users className="w-4 h-4" aria-hidden="true" />
            Membres
          </Link>
          <Link href="/admin/fidelite/imprimer"
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" aria-hidden="true" />
            Cartes
          </Link>
          <Link href="/admin/fidelite/config"
            className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
            <Settings className="w-4 h-4" aria-hidden="true" />
            Config
          </Link>
        </div>
      </div>

      {/* Erreur globale */}
      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── MODE SCANNER ─────────────────────────────────────────────────── */}
      {mode === "scanner" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-20 h-20 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-10 h-10 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Scanner une carte</h2>

          {/* Mode selector */}
          <div className="flex gap-3 mb-5">
            <button
              onClick={() => setPreMode("transaction")}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer",
                preMode === "transaction"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
              Enregistrer une dépense
            </button>
            <button
              onClick={() => setPreMode("cagnotte")}
              className={cn(
                "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer",
                preMode === "cagnotte"
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <Wallet className="w-5 h-5" aria-hidden="true" />
              Utiliser la cagnotte
            </button>
          </div>

          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Code QR ou numéro de carte…"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              autoComplete="off"
            />
            <button
              onClick={() => handleScan(inputVal)}
              disabled={loading || !inputVal.trim()}
              className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={startCamera}
            className="mt-3 w-full flex items-center justify-center gap-2 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
            Scanner par caméra
          </button>
          <p className="text-xs text-slate-400 mt-3">
            Lecteur USB : scan automatique · Sans QR : tapez le numéro imprimé sur la carte
          </p>

          {/* Séparateur */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 font-medium">ou rechercher un client</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Recherche client */}
          <div className="mt-3 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" aria-hidden="true" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Nom, prénom, téléphone, email…"
              className="w-full border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              autoComplete="off"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" aria-hidden="true" />
            )}
          </div>

          {/* Résultats */}
          {searchResults.length > 0 && (
            <div className="mt-1.5 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              {searchResults.map(c => (
                <button
                  key={c.id}
                  onClick={() => handleSelectClient(c.id)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-b border-slate-100 last:border-0 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-xs">{c.prenom[0]}{c.nom[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{c.prenom} {c.nom}</p>
                    <p className="text-xs text-slate-400">{c.telephone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    {c.cagnotte > 0 && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        {ar(c.cagnotte)} Ar
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{c.pointsActuels} pts</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
            <p className="text-center text-sm text-slate-400 mt-3">Aucun client trouvé pour « {searchQuery} »</p>
          )}
        </div>
      )}

      {/* ── MODE PROFIL ──────────────────────────────────────────────────── */}
      {mode === "profil" && client && config && (
        <div className="space-y-4">
          {/* Carte profil */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {client.prenom} {client.nom}
                </h2>
                <p className="text-slate-500 text-sm">{client.telephone}</p>
              </div>
              <button onClick={reset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Soldes */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-primary/5 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-medium">Points</div>
                <div className="text-3xl font-bold text-primary font-display leading-none mb-2">
                  {client.pointsActuels}
                  <span className="text-base font-normal text-slate-400 ml-1">/ {config.seuilConversion}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all"
                    style={{ width: `${progressPct(client.pointsActuels, config.seuilConversion)}%` }}
                  />
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-medium">Cagnotte</div>
                <div className="text-2xl font-bold text-amber-600 font-display leading-none mb-1">
                  {ar(client.cagnotte)}
                </div>
                <div className={cn("text-xs", client.cagnotte >= config.seuilMinUtilisation ? "text-emerald-600" : "text-slate-400")}>
                  {client.cagnotte >= config.seuilMinUtilisation ? "✓ Utilisable" : `Min. ${ar(config.seuilMinUtilisation)}`}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => { setError(null); setTimeout(() => montantRef.current?.focus(), 50); }}
                className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Enregistrer une dépense
              </button>
              <button
                onClick={() => { setMode("cagnotte"); setError(null); }}
                disabled={client.cagnotte <= 0}
                className="flex items-center gap-2 border border-amber-300 text-amber-700 py-3 px-4 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                {ar(client.cagnotte)}
              </button>
            </div>
          </div>

          {/* Formulaire dépense */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-widest">
              Enregistrer une dépense
            </h3>
            <form onSubmit={handleTransaction} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-admin">Montant (AR) *</label>
                  <input
                    ref={montantRef}
                    type="text"
                    inputMode="numeric"
                    value={montant}
                    onChange={e => setMontant(e.target.value)}
                    placeholder="Ex: 120 000"
                    required
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                  />
                  {montant && !isNaN(parseFloat(montant.replace(/\s/g, ""))) && (
                    <p className="text-xs text-primary mt-1">
                      → +{Math.floor(parseFloat(montant.replace(/\s/g, "")) / config.valeurPoint)} point(s)
                    </p>
                  )}
                </div>
                <div>
                  <label className="label-admin">Catégorie</label>
                  <select
                    value={categorie}
                    onChange={e => setCategorie(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 cursor-pointer"
                  >
                    <option value="HEBERGEMENT">Hébergement</option>
                    <option value="RESTAURANT">Restaurant</option>
                    <option value="ACTIVITE">Activité</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Valider la dépense
              </button>
            </form>
          </div>

          {/* Historique */}
          {client.transactions.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-widest">
                Dernières transactions
              </h3>
              <div className="space-y-2">
                {client.transactions.slice(0, 5).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between text-sm py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <span className="text-slate-700 font-medium">{ar(tx.montantDepense)}</span>
                      {tx.categorie && <span className="text-slate-400 ml-2 text-xs">{tx.categorie}</span>}
                    </div>
                    <span className="text-primary font-semibold">+{tx.pointsGagnes} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODE CAGNOTTE ─────────────────────────────────────────────────── */}
      {mode === "cagnotte" && client && config && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-800">Utiliser la cagnotte</h2>
              <p className="text-sm text-slate-500 mt-0.5">{client.prenom} {client.nom}</p>
            </div>
            <button onClick={reset} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 mb-5">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-1">Solde disponible</p>
            <p className="text-4xl font-bold text-amber-600 font-display">{ar(client.cagnotte)}</p>
          </div>
          <form onSubmit={handleCagnotte} className="space-y-4">
            <div>
              <label className="label-admin">Montant à déduire (AR) *</label>
              <input
                type="text"
                inputMode="numeric"
                value={montantCagnotte}
                onChange={e => setMontantCagnotte(e.target.value)}
                placeholder={`Max. ${ar(client.cagnotte)}`}
                required
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/40"
              />
              {montantCagnotte && !isNaN(parseFloat(montantCagnotte.replace(/\s/g, ""))) && (
                <p className="text-xs text-slate-500 mt-1">
                  Solde après : {ar(client.cagnotte - parseFloat(montantCagnotte.replace(/\s/g, "")))}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode("profil")}
                className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl text-sm font-semibold hover:bg-amber-600 cursor-pointer transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                Confirmer le paiement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODE INSCRIPTION NOUVEAU CLIENT ──────────────────────────────── */}
      {mode === "nouveau" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-600" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Nouvelle carte vierge</h2>
              <p className="text-xs text-slate-500">Enregistrer le titulaire de cette carte</p>
            </div>
          </div>
          <form onSubmit={handleCreateClient} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label-admin">Prénom *</label>
                <input required value={newClient.prenom}
                  onChange={e => setNewClient(c => ({ ...c, prenom: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                  placeholder="Jean-Pierre" autoFocus />
              </div>
              <div>
                <label className="label-admin">Nom *</label>
                <input required value={newClient.nom}
                  onChange={e => setNewClient(c => ({ ...c, nom: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                  placeholder="Rakoto" />
              </div>
            </div>
            <div>
              <label className="label-admin">Téléphone *</label>
              <input required type="tel" value={newClient.telephone}
                onChange={e => setNewClient(c => ({ ...c, telephone: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                placeholder="+261 34 XX XXX XX" />
            </div>
            <div>
              <label className="label-admin">Email (optionnel)</label>
              <input type="email" value={newClient.email}
                onChange={e => setNewClient(c => ({ ...c, email: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
                placeholder="jean@exemple.mg" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={reset}
                className="flex-1 border border-slate-200 text-slate-600 py-3 rounded-xl text-sm font-semibold hover:bg-slate-50 cursor-pointer">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                Créer le compte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODE CAGNOTTE OK ─────────────────────────────────────────────── */}
      {mode === "cagnotte_ok" && cagnotteOk && client && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-2" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-white mb-1">Cagnotte utilisée</h2>
            <p className="text-amber-100 text-sm">{client.prenom} {client.nom}</p>
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Montant déduit</span>
              <span className="font-semibold text-red-500">−{ar(cagnotteOk.montantUtilise)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
              <span className="text-slate-500">Solde restant</span>
              <span className="font-bold text-amber-600 text-lg">{ar(cagnotteOk.nouvellesCagnotte)}</span>
            </div>
            <button
              onClick={reset}
              className="w-full mt-2 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h cursor-pointer transition-colors"
            >
              Scanner une nouvelle carte
            </button>
          </div>
        </div>
      )}

      {/* ── OVERLAY CAMÉRA ───────────────────────────────────────────────── */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <p className="text-white/70 text-sm mb-4">Pointez la caméra vers le QR code</p>
          <div className="relative w-full max-w-xs">
            <video ref={videoRef} className="w-full rounded-2xl object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            {/* Viewfinder */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 relative">
                <span className="absolute top-0 left-0 w-7 h-7 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <span className="absolute top-0 right-0 w-7 h-7 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <span className="absolute bottom-0 left-0 w-7 h-7 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <span className="absolute bottom-0 right-0 w-7 h-7 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>
          </div>
          <button
            onClick={stopCamera}
            className="mt-6 flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>
      )}

      {/* ── MODE TRANSACTION OK (palier) ──────────────────────────────────── */}
      {mode === "transaction_ok" && txResult && client && config && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {txResult.palierAtteint ? (
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 p-8 text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-1">Palier atteint !</h2>
              <p className="text-amber-100 text-sm">
                {txResult.nombreConversions > 1
                  ? `${txResult.nombreConversions} paliers convertis`
                  : "Félicitations"}
              </p>
              <div className="mt-4 bg-white/20 rounded-2xl p-4">
                <div className="text-4xl font-bold font-display text-white">
                  +{ar(txResult.montantTotalCredite)}
                </div>
                <div className="text-amber-100 text-sm mt-1">ajoutés à la cagnotte</div>
              </div>
            </div>
          ) : (
            <div className="bg-primary p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-2" aria-hidden="true" />
              <h2 className="text-xl font-bold text-white">Dépense enregistrée</h2>
            </div>
          )}
          <div className="p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Points acquis</span>
              <span className="font-semibold text-primary">+{txResult.pointsGagnes} pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Points actuels</span>
              <span className="font-semibold">{txResult.nouveauxPointsActuels} / {config.seuilConversion}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${progressPct(txResult.nouveauxPointsActuels, config.seuilConversion)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm pt-1">
              <span className="text-slate-500">Cagnotte disponible</span>
              <span className="font-semibold text-amber-600">{ar(txResult.nouvelleCagnotte)}</span>
            </div>
            <button
              onClick={reset}
              className="w-full mt-2 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h cursor-pointer transition-colors"
            >
              Scanner une nouvelle carte
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
