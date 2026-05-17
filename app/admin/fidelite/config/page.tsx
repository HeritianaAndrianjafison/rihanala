"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, CheckCircle2, QrCode, Download, Printer } from "lucide-react";
import Link from "next/link";

interface Config {
  estActif:            boolean;
  valeurPoint:         number;
  seuilConversion:     number;
  valeurRecompense:    number;
  seuilMinUtilisation: number;
}

function ar(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

export default function FideliteConfigPage() {
  const [config, setConfig]   = useState<Config | null>(null);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [newCards, setNewCards]     = useState<{ id: string; codeQR: string }[]>([]);
  const [nombre, setNombre]   = useState(1);

  useEffect(() => {
    fetch("/api/fidelite/config")
      .then(r => r.json())
      .then(data => { if (!data.error) setConfig(data); })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/fidelite/config", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleGenerate = async () => {
    setGenLoading(true);
    const res  = await fetch("/api/fidelite/cartes", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ nombre }),
    });
    const data = await res.json();
    setNewCards(data);
    setGenLoading(false);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Simulation
  const depenseExemple = config.valeurPoint * config.seuilConversion;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" aria-hidden="true" />
          Configuration — Programme Fidélité
        </h1>
        <p className="text-slate-500 text-sm mt-1">Paramètres du calcul des points et des récompenses</p>
      </div>

      {/* Formulaire config */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-700">Règles du programme</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-slate-500">Programme actif</span>
            <button
              type="button"
              role="switch"
              aria-checked={config.estActif}
              onClick={() => setConfig(c => c ? { ...c, estActif: !c.estActif } : c)}
              className={`relative w-11 h-6 rounded-full transition-colors ${config.estActif ? "bg-primary" : "bg-slate-300"}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.estActif ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-admin">Valeur du point — montant AR pour 1 point</label>
            <input
              type="number"
              min={1000}
              step={1000}
              value={config.valeurPoint}
              onChange={e => setConfig(c => c ? { ...c, valeurPoint: Number(e.target.value) } : c)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
            />
            <p className="text-xs text-slate-400 mt-1">Dépenser {ar(config.valeurPoint)} = 1 point</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-admin">Seuil de conversion (points)</label>
              <input
                type="number"
                min={1}
                value={config.seuilConversion}
                onChange={e => setConfig(c => c ? { ...c, seuilConversion: Number(e.target.value) } : c)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
              />
            </div>
            <div>
              <label className="label-admin">Valeur récompense (AR)</label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={config.valeurRecompense}
                onChange={e => setConfig(c => c ? { ...c, valeurRecompense: Number(e.target.value) } : c)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <div>
            <label className="label-admin">Seuil minimum pour utiliser la cagnotte (AR)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={config.seuilMinUtilisation}
              onChange={e => setConfig(c => c ? { ...c, seuilMinUtilisation: Number(e.target.value) } : c)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40"
            />
            <p className="text-xs text-slate-400 mt-1">
              Le client doit avoir au moins {ar(config.seuilMinUtilisation)} pour pouvoir utiliser sa cagnotte
            </p>
          </div>
        </div>

        {/* Simulation */}
        <div className="mt-5 bg-primary/5 rounded-xl p-4 border border-primary/10">
          <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Simulation</p>
          <p className="text-sm text-slate-600">
            Un client dépensant <strong>{ar(config.valeurPoint)}</strong> gagne <strong>1 point</strong>.
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Après <strong>{config.seuilConversion} points</strong> (soit <strong>{ar(depenseExemple)}</strong> cumulés),
            il obtient <strong className="text-amber-600">{ar(config.valeurRecompense)}</strong> dans sa cagnotte.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-5 w-full bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-4 h-4" />Enregistré !</>
          ) : (
            <><Save className="w-4 h-4" />Sauvegarder</>
          )}
        </button>
      </form>

      {/* Générateur de cartes QR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="font-semibold text-slate-700">Générer des cartes vierges</h2>
          </div>
          <Link
            href="/admin/fidelite/imprimer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            Imprimer les cartes →
          </Link>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Créez des QR codes à imprimer sur des cartes physiques. Chaque code est unique et sera associé à un client lors du premier scan.
        </p>
        <div className="flex gap-3 mb-4">
          <input
            type="number"
            min={1}
            max={50}
            value={nombre}
            onChange={e => setNombre(Number(e.target.value))}
            className="w-24 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/40 text-center"
          />
          <button
            onClick={handleGenerate}
            disabled={genLoading}
            className="flex-1 bg-primary/8 text-primary border border-primary/15 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            Générer {nombre} carte{nombre > 1 ? "s" : ""}
          </button>
        </div>

        {newCards.length > 0 && (
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-700">{newCards.length} carte(s) générée(s)</p>
              <button
                onClick={() => {
                  const txt = newCards.map(c => c.codeQR).join("\n");
                  const a   = document.createElement("a");
                  a.href    = `data:text/plain;charset=utf-8,${encodeURIComponent(txt)}`;
                  a.download = "cartes-fidelite.txt";
                  a.click();
                }}
                className="text-xs flex items-center gap-1 text-primary hover:underline cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Exporter les codes
              </button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {newCards.map(c => (
                <div key={c.id} className="flex items-center gap-3 text-xs font-mono bg-slate-50 rounded-lg px-3 py-2">
                  <QrCode className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="text-slate-600 truncate">{c.codeQR}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Imprimez ces codes en QR (ex: QRCode Monkey, GoQR.me) et collez-les sur vos cartes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
