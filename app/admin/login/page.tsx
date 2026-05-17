"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-gold flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-dark text-2xl leading-none select-none">R</span>
          </div>
          <h1 className="font-display text-2xl text-white mb-1">Rihanala Admin</h1>
          <p className="text-white/40 text-sm">Connexion à l'espace administrateur</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 rounded-2xl p-7 space-y-5"
          style={{ border: "1px solid rgba(255,255,255,.1)" }}
        >
          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rihanala-village.mg"
              required
              autoComplete="email"
              className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
              style={{ minHeight: "48px" }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-widest mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                style={{ minHeight: "48px" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition-colors"
                aria-label={showPass ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-dark font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-gold-d transition-colors duration-200 disabled:opacity-60 cursor-pointer"
            style={{ minHeight: "52px" }}
          >
            {loading ? "Connexion..." : "Se connecter"}
            {!loading && <LogIn className="w-4 h-4" aria-hidden="true" />}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Rihanala Village · Espace Administrateur
        </p>
      </div>
    </div>
  );
}
