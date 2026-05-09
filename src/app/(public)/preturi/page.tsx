"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, ShieldCheck, CaretDown, Buildings } from "@phosphor-icons/react";
import AnimateIn, { StaggerChildren } from "@/components/ui/AnimateIn";
import { PRICING_PLANS, FAQ_ITEMS } from "@/lib/mockData";

const COMPARISON_COMPETITORS = [
  {
    feature: "Conținut în română",
    inauntru: true, somaway: false, hedepy: false, headspace: false, hilio: false,
  },
  {
    feature: "Terapie somatică specifică",
    inauntru: true, somaway: false, hedepy: false, headspace: false, hilio: false,
  },
  {
    feature: "Sesiuni live interactive",
    inauntru: true, somaway: false, hedepy: true, headspace: false, hilio: true,
  },
  {
    feature: "Check-in zilnic + harta corp",
    inauntru: true, somaway: false, hedepy: false, headspace: false, hilio: false,
  },
  {
    feature: "Facilitatori certificați RO",
    inauntru: true, somaway: false, hedepy: false, headspace: false, hilio: true,
  },
  {
    feature: "Sub 90 RON/lună",
    inauntru: true, somaway: true, hedepy: false, headspace: false, hilio: false,
  },
  {
    feature: "14 zile gratuit (plan Premium)",
    inauntru: true, somaway: false, hedepy: false, headspace: false, hilio: false,
  },
];

const BILLING_FAQ = [
  { q: "Pot anula oricând abonamentul?", a: "Da, poți anula oricând din setările contului tău. Nu există penalități sau taxe de anulare." },
  { q: "Ce metode de plată acceptați?", a: "Acceptăm card Visa, Mastercard și plată prin transfer bancar pentru planurile anuale." },
  { q: "Există perioadă de probă gratuită?", a: "Planul Gratuit este disponibil fără limită de timp. Nu cerem card de credit." },
  { q: "Pot schimba planul ulterior?", a: "Da, poți face upgrade sau downgrade oricând. Diferența se calculează proporțional." },
];

export default function PreturiPage() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg-main">
      {/* Hero */}
      <section className="py-16 lg:py-24 bg-bg-main">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimateIn from="bottom">
            <p className="section-label justify-center">Investește în tine</p>
            <h1 className="font-heading text-h1 text-deep-green mb-4">
              Alege planul potrivit
            </h1>
            <p className="font-body text-body-lg text-secondary-text max-w-xl mx-auto mb-10">
              Începe-ți călătoria somatică. Alege pachetul care rezonează cu ritmul tău de creștere.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={`font-body text-body-sm ${!billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>Lunar</span>
              <button
                onClick={() => setBillingAnnual(!billingAnnual)}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${billingAnnual ? "bg-forest-green" : "bg-sage-border"}`}
              >
                <motion.div
                  animate={{ x: billingAnnual ? 28 : 4 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm"
                />
              </button>
              <span className={`font-body text-body-sm ${billingAnnual ? "text-deep-green font-semibold" : "text-secondary-text"}`}>Anual</span>
              <span className="tag tag-green">Economisești 35%</span>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Pricing plans */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.12}>
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-card border p-8 flex flex-col transition-all duration-200 ${
                plan.isPopular
                  ? "bg-forest-green border-forest-green text-white shadow-button md:scale-105"
                  : "card card-lift bg-white"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-rose-powder text-deep-green text-label-xs font-bold px-4 py-1 rounded-full shadow-sm">
                    CEL MAI POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-heading text-h3 mb-1 ${plan.isPopular ? "text-white" : "text-deep-green"}`}>
                  {plan.name}
                </h3>
                <p className={`font-body text-body-sm ${plan.isPopular ? "text-white/70" : "text-secondary-text"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <motion.span
                    key={billingAnnual ? "a" : "m"}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`font-heading text-5xl font-bold ${plan.isPopular ? "text-white" : "text-deep-green"}`}
                  >
                    {billingAnnual ? plan.priceAnnual : plan.price}
                  </motion.span>
                  <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>
                    RON/lună
                  </span>
                </div>
                {billingAnnual && plan.price > 0 && (
                  <p className={`font-body text-label-xs mt-1 ${plan.isPopular ? "text-white/60" : "text-secondary-text"}`}>
                    = {plan.priceAnnual * 12} RON/an (vs {plan.price * 12} RON lunar)
                  </p>
                )}
              </div>

              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={16} weight="bold" className={`flex-shrink-0 mt-0.5 ${plan.isPopular ? "text-primary-fixed-dim" : "text-forest-green"}`} />
                    <span className={`font-body text-body-sm ${plan.isPopular ? "text-white/85" : "text-secondary-text"}`}>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 opacity-35">
                    <X size={16} weight="regular" className="flex-shrink-0 mt-0.5" />
                    <span className={`font-body text-body-sm ${plan.isPopular ? "text-white" : "text-secondary-text"}`}>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`btn w-full text-center ${
                  plan.isPopular ? "bg-white text-forest-green hover:bg-white/90" : "btn-primary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </StaggerChildren>

        {/* Guarantee */}
        <div className="mt-8 flex items-center justify-center gap-3 text-secondary-text font-body text-body-sm">
          <ShieldCheck size={20} weight="fill" className="text-forest-green" />
          <span>14 zile gratuit cu acces Premium · Fără card · Anulare oricând</span>
        </div>
      </div>

      {/* B2B / Corporate — dezactivat temporar până la lansare, reactivează când suntem pregătiți */}
      {/* <section className="py-16 bg-deep-green">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Buildings size={28} weight="regular" className="text-primary-fixed-dim" />
                  <p className="font-body text-label-sm text-primary-fixed-dim uppercase tracking-widest">Corporate & B2B</p>
                </div>
                <h2 className="font-heading text-h2 text-white mb-4">
                  Investești în bunăstarea echipei tale?
                </h2>
                <p className="font-body text-body-lg text-white/60 mb-8">
                  Pachete corporate personalizate pentru companii. Angajați mai calmi, mai productivi și mai echilibrați emoțional.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Sesiuni live dedicate echipei tale",
                    "Dashboard corporate cu rapoarte de wellbeing",
                    "Facilitatori dedicați pe nevoile companiei",
                    "Prețuri negociate pentru 10+ angajați",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-body-sm text-white/70">
                      <Check size={16} weight="bold" className="text-primary-fixed-dim flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href="mailto:business@inauntru.ro" className="btn btn-rose">
                  Solicită un demo <ArrowRight size={16} weight="bold" />
                </a>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-forest-green/30 border border-forest-green/40 flex items-center justify-center">
                  <Buildings size={72} weight="regular" className="text-white/30" />
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section> */}

      {/* Billing FAQ */}
      <section className="py-16 bg-bg-main">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateIn from="bottom">
            <div className="text-center mb-10">
              <p className="section-label">Facturare</p>
              <h2 className="section-title">Întrebări despre plăți</h2>
            </div>
          </AnimateIn>
          <div className="space-y-3">
            {BILLING_FAQ.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-light-green/40 transition-colors"
                >
                  <span className="font-body font-semibold text-body-md text-deep-green pr-4">{item.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <CaretDown size={18} weight="bold" className="text-secondary-text flex-shrink-0" />
                  </motion.div>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    <p className="font-body text-body-sm text-secondary-text">{item.a}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
