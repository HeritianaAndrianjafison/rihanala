"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Loader2, QrCode, RefreshCw } from "lucide-react";
import Link from "next/link";

interface Carte {
  id: string;
  codeQR: string;
  qrDataUrl: string;
}

// ── Layout constants (ISO ID-1 + A4 math) ─────────────────────────────────
// Card: 85.6mm × 54mm
// A4: 210mm × 297mm
// Grid: 2 col × 85.6 + 5mm gap = 176.2mm  → side padding: (210-176.2)/2 = 16.9mm
// Rows: 5 × 54mm + 4 × 2mm gap = 278mm
// Page: 5mm (top) + 7mm (header) + 2mm (gap) + 278mm (grid) + 5mm (bot) = 297mm ✓
const CARDS_PER_PAGE = 10;
const SCREEN_SCALE   = 0.72; // A4 at 96dpi = 793px; × 0.72 = 571px (fits admin panel)

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

// ── Page component ─────────────────────────────────────────────────────────
export default function ImprimerCartesPage() {
  const [cartes, setCartes]         = useState<Carte[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [nombre, setNombre]         = useState(10);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());
  const pagesRef = useRef<(HTMLDivElement | null)[]>([]);

  const formatCode = (code: string) =>
    code.toUpperCase().match(/.{1,5}/g)?.join(" ") ?? code.toUpperCase();

  const toDataUrl = async (code: string): Promise<string> => {
    const QRCode = (await import("qrcode")).default;
    return QRCode.toDataURL(code, {
      width: 400,
      margin: 1,
      color: { dark: "#1B4D3E", light: "#FFFFFF" },
    });
  };

  const enrich = async (raw: { id: string; codeQR: string }[]): Promise<Carte[]> =>
    Promise.all(raw.map(async c => ({ ...c, qrDataUrl: await toDataUrl(c.codeQR) })));

  const loadCartes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch("/api/fidelite/cartes");
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const enriched = await enrich(data);
      setCartes(enriched);
      setSelected(new Set(enriched.map((c: Carte) => c.id)));
    } catch {
      setError("Impossible de charger les cartes");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadCartes(); }, [loadCartes]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res  = await fetch("/api/fidelite/cartes", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      const enriched = await enrich(data);
      setCartes(prev => [...prev, ...enriched]);
      setSelected(prev => new Set([...prev, ...enriched.map((c: Carte) => c.id)]));
    } catch {
      setError("Erreur lors de la génération");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── PDF generation via html2canvas (captures exactly what's on screen) ──
  const handleDownloadPDF = async () => {
    if (printCartes.length === 0) return;
    setDownloading(true);
    setError(null);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF }   = await import("jspdf");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      for (let i = 0; i < pagesRef.current.length; i++) {
        const el = pagesRef.current[i];
        if (!el) continue;

        // Capture the A4 div at its natural (un-scaled) size
        const canvas = await html2canvas(el, {
          scale: 2,           // 2× for crisp text and QR codes
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width:  el.offsetWidth,
          height: el.offsetHeight,
        });

        if (i > 0) pdf.addPage("a4", "portrait");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, 210, 297);
      }

      pdf.save(`cartes-fidelite-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch {
      setError("Erreur lors de la génération du PDF. Réessayez.");
    } finally {
      setDownloading(false);
    }
  };

  const printCartes = cartes.filter(c => selected.has(c.id));
  const pages       = chunk(printCartes, CARDS_PER_PAGE);
  const totalPages  = pages.length;

  return (
    <div>
      {/* ── Screen controls ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto mb-4 px-4">
        <Link
          href="/admin/fidelite"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Lots fidélité
        </Link>

        {/* Header row */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Download className="w-6 h-6 text-primary" aria-hidden="true" />
              Impression — Cartes Fidélité
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {printCartes.length} carte{printCartes.length !== 1 ? "s" : ""} sélectionnée{printCartes.length !== 1 ? "s" : ""} · {totalPages} page{totalPages !== 1 ? "s" : ""} A4 · {CARDS_PER_PAGE} cartes/page
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            disabled={printCartes.length === 0 || downloading}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {downloading
              ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              : <Download className="w-4 h-4" aria-hidden="true" />
            }
            {downloading
              ? "Génération en cours…"
              : `Télécharger PDF${printCartes.length > 0 ? ` (${printCartes.length})` : ""}`
            }
          </button>
        </div>

        {/* Card generator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 flex flex-wrap items-center gap-4">
          <QrCode className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">Générer de nouvelles cartes vierges</p>
            <p className="text-xs text-slate-400 mt-0.5">Chaque carte sera liée à un client lors du premier scan</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1} max={50}
              value={nombre}
              onChange={e => setNombre(Math.max(1, Math.min(50, Number(e.target.value))))}
              className="w-20 border border-slate-200 rounded-xl px-3 py-2 text-sm text-center focus:outline-none focus:border-primary/40"
            />
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 bg-primary/8 text-primary border border-primary/15 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary hover:text-white transition-all cursor-pointer disabled:opacity-60"
            >
              {generating
                ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                : <QrCode className="w-4 h-4" aria-hidden="true" />
              }
              Générer {nombre}
            </button>
            <button
              onClick={loadCartes}
              disabled={loading}
              title="Recharger"
              className="border border-slate-200 text-slate-400 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Selection toolbar */}
        {cartes.length > 0 && (
          <div className="flex items-center gap-3 mb-3 text-sm">
            <button
              onClick={() => setSelected(new Set(cartes.map(c => c.id)))}
              className="text-primary hover:underline cursor-pointer"
            >
              Tout sélectionner
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-slate-500 hover:underline cursor-pointer"
            >
              Tout désélectionner
            </button>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{selected.size} / {cartes.length} sélectionnées</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        {!loading && cartes.length > 0 && (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Aperçu · 85,6 × 54 mm · cliquer pour sélectionner/désélectionner
          </p>
        )}
      </div>

      {/* ── Loading / Empty states ─────────────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
        </div>
      )}
      {!loading && cartes.length === 0 && !error && (
        <div className="text-center py-20 text-slate-400">
          <QrCode className="w-14 h-14 mx-auto mb-4 opacity-25" aria-hidden="true" />
          <p className="text-sm">Aucune carte disponible — générez-en ci-dessus</p>
        </div>
      )}

      {/* ── A4 pages preview ──────────────────────────────────────────────── */}
      {!loading && pages.length > 0 && (
        <div style={{ background: "#dde1e7", padding: "32px 16px 40px" }}>
          {pages.map((pageCards, pageIdx) => (
            <div
              key={pageIdx}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: pageIdx < totalPages - 1 ? "32px" : 0,
              }}
            >
              {/* Scale wrapper — visual only, does NOT affect html2canvas capture */}
              <div style={{
                transform: `scale(${SCREEN_SCALE})`,
                transformOrigin: "top center",
                // Compensate height so the page doesn't push content down
                marginBottom: `calc((${SCREEN_SCALE} - 1) * 297mm)`,
              }}>
                {/* ── A4 page — this element is captured for PDF ── */}
                <div
                  ref={el => { pagesRef.current[pageIdx] = el; }}
                  style={{
                    width: "210mm",
                    height: "297mm",
                    background: "white",
                    overflow: "hidden",
                    boxShadow: "0 4px 32px rgba(0,0,0,0.20)",
                    position: "relative",
                    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  {/* Page header: 5mm top + 7mm header = 12mm from top */}
                  <div style={{
                    position: "absolute",
                    top: "5mm",
                    left: "16.9mm",
                    right: "16.9mm",
                    height: "7mm",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "0.3mm solid #e2e8f0",
                    paddingBottom: "1.5mm",
                  }}>
                    {/* Brand */}
                    <div style={{ display: "flex", alignItems: "center", gap: "2mm" }}>
                      <div style={{
                        width: "5mm", height: "5mm",
                        background: "linear-gradient(135deg, #C8A96E, #E2C98E)",
                        borderRadius: "1mm",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{ color: "#0F1F17", fontSize: "3.5pt", fontWeight: 900, lineHeight: 1 }}>R</span>
                      </div>
                      <span style={{ color: "#1B4D3E", fontSize: "4.5pt", fontWeight: 700, letterSpacing: "0.3pt", textTransform: "uppercase" }}>
                        Rihanala Village · Cartes Fidélité
                      </span>
                    </div>
                    {/* Page number */}
                    <span style={{ color: "#94a3b8", fontSize: "4pt", letterSpacing: "0.2pt" }}>
                      Page {pageIdx + 1} / {totalPages}
                    </span>
                  </div>

                  {/* Card grid: top = 5+7+2 = 14mm */}
                  <div style={{
                    position: "absolute",
                    top: "14mm",
                    left: "16.9mm",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 85.6mm)",
                    columnGap: "5mm",
                    rowGap: "2mm",
                  }}>
                    {pageCards.map(c => (
                      <div
                        key={c.id}
                        onClick={() => toggleSelect(c.id)}
                        style={{
                          cursor: "pointer",
                          opacity: selected.has(c.id) ? 1 : 0.25,
                          transition: "opacity 0.2s",
                          outline: selected.has(c.id) ? "none" : "1.5px dashed #94a3b8",
                          borderRadius: "3.18mm",
                        }}
                        title={selected.has(c.id) ? "Cliquer pour désélectionner" : "Cliquer pour sélectionner"}
                      >
                        <LoyaltyCard carte={c} formatCode={formatCode} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Loyalty card component ─────────────────────────────────────────────────
interface LoyaltyCardProps {
  carte: Carte;
  formatCode: (code: string) => string;
}

function LoyaltyCard({ carte, formatCode }: LoyaltyCardProps) {
  return (
    <div style={{
      width: "85.6mm",
      height: "54mm",
      background: "linear-gradient(135deg, #1B4D3E 0%, #163d31 55%, #1a3d2e 100%)",
      borderRadius: "3.18mm",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}>
      {/* Gold top stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "0.8mm",
        background: "linear-gradient(90deg, #A88A4E, #C8A96E, #E2C98E, #C8A96E, #A88A4E)",
      }} />

      {/* Diagonal gold shimmer (top-right) */}
      <div style={{
        position: "absolute",
        top: "-8mm", right: "8mm",
        width: "18mm", height: "70mm",
        background: "rgba(200,169,110,0.07)",
        transform: "rotate(20deg)",
      }} />
      <div style={{
        position: "absolute",
        top: "-8mm", right: "14mm",
        width: "8mm", height: "70mm",
        background: "rgba(200,169,110,0.05)",
        transform: "rotate(20deg)",
      }} />

      {/* Header: logo + brand | "ma carte" */}
      <div style={{
        padding: "3.5mm 4mm 2mm",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        {/* Left: logo + brand name */}
        <div style={{ display: "flex", alignItems: "center", gap: "2mm" }}>
          <div style={{
            width: "7.5mm", height: "7.5mm",
            background: "linear-gradient(135deg, #C8A96E, #E2C98E)",
            borderRadius: "1.5mm",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <span style={{ color: "#0F1F17", fontSize: "5pt", fontWeight: 900, lineHeight: 1 }}>R</span>
          </div>
          <div>
            <div style={{ color: "#C8A96E", fontSize: "5.5pt", fontWeight: 700, letterSpacing: "0.6pt", textTransform: "uppercase", lineHeight: 1 }}>
              Rihanala Village
            </div>
            <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "3.2pt", letterSpacing: "0.2pt", lineHeight: 1, marginTop: "0.5mm" }}>
              Foulpointe · Madagascar
            </div>
          </div>
        </div>

        {/* Right: "ma carte" */}
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "rgba(255,255,255,0.30)", fontSize: "3pt", letterSpacing: "1.5pt", textTransform: "uppercase", lineHeight: 1 }}>ma</div>
          <div style={{ color: "#C8A96E", fontSize: "9pt", fontWeight: 900, letterSpacing: "-0.5pt", lineHeight: 1 }}>carte</div>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: "0.2mm", background: "rgba(200,169,110,0.18)", margin: "0 4mm", flexShrink: 0 }} />

      {/* Body: QR + info */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        gap: "3.5mm",
        padding: "2mm 4mm",
        minHeight: 0,
      }}>
        {/* QR code */}
        <div style={{
          width: "23mm", height: "23mm",
          background: "white",
          borderRadius: "1.5mm",
          padding: "1mm",
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {carte.qrDataUrl && (
            <img src={carte.qrDataUrl} alt="QR" style={{ width: "100%", height: "100%", display: "block" }} />
          )}
        </div>

        {/* Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5mm" }}>
          <div style={{ color: "rgba(255,255,255,0.30)", fontSize: "2.8pt", letterSpacing: "0.5pt", textTransform: "uppercase", lineHeight: 1 }}>
            Carte de fidélité
          </div>
          <div style={{ color: "#C8A96E", fontSize: "4pt", fontWeight: 700, lineHeight: 1.35 }}>
            1 point / 5 000 Ar dépensés
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "3.5pt", lineHeight: 1.35 }}>
            100 pts → 50 000 Ar cagnotte
          </div>
          <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "3.2pt", lineHeight: 1 }}>
            +261 34 68 084 66
          </div>
        </div>
      </div>

      {/* Footer: card code + chip */}
      <div style={{
        background: "rgba(0,0,0,0.28)",
        padding: "1.5mm 4mm 2mm",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "2.8pt", letterSpacing: "0.5pt", textTransform: "uppercase", lineHeight: 1 }}>
            N° carte
          </div>
          <div style={{ color: "rgba(255,255,255,0.82)", fontSize: "3.8pt", fontFamily: "'Courier New', Courier, monospace", letterSpacing: "0.8pt", lineHeight: 1, marginTop: "0.4mm" }}>
            {formatCode(carte.codeQR)}
          </div>
        </div>
        {/* Chip decoration */}
        <div style={{
          width: "6mm", height: "4.5mm",
          background: "linear-gradient(135deg, #C8A96E 0%, #E2C98E 50%, #C8A96E 100%)",
          borderRadius: "0.8mm",
          opacity: 0.72,
        }} />
      </div>
    </div>
  );
}
