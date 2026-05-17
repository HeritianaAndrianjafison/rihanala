"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Ticket, Plus, Printer, ScanLine, Check, X, RefreshCw, Filter } from "lucide-react";

interface CarteReduction {
  id:              string;
  code:            string;
  pourcentage:     number;
  estUtilise:      boolean;
  utiliseAt:       string | null;
  montantOriginal: number | null;
  montantFinal:    number | null;
  note:            string | null;
  createdAt:       string;
}

function formatCode(code: string): string {
  return code.toUpperCase().match(/.{1,4}/g)?.join("-") ?? code.toUpperCase();
}

function ar(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

type FilterType = "all" | "used" | "unused";

export default function ReductionsPage() {
  const [cartes, setCartes]         = useState<CarteReduction[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<FilterType>("all");
  const [filterPct, setFilterPct]   = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [nombre, setNombre]         = useState(10);
  const [pourcentage, setPourcentage] = useState(10);
  const [noteGen, setNoteGen]       = useState("");
  const [genError, setGenError]     = useState("");

  const fetchCartes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "used")   params.set("estUtilise", "true");
    if (filter === "unused") params.set("estUtilise", "false");
    if (filterPct)           params.set("pourcentage", filterPct);
    const res = await fetch(`/api/reductions?${params}`);
    const data = await res.json().catch(() => []);
    setCartes(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter, filterPct]);

  useEffect(() => { fetchCartes(); }, [fetchCartes]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setGenerating(true);
    setGenError("");
    const res = await fetch("/api/reductions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, pourcentage, note: noteGen || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setGenError(typeof data.error === "string" ? data.error : "Erreur lors de la génération");
    } else {
      await fetchCartes();
    }
    setGenerating(false);
  }

  const displayed = cartes;
  const unusedCount = cartes.filter((c) => !c.estUtilise).length;
  const usedCount = cartes.filter((c) => c.estUtilise).length;

  function handlePrint() {
    window.print();
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        @media print {
          .carte-print {
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div className="space-y-8 no-print">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-primary" />
              Cartes de réduction
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Générez et gérez les cartes à usage unique
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/reductions/verifier"
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              Vérifier un code
            </Link>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimer les cartes
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total", value: cartes.length, color: "text-slate-900" },
            { label: "Disponibles", value: unusedCount, color: "text-green-700" },
            { label: "Utilisées", value: usedCount, color: "text-slate-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className={`text-3xl font-bold ${color}`}>{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Generator form */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Générer des cartes
          </h2>
          <form onSubmit={handleGenerate} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="number"
                min={1}
                max={500}
                value={nombre}
                onChange={(e) => setNombre(parseInt(e.target.value) || 1)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Réduction (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                step={0.5}
                value={pourcentage}
                onChange={(e) => setPourcentage(parseFloat(e.target.value) || 1)}
                className="w-28 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-slate-600 mb-1">Note (optionnel)</label>
              <input
                type="text"
                placeholder="ex: Promo juillet 2026"
                value={noteGen}
                onChange={(e) => setNoteGen(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Générer {nombre} carte{nombre > 1 ? "s" : ""}
            </button>
          </form>
          {genError && <p className="mt-2 text-red-600 text-sm">{genError}</p>}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(["all", "unused", "used"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "all" ? "Toutes" : f === "unused" ? "Disponibles" : "Utilisées"}
            </button>
          ))}
          <div className="ml-auto">
            <input
              type="number"
              placeholder="Filtrer par %"
              value={filterPct}
              onChange={(e) => setFilterPct(e.target.value)}
              className="w-32 px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-sm">Chargement…</div>
          ) : displayed.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-sm">Aucune carte</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Réduction</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Statut</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Montant original</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Montant final</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Note</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Créée le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {displayed.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono font-bold text-primary tracking-wider">
                      {formatCode(c.code)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        -{c.pourcentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.estUtilise ? (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <X className="w-3.5 h-3.5" /> Utilisée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                          <Check className="w-3.5 h-3.5" /> Disponible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {c.montantOriginal != null ? ar(c.montantOriginal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      {c.montantFinal != null ? ar(c.montantFinal) : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-40 truncate">
                      {c.note ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Print zone */}
      <div id="print-zone" className="hidden print:block">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
            padding: "20px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          {cartes.filter((c) => !c.estUtilise).map((c) => (
            <div
              key={c.id}
              className="carte-print"
              style={{
                border: "2px solid #1B4D3E",
                borderRadius: "12px",
                padding: "16px",
                background: "white",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", color: "#666", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
                Rihanala Village
              </div>
              <div style={{ fontSize: "22px", fontWeight: "bold", color: "#C8A96E", marginBottom: "4px" }}>
                -{c.pourcentage}%
              </div>
              <div style={{ fontSize: "8px", color: "#888", marginBottom: "8px" }}>
                de réduction sur votre séjour
              </div>
              <div style={{ fontSize: "12px", fontWeight: "bold", color: "#1B4D3E", fontFamily: "Courier, monospace", letterSpacing: "0.15em", background: "#f4f8f4", borderRadius: "6px", padding: "6px 8px" }}>
                {formatCode(c.code)}
              </div>
              {c.note && (
                <div style={{ fontSize: "7px", color: "#aaa", marginTop: "6px" }}>{c.note}</div>
              )}
              <div style={{ fontSize: "7px", color: "#ccc", marginTop: "4px" }}>
                Usage unique · Non cumulable
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
