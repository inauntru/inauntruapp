"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeSlash, ArrowRight, Envelope, Lock, User, Check, Leaf } from "@phosphor-icons/react";
import { PRICING_PLANS } from "@/lib/mockData";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("gratuit");
  const [loading, setLoading] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  };

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
          <h1 className="font-heading text-h2 text-deep-green mb-1">Creează cont</h1>
          <p className="font-body text-body-sm text-secondary-text">Pas {step} din 2</p>
        </div>

        {/* Progress */}
        <div className="h-1 bg-light-green rounded-full mb-8">
          <motion.div
            className="h-full bg-forest-green rounded-full"
            animate={{ width: step === 1 ? "50%" : "100%" }}
            transition={{ duration: 0.4 }}
          />
        </div>

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
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">Nume complet</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Prenume Nume" required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">Email</label>
                <div className="relative">
                  <Envelope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplu.ro" required className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="font-body text-label-sm text-on-surface mb-1.5 block">Parolă</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary-text" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minim 8 caractere" required minLength={8} className="input pl-10 pr-12" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary-text hover:text-forest-green transition-colors">
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p className="font-body text-label-xs text-secondary-text">
                Prin înregistrare, ești de acord cu{" "}
                <Link href="#" className="text-forest-green hover:underline">Termenii și condițiile</Link>{" "}
                și{" "}
                <Link href="#" className="text-forest-green hover:underline">Politica de confidențialitate</Link>.
              </p>

              <button type="submit" disabled={!name || !email || !password} className="btn btn-primary w-full disabled:opacity-50">
                Continuă <ArrowRight size={16} weight="bold" />
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
                  Alege planul tău (poți schimba oricând):
                </p>
                <div className="space-y-3">
                  {PRICING_PLANS.map((plan) => (
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
                          <span className="font-body font-semibold text-body-sm text-deep-green">{plan.name}</span>
                          {plan.isPopular && (
                            <span className="tag tag-green">Popular</span>
                          )}
                        </div>
                        <span className="font-body text-label-xs text-secondary-text">{plan.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-lg font-bold text-deep-green">
                          {plan.price === 0 ? "Gratuit" : `${plan.price} RON`}
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
              </div>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setStep(1)} className="btn btn-ghost flex-1">← Înapoi</button>
                <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Se creează...
                    </span>
                  ) : (
                    <>Creează cont <ArrowRight size={16} weight="bold" /></>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <p className="text-center font-body text-body-sm text-secondary-text mt-6">
          Ai deja cont?{" "}
          <Link href="/login" className="text-forest-green font-semibold hover:underline">
            Conectează-te
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
