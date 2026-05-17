"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, ScanLine, Camera, X, Check, AlertTriangle, Calculator } from "lucide-react";

interface CarteInfo {
  id:          string;
  code:        string;
  pourcentage: number;
  estUtilise:  boolean;
  note:        string | null;
}

interface ApplyResult {
  montantOriginal: number;
  montantFinal:    number;
  economie:        number;
  pourcentage:     number;
}

type Mode = "idle" | "camera" | "loading" | "valid" | "invalid" | "already_used" | "applied";

function normalizeCode(raw: string): string {
  return raw.trim().replace(/[\s\-]/g, "").toUpperCase();
}

function formatCode(code: string): string {
  return code.toUpperCase().match(/.{1,4}/g)?.join("-") ?? code.toUpperCase();
}

function ar(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} Ar`;
}

export default function VerifierReductionPage() {
  const [mode, setMode]           = useState<Mode>("idle");
  const [inputCode, setInputCode] = useState("");
  const [carteInfo, setCarteInfo] = useState<CarteInfo | null>(null);
  const [errorMsg, setErrorMsg]   = useState("");
  const [montant, setMontant]     = useState("");
  const [applyResult, setApplyResult] = useState<ApplyResult | null>(null);
  const [applying, setApplying]   = useState(false);

  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef    = useRef<number>(0);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setMode((m) => (m === "camera" ? "idle" : m));
  }, []);

  const handleCodeFound = useCallback(async (rawCode: string) => {
    stopCamera();
    const code = normalizeCode(rawCode);
    setMode("loading");
    setErrorMsg("");

    const res = await fetch(`/api/reductions/${code}`);
    const data = await res.json();

    if (res.status === 404) {
      setErrorMsg("Code invalide ou inconnu");
      setMode("invalid");
      return;
    }
    if (res.status === 409) {
      setCarteInfo(data.carte);
      setMode("already_used");
      return;
    }
    if (!res.ok) {
      setErrorMsg("Erreur serveur");
      setMode("invalid");
      return;
    }

    setCarteInfo(data);
    setMode("valid");
  }, [stopCamera]);

  async function startCamera() {
    setMode("camera");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const jsQR = (await import("jsqr")).default;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const tick = () => {
        if (!videoRef.current || videoRef.current.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        canvas.width  = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(img.data, img.width, img.height);
        if (result?.data) {
          handleCodeFound(result.data);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setErrorMsg("Impossible d'accéder à la caméra");
      setMode("idle");
    }
  }

  async function handleManualSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!inputCode.trim()) return;
    await handleCodeFound(inputCode);
  }

  async function handleApply() {
    if (!carteInfo || !montant) return;
    const montantNum = parseFloat(montant.replace(/\s/g, "").replace(",", "."));
    if (isNaN(montantNum) || montantNum <= 0) return;

    setApplying(true);
    const res = await fetch(`/api/reductions/${carteInfo.code}/appliquer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montantOriginal: montantNum }),
    });
    const data = await res.json();
    setApplying(false);

    if (!res.ok) {
      setErrorMsg(typeof data.error === "string" ? data.error : "Erreur lors de l'application");
      return;
    }

    setApplyResult(data);
    setMode("applied");
  }

  function reset() {
    setMode("idle");
    setInputCode("");
    setCarteInfo(null);
    setErrorMsg("");
    setMontant("");
    setApplyResult(null);
  }

  const montantNum = parseFloat(montant.replace(/\s/g, "").replace(",", "."));
  const preview = !isNaN(montantNum) && montantNum > 0 && carteInfo
    ? {
        original: montantNum,
        final:    Math.round(montantNum * (1 - carteInfo.pourcentage / 100)),
        economie: Math.round(montantNum * carteInfo.pourcentage / 100),
      }
    : null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/reductions"
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-primary" />
            Vérifier un code de réduction
          </h1>
          <p className="text-slate-500 text-sm">Scannez ou saisissez un code</p>
        </div>
      </div>

      {/* IDLE — input + camera button */}
      {(mode === "idle" || mode === "loading") && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <button
            onClick={startCamera}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-primary/30 text-primary font-medium text-sm hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <Camera className="w-5 h-5" />
            Scanner par caméra
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400">ou saisir manuellement</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <form onSubmit={handleManualSearch} className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="ex: ABCD-EFGH"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 uppercase"
              disabled={mode === "loading"}
            />
            <button
              type="submit"
              disabled={mode === "loading" || !inputCode.trim()}
              className="px-4 py-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {mode === "loading" ? "…" : "Vérifier"}
            </button>
          </form>

          {errorMsg && mode === "idle" && (
            <p className="text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          )}
        </div>
      )}

      {/* CAMERA overlay */}
      {mode === "camera" && (
        <div className="bg-black rounded-2xl overflow-hidden relative" style={{ aspectRatio: "4/3" }}>
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />
          {/* Viewfinder */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-56 h-56 relative">
              {[["top-0 left-0 border-t-2 border-l-2","rounded-tl-lg"],
                ["top-0 right-0 border-t-2 border-r-2","rounded-tr-lg"],
                ["bottom-0 left-0 border-b-2 border-l-2","rounded-bl-lg"],
                ["bottom-0 right-0 border-b-2 border-r-2","rounded-br-lg"],
              ].map(([pos, r], i) => (
                <div key={i} className={`absolute w-8 h-8 border-[#C8A96E] ${pos} ${r}`} />
              ))}
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs">
            Pointez vers le QR code
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ALREADY_USED */}
      {mode === "already_used" && carteInfo && (
        <div className="bg-white rounded-2xl border border-red-100 p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <X className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-semibold">Code déjà utilisé</div>
              <div className="text-sm text-red-400">Cette carte de réduction n'est plus valide</div>
            </div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 font-mono text-center text-red-700 font-bold tracking-wider text-lg">
            {formatCode(carteInfo.code)}
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Vérifier un autre code
          </button>
        </div>
      )}

      {/* INVALID */}
      {mode === "invalid" && (
        <div className="bg-white rounded-2xl border border-orange-100 p-6 space-y-4">
          <div className="flex items-center gap-3 text-orange-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-semibold">Code invalide</div>
              <div className="text-sm text-orange-400">{errorMsg}</div>
            </div>
          </div>
          <button onClick={reset} className="w-full py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            Réessayer
          </button>
        </div>
      )}

      {/* VALID — show card info + amount input */}
      {mode === "valid" && carteInfo && (
        <div className="bg-white rounded-2xl border border-green-100 p-6 space-y-5">
          <div className="flex items-center gap-3 text-green-700">
            <Check className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-semibold">Code valide</div>
              <div className="text-sm text-green-500">Cette carte est disponible</div>
            </div>
          </div>

          <div className="bg-[#1B4D3E] rounded-xl p-4 text-center">
            <div className="text-[#C8A96E] text-3xl font-bold mb-1">-{carteInfo.pourcentage}%</div>
            <div className="font-mono text-white font-bold tracking-wider text-base">
              {formatCode(carteInfo.code)}
            </div>
            {carteInfo.note && (
              <div className="text-white/50 text-xs mt-1">{carteInfo.note}</div>
            )}
          </div>

          {/* Amount input + live preview */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Montant original (Ar)
            </label>
            <input
              type="number"
              min={1}
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
              placeholder="ex: 120000"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {preview && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Montant original</span>
                <span>{ar(preview.original)}</span>
              </div>
              <div className="flex justify-between text-green-700 font-medium">
                <span>Économie (-{carteInfo.pourcentage}%)</span>
                <span>-{ar(preview.economie)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base border-t border-slate-200 pt-2">
                <span>Montant à payer</span>
                <span className="text-primary">{ar(preview.final)}</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <p className="text-red-600 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={reset}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleApply}
              disabled={applying || !preview}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {applying ? "Application…" : "Appliquer la réduction"}
            </button>
          </div>
        </div>
      )}

      {/* APPLIED */}
      {mode === "applied" && applyResult && (
        <div className="bg-white rounded-2xl border border-primary/20 p-6 space-y-5">
          <div className="flex items-center gap-3 text-primary">
            <Check className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-semibold">Réduction appliquée !</div>
              <div className="text-sm text-primary/60">La carte est maintenant invalidée</div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Montant original</span>
              <span>{ar(applyResult.montantOriginal)}</span>
            </div>
            <div className="flex justify-between text-green-700 font-medium">
              <span>Économie (-{applyResult.pourcentage}%)</span>
              <span>-{ar(applyResult.economie)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-lg border-t border-slate-200 pt-3">
              <span>Montant facturé</span>
              <span className="text-primary">{ar(applyResult.montantFinal)}</span>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Vérifier un autre code
          </button>
        </div>
      )}
    </div>
  );
}
