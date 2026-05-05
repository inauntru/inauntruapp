"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Eye, EyeSlash, Warning } from "@phosphor-icons/react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.replace("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Credențiale incorecte.");
      }
    } catch {
      setError("A apărut o eroare. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFDF9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-deep-green rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Leaf size={22} weight="fill" className="text-white" />
          </div>
          <h1 className="font-heading text-2xl text-deep-green">INAUNTRU</h1>
          <p className="font-body text-body-sm text-secondary-text mt-1">Panou de administrare</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-sage-border rounded-2xl p-8 shadow-card">
          <h2 className="font-heading text-xl text-deep-green mb-6">Autentificare</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-2">
                Utilizator
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                placeholder="admin"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="block font-ui text-label-xs text-secondary-text uppercase tracking-widest mb-2">
                Parolă
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-deep-green transition-colors"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <Warning size={16} className="text-red-500 flex-shrink-0" />
                <p className="font-body text-body-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
            >
              {loading ? "Se verifică..." : "Intră în panou"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
