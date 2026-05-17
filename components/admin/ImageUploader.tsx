"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface UploadedImage {
  url: string;
  uploading?: boolean;
  error?: string;
}

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  hint?: string;
}

export function SingleImageUploader({
  value,
  onChange,
  folder = "rihanala",
  label = "Photo",
  hint,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file: File) {
    setUploading(true);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erreur upload");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
      </p>

      {value ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-slate-200">
            <Image src={value} alt={label} fill className="object-cover" sizes="192px" />
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            aria-label="Supprimer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="mt-2 text-xs text-primary hover:underline block"
          >
            Changer de photo
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${dragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
            }
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-slate-500">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">
                  Glissez une photo ici
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  ou <span className="text-primary">cliquez pour choisir</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {hint ?? "JPG, PNG, WebP · Max 8 MB · Depuis téléphone ou PC"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input caché — capture="environment" ouvre la caméra sur mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

interface MultiImageUploaderProps {
  values: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  max?: number;
}

export function MultiImageUploader({
  values,
  onChange,
  folder = "rihanala",
  label = "Photos supplémentaires",
  max = 10,
}: MultiImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  async function uploadFiles(files: FileList) {
    if (values.length + files.length > max) {
      setError(`Maximum ${max} photos autorisées.`);
      return;
    }

    setUploading(true);
    setError(null);

    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Erreur");
        uploaded.push(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur upload");
        break;
      }
    }

    onChange([...values, ...uploaded]);
    setUploading(false);
  }

  function removeImage(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <p className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}
        {values.length > 0 && (
          <span className="ml-2 text-slate-400 font-normal normal-case">
            ({values.length}/{max})
          </span>
        )}
      </p>

      {/* Grille des photos uploadées */}
      {values.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {values.map((url, i) => (
            <div key={i} className="relative group">
              <div className="relative h-24 rounded-xl overflow-hidden border border-slate-200">
                <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="120px" />
              </div>
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {values.length < max && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200
            ${dragging
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
            }
          `}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <p className="text-sm text-slate-500">Upload en cours…</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <ImageIcon className="w-5 h-5 text-slate-400" />
              <div className="text-left">
                <p className="text-sm text-slate-600">
                  Ajouter des photos
                </p>
                <p className="text-xs text-slate-400">
                  Glissez ou cliquez · Téléphone ou PC · Max 8 MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />

      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
