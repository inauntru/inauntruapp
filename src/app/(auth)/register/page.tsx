"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, ArrowRight, Envelope, Lock, User, Check, Leaf, Cake } from "@phosphor-icons/react";
import PhoneInput from "@/components/ui/PhoneInput";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const PLANS = [
  { id: "gratuit", name: "Gratuit", price: 0, description: "Acces limitat la practici și resurse de bază" },
  { id: "standard", name: "Standard", price: 39, description: "Acces extins la practici și o sesiune LIVE/lună", isPopular: false },
  { id: "premium", name: "Premium", price: 59, description: "Acces complet la practici, 4 sesiuni LIVE/lună", isPopular: true },
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const { tr } = useLanguage();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("gratuit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phoneOk = phone.startsWith("+40")
      ? /^\+407\d{8}$/.test(phone)
      : /^\+\d{8,15}$/.test(phone);
    if (!phoneOk) {
      setError("Te rugăm să introduci un număr de telefon valid (ex: 07XX XXX XXX).");
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const { error: signUpError } = await signUp(email, password, firstName, lastName, dateOfBirth || undefined, phone || undefined);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return;
    }

    // If paid plan chosen, save intent for after verification
    if (selectedPlan !== "gratuit") {
      localStorage.setItem("pending_plan", selectedPlan);
    }

    setDone(true);
    setLoading(false);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="card p-8 md:p-10 text-center">
          <div className="w-16 h-16 bg-light-green rounded-full flex items-center justify-center mx-auto mb-5">
            <Envelope size={28} weight="fill" className="text-forest-green" />
          </div>
          <h1 className="font-heading text-h2 text-deep-green mb-3">{tr("Verifică emailul")}</h1>
          <p className="font-body text-body-sm text-secondary-text mb-2">
            {tr("Am trimis un link de confirmare la")}
          </p>
          <p className="font-body font-semibold text-body-sm text-deep-green mb-5">{email}</p>
          <p className="font-body text-body-sm text-secondary-text mb-6">
            {tr("Click pe link pentru a activa contul tău. Dacă nu găsești emailul, verifică și folderul Spam.")}
          </p>
          <Link href="/login" className="btn btn-primary w-full justify-center">
            {tr("Mergi la autentificare")}
          </Link>
          <p className="font-body text-label-xs text-secondary-text mt-4">
            {tr("Nu ai primit emailul?")}{" "}
            <button
              onClick={() => { setDone(false); setStep(1); }}
              className="text-forest-green hover:underline"
            >
              {tr("Încearcă din nou")}
            </button>
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
    >
      <div className="card p-8 md:p-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-light-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf size={24} weight="fill" className="text-forest-green" />
          </div>
          <h1 className="font-heading text-h2 text-deep-green mb-1">{tr("Creează cont")}</h1>
          <p className="font-body text-body-sm text-secondary-text">{tr("Pas")} {step} {tr("din 2")}</p>
        </div>

        {/* Progress */}
        <div className="h-1 bg-light-green rounded-full mb-8">
          <motion.div
            className="h-full bg-forest-green rounded-full"
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl font-body text-label-xs text-red-600">
            {tr(error)}
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleStep1}
              className="space-y-4"
            >
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">{tr("Nume complet")}</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={tr("Prenume Nume")} required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">{tr("Email")}</label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={tr("email@exemplu.ro")} required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">{tr("Parolă")}</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tr("Minim 8 caractere")} required minLength={8} className="input pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-forest-green transition-colors">
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">{tr("Număr de telefon")}</label>
                <PhoneInput value={phone} onChange={setPhone} inputClassName="input" />
                <p className="font-body text-label-xs text-secondary-text mt-1.5">
                  {tr("Folosit pentru securitatea contului și pentru a te putea asista personalizat.")}
                </p>
              </div>

              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">
                  {tr("Data nașterii")} <span className="text-secondary-text font-normal">{tr("(opțional)")}</span>
                </label>
                <div className="relative">
                  <Cake size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text pointer-events-none" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split("T")[0]}
                    className="input pl-10 w-full"
                  />
                </div>
                <p className="font-body text-label-xs text-secondary-text mt-1.5">
                  {tr("Opțional. Folosim data nașterii pentru a personaliza conținutul zilnic pentru tine. ✨")}
                </p>
              </div>

              <p className="font-body text-label-xs text-secondary-text">
                {tr("Prin înregistrare, ești de acord cu")}{" "}
                <Link href="/termeni" className="text-forest-green hover:underline">{tr("Termenii și condițiile")}</Link>{" "}
                {tr("și")}{" "}
                <Link href="/confidentialitate" className="text-forest-green hover:underline">{tr("Politica de confidențialitate")}</Link>.
              </p>

              <button type="submit" disabled={!name || !email || !password} className="btn btn-primary w-full disabled:opacity-50">
                {tr("Continuă")} <ArrowRight size={16} weight="bold" />
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleStep2}
              className="space-y-4"
            >
              <div>
                <p className="font-body text-body-sm text-secondary-text mb-4">
                  {tr("Alege planul tău (poți schimba oricând):")}
                </p>
                <div className="space-y-3">
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all duration-200 ${
                        selectedPlan === plan.id
                          ? "border-forest-green bg-light-green"
                          : "border-sage-border bg-white hover:border-forest-green/50"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-body font-semibold text-body-sm text-deep-green">{tr(plan.name)}</span>
                          {plan.isPopular && (
                            <span className="tag tag-green">{tr("Popular")}</span>
                          )}
                          {plan.id !== "gratuit" && (
                            <span className="tag bg-amber-50 text-amber-700 border border-amber-200 text-[10px]">{tr("În curând")}</span>
                          )}
                        </div>
                        <span className="font-body text-label-xs text-secondary-text">{tr(plan.description)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-lg font-bold text-deep-green">
                          {plan.price === 0 ? tr("Gratuit") : `${plan.price} RON`}
                        </span>
                        {selectedPlan === plan.id && (
                          <div className="w-5 h-5 bg-forest-green rounded-full flex items-center justify-center">
                            <Check size={11} weight="bold" className="text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {selectedPlan !== "gratuit" && (
                  <p className="font-body text-label-xs text-secondary-text mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    {tr("Plata pentru planuri plătite va fi activată în curând. Contul tău va fi creat pe planul Gratuit și vei fi contactat pentru upgrade.")}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1">← {tr("Înapoi")}</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      {tr("Se creează...")}
                    </span>
                  ) : (
                    <>{tr("Creează cont")} <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center font-body text-body-sm text-secondary-text mt-6">
          {tr("Ai deja cont?")}{" "}
          <Link href="/login" className="text-forest-green font-semibold hover:underline">
            {tr("Conectează-te")}
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
