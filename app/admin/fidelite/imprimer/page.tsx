"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Printer, QrCode, RefreshCw, Trash2 } from "lucide-react";
import Link from "next/link";

interface Carte {
  id: string;
  codeQR: string;
  qrDataUrl: string;
}

export default function ImprimerCartesPage() {
  const [cartes, setCartes]         = useState<Carte[]>([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [nombre, setNombre]         = useState(10);
  const [error, setError]           = useState<string | null>(null);
  const [selected, setSelected]     = useState<Set<string>>(new Set());

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

  const printCartes = cartes.filter(c => selected.has(c.id));
  const pageCount   = Math.ceil(printCartes.length / 10);

  return (
    <>
      {/* ── Print CSS ────────────────────────────────────────────────────────── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page { size: A4 portrait; margin: 10mm; }

        /* Screen: card grid */
        .carte-grid {
          display: grid;
          grid-template-columns: repeat(2, 85mm);
          gap: 5mm;
          justify-content: start;
        }

        /* Card base */
        .loyalty-card {
          width: 85mm;
          height: 52mm;
          background: #1B4D3E;
          border-radius: 3mm;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          break-inside: avoid;
          page-break-inside: avoid;
          position: relative;
          font-family: 'Inter', sans-serif;
        }
        .loyalty-card__header {
          padding: 3mm 4mm 2.5mm;
          display: flex;
          align-items: center;
          gap: 2mm;
          border-bottom: 0.3mm solid rgba(200,169,110,0.25);
        }
        .loyalty-card__logo {
          width: 7mm;
          height: 7mm;
          background: #C8A96E;
          border-radius: 1.5mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .loyalty-card__logo-letter {
          color: #0F1F17;
          font-size: 5pt;
          font-weight: 800;
          line-height: 1;
        }
        .loyalty-card__titles {
          display: flex;
          flex-direction: column;
          gap: 0.3mm;
        }
        .loyalty-card__brand {
          color: #C8A96E;
          font-size: 5.5pt;
          font-weight: 700;
          letter-spacing: 0.8pt;
          text-transform: uppercase;
          line-height: 1;
        }
        .loyalty-card__sub {
          color: rgba(255,255,255,0.50);
          font-size: 3.5pt;
          letter-spacing: 0.2pt;
          line-height: 1;
        }
        .loyalty-card__body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4mm;
          padding: 2mm 4mm;
        }
        .loyalty-card__qr-wrap {
          width: 30mm;
          height: 30mm;
          background: white;
          border-radius: 1.5mm;
          padding: 1mm;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .loyalty-card__qr-wrap img {
          width: 100%;
          height: 100%;
          display: block;
        }
        .loyalty-card__info {
          display: flex;
          flex-direction: column;
          gap: 1.5mm;
        }
        .loyalty-card__info-line {
          color: rgba(255,255,255,0.65);
          font-size: 3.8pt;
          line-height: 1.4;
        }
        .loyalty-card__info-line strong {
          color: #C8A96E;
          font-weight: 600;
        }
        .loyalty-card__footer {
          padding: 1.5mm 4mm 2mm;
          background: rgba(0,0,0,0.30);
          display: flex;
          flex-direction: column;
          gap: 0.5mm;
        }
        .loyalty-card__code-label {
          color: rgba(255,255,255,0.35);
          font-size: 2.8pt;
          letter-spacing: 0.4pt;
          text-transform: uppercase;
          line-height: 1;
        }
        .loyalty-card__code {
          color: rgba(255,255,255,0.80);
          font-size: 3.8pt;
          font-family: 'Courier New', Courier, monospace;
          letter-spacing: 0.8pt;
          line-height: 1;
          word-spacing: 1pt;
        }

        /* ── Print: hide everything, show only print zone ── */
        @media print {
          body * { visibility: hidden !important; }
          #print-zone, #print-zone * { visibility: visible !important; }
          #print-zone {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
          }
          .carte-grid {
            gap: 4mm;
          }
        }
      `}} />

      {/* ── Screen controls ──────────────────────────────────────────────────── */}
      <div className="print:hidden max-w-5xl mx-auto">
        <Link
          href="/admin/fidelite/config"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Configuration fidélité
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Printer className="w-6 h-6 text-primary" aria-hidden="true" />
              Impression — Cartes Fidélité
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {printCartes.length} carte{printCartes.length !== 1 ? "s" : ""} sélectionnée{printCartes.length !== 1 ? "s" : ""} · {pageCount} page{pageCount !== 1 ? "s" : ""} A4 · 10 cartes/page
            </p>
          </div>
          <button
            onClick={() => window.print()}
            disabled={printCartes.length === 0}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-h transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4" aria-hidden="true" />
            Imprimer {printCartes.length > 0 ? `(${printCartes.length})` : ""}
          </button>
        </div>

        {/* Generator */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-5 flex flex-wrap items-center gap-4">
          <QrCode className="w-5 h-5 text-primary shrink-0" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-700">Générer de nouvelles cartes vierges</p>
            <p className="text-xs text-slate-400 mt-0.5">Chaque carte sera liée à un client lors du premier scan</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={50}
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
              title="Recharger les cartes"
              className="border border-slate-200 text-slate-400 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Selection toolbar */}
        {cartes.length > 0 && (
          <div className="flex items-center gap-3 mb-4 text-sm">
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

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
          </div>
        )}

        {/* Empty */}
        {!loading && cartes.length === 0 && !error && (
          <div className="text-center py-20 text-slate-400">
            <QrCode className="w-14 h-14 mx-auto mb-4 opacity-25" aria-hidden="true" />
            <p className="text-sm">Aucune carte disponible — générez-en ci-dessus</p>
          </div>
        )}

        {/* Preview label */}
        {!loading && cartes.length > 0 && (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Aperçu · Format 85 × 52 mm · cliquer pour sélectionner
          </p>
        )}
      </div>

      {/* ── Print zone (visible on screen + print) ───────────────────────────── */}
      {!loading && cartes.length > 0 && (
        <div id="print-zone" className="max-w-5xl mx-auto">
          <div className="carte-grid">
            {printCartes.map(c => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`loyalty-card print:cursor-default cursor-pointer transition-opacity ${
                  selected.has(c.id) ? "opacity-100" : "opacity-35 print:hidden"
                }`}
                title={selected.has(c.id) ? "Cliquer pour désélectionner" : "Cliquer pour sélectionner"}
              >
                {/* Header */}
                <div className="loyalty-card__header">
                  <div className="loyalty-card__logo">
                    <span className="loyalty-card__logo-letter">R</span>
                  </div>
                  <div className="loyalty-card__titles">
                    <span className="loyalty-card__brand">Rihanala Village</span>
                    <span className="loyalty-card__sub">Carte Fidélité · Foulpointe, Madagascar</span>
                  </div>
                </div>

                {/* Body */}
                <div className="loyalty-card__body">
                  <div className="loyalty-card__qr-wrap">
                    {c.qrDataUrl && <img src={c.qrDataUrl} alt="QR code fidélité" />}
                  </div>
                  <div className="loyalty-card__info">
                    <div className="loyalty-card__info-line">
                      <strong>1 point</strong> par tranche<br />de dépense
                    </div>
                    <div className="loyalty-card__info-line">
                      Cagnotte dès le<br /><strong>1er palier atteint</strong>
                    </div>
                    <div className="loyalty-card__info-line">
                      <strong>+261 34 68 084 66</strong>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="loyalty-card__footer">
                  <span className="loyalty-card__code-label">N° carte</span>
                  <span className="loyalty-card__code">{formatCode(c.codeQR)}</span>
                </div>
              </div>
            ))}

            {/* Non-selected cards hidden from print but shown dimmed on screen */}
            {cartes.filter(c => !selected.has(c.id)).map(c => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className="loyalty-card print:hidden opacity-25 cursor-pointer"
                title="Cliquer pour sélectionner"
              >
                <div className="loyalty-card__header">
                  <div className="loyalty-card__logo">
                    <span className="loyalty-card__logo-letter">R</span>
                  </div>
                  <div className="loyalty-card__titles">
                    <span className="loyalty-card__brand">Rihanala Village</span>
                    <span className="loyalty-card__sub">Carte Fidélité · Foulpointe, Madagascar</span>
                  </div>
                </div>
                <div className="loyalty-card__body">
                  <div className="loyalty-card__qr-wrap">
                    {c.qrDataUrl && <img src={c.qrDataUrl} alt="QR code" />}
                  </div>
                  <div className="loyalty-card__info">
                    <div className="loyalty-card__info-line"><strong>1 point</strong> par tranche<br />de dépense</div>
                    <div className="loyalty-card__info-line">Cagnotte dès le<br /><strong>1er palier atteint</strong></div>
                    <div className="loyalty-card__info-line"><strong>+261 34 68 084 66</strong></div>
                  </div>
                </div>
                <div className="loyalty-card__footer">
                  <span className="loyalty-card__code">{c.codeQR.slice(0, 22)}…</span>
                  <div className="loyalty-card__dots">
                    <div className="loyalty-card__dot" /><div className="loyalty-card__dot" /><div className="loyalty-card__dot" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
