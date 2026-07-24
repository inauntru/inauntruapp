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

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-sage-border" />
              <span className="font-body text-label-xs text-secondary-text">{tr("Sau conectează-te cu")}</span>
              <div className="flex-1 h-px bg-sage-border" />
            </div>

            {/* Social */}
            <div className="flex justify-center gap-4">
              <button className="w-11 h-11 rounded-full border border-sage-border bg-white flex items-center justify-center hover:border-forest-green transition-colors">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="w-11 h-11 rounded-full border border-sage-border bg-white flex items-center justify-center hover:border-forest-green transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
            </div>

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
