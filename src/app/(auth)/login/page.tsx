"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, ArrowRight, Envelope, Lock, User } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const { tr } = useLanguage();
  const router = useRouter();
  const [view, setView] = useState<"login" | "register">("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    const { error } = await signIn(loginEmail, loginPassword);
    if (error) {
      setLoginError("Email sau parolă incorectă.");
      setLoginLoading(false);
    } else {
      setLoginLoading(false);
      router.push("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    const { error } = await signUp(regEmail, regPassword, firstName, lastName);
    if (error) {
      setRegError("A apărut o eroare. Încearcă din nou.");
      setRegLoading(false);
    } else {
      setRegSuccess(true);
      setRegLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <AnimatePresence mode="wait">
        {view === "login" ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-card border border-sage-border/60"
          >
            <h2 className="font-heading text-2xl text-deep-green mb-1">{tr("Conectare")}</h2>
            <p className="font-body text-body-sm text-secondary-text mb-7">{tr("Reintoarce-te în spațiul tău de liniște.")}</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest block mb-2">{tr("Adresă de email")}</label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder={tr("email@exemplu.ro")}
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest">{tr("Parolă")}</label>
                  <Link href="/forgot-password" className="font-body text-label-xs text-secondary-text hover:text-forest-green transition-colors">
                    {tr("Ai uitat parola?")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="input pl-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-forest-green"
                  >
                    {showLoginPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2 font-body">{tr(loginError)}</p>
              )}
              <button
                type="submit"
                disabled={loginLoading || !loginEmail || !loginPassword}
                className="w-full h-12 rounded-full bg-deep-green text-white font-ui font-semibold text-body-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-forest-green transition-colors disabled:opacity-50 mt-2"
              >
                {loginLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>{tr("Intră în cont")} <ArrowRight size={16} weight="bold" /></>
                )}
              </button>
            </form>


            {/* Switch to register */}
            <p className="text-center font-body text-body-sm text-secondary-text mt-6">
              {tr("Nu ai cont?")}{" "}
              <button
                onClick={() => setView("register")}
                className="text-forest-green font-semibold hover:underline transition-colors"
              >
                {tr("Creează unul gratuit")}
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="bg-white rounded-2xl p-5 sm:p-8 shadow-card border border-sage-border/60"
          >
            <h2 className="font-heading text-2xl text-deep-green mb-1">{tr("Înregistrare")}</h2>
            <p className="font-body text-body-sm text-secondary-text mb-7">{tr("Începe călătoria ta către reglarea sistemului nervos.")}</p>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest block mb-2">{tr("Prenume")}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={tr("Ioan")}
                      required
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest block mb-2">{tr("Nume")}</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={tr("Popescu")}
                    required
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest block mb-2">{tr("Email")}</label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={tr("nume@email.com")}
                    required
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="font-ui text-label-xs text-secondary-text uppercase tracking-widest block mb-2">{tr("Parolă nouă")}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={tr("Minim 8 caractere")}
                    required
                    minLength={8}
                    className="input pl-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-forest-green"
                  >
                    {showRegPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-forest-green w-4 h-4 flex-shrink-0"
                />
                <span className="font-body text-body-sm text-secondary-text">
                  {tr("Sunt de acord cu")}{" "}
                  <Link href="#" className="text-forest-green hover:underline">{tr("Termenii și Condițiile")}</Link>{" "}
                  {tr("și")}{" "}
                  <Link href="#" className="text-forest-green hover:underline">{tr("Politica de Confidențialitate")}</Link>.
                </span>
              </label>

              {regError && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2 font-body">{tr(regError)}</p>
              )}

              <button
                type="submit"
                disabled={regLoading || !firstName || !lastName || !regEmail || !regPassword || !agreed}
                className="w-full h-12 rounded-full bg-deep-green text-white font-ui font-semibold text-body-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-forest-green transition-colors disabled:opacity-50"
              >
                {regLoading ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <>{tr("Creează contul")} <ArrowRight size={16} weight="bold" /></>
                )}
              </button>
            </form>

            {regSuccess && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                <p className="font-body text-body-sm text-green-700">{tr("Contul a fost creat! Verifică emailul pentru a-l confirma.")}</p>
              </div>
            )}

            <p className="text-center font-body text-body-sm text-secondary-text/70 mt-5 italic">
              {tr("\"Fiecare respirație este un nou început.\"")}
            </p>

            {/* Switch to login */}
            <p className="text-center font-body text-body-sm text-secondary-text mt-4">
              {tr("Ai deja cont?")}{" "}
              <button
                onClick={() => setView("login")}
                className="text-forest-green font-semibold hover:underline transition-colors"
              >
                {tr("Conectează-te")}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
