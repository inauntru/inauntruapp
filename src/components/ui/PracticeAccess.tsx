"use client";

import Link from "next/link";
import { Lock, CheckCircle, Crown } from "@phosphor-icons/react";
import { useAuth } from "@/contexts/AuthContext";
import { canAccess, TIER_LABEL, type ContentTier } from "@/lib/plan";
import PracticePlayer from "@/components/ui/PracticePlayer";

interface PlayerProps {
  title: string;
  duration: number;
  isPremium: boolean;
  mediaType?: "audio" | "video";
  practiceId?: number;
  tier?: ContentTier;
}

/** Playerul practicii — blocat dacă planul utilizatorului nu acoperă nivelul conținutului. */
export function GatedPlayer(props: PlayerProps) {
  const { profile, loading } = useAuth();
  const tier = props.tier ?? (props.isPremium ? "premium" : "gratuit");
  const locked = tier !== "gratuit" && !loading && !canAccess(profile?.plan, tier);
  return <PracticePlayer {...props} locked={locked} />;
}

/** Cardul de acces din dreapta paginii de practică — se adaptează la planul userului. */
export function AccessCard({ isPremium, tier: tierProp }: { isPremium: boolean; tier?: ContentTier }) {
  const { profile, user, loading } = useAuth();
  const tier = tierProp ?? (isPremium ? "premium" : "gratuit");
  const access = canAccess(profile?.plan, tier);

  if (tier === "gratuit") {
    return (
      <div className="card p-6 text-center bg-light-green border-forest-green/20">
        <div className="w-12 h-12 rounded-full bg-forest-green/15 flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={24} weight="fill" className="text-forest-green" />
        </div>
        <h3 className="font-heading text-h4 text-deep-green mb-2">Practică gratuită</h3>
        <p className="font-body text-body-sm text-secondary-text">
          Disponibilă pentru toți utilizatorii, fără abonament.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="card p-6 h-40 animate-pulse bg-light-green/40" />;
  }

  if (access) {
    return (
      <div className="card p-6 text-center bg-light-green border-forest-green/20">
        <div className="w-12 h-12 rounded-full bg-forest-green/15 flex items-center justify-center mx-auto mb-3">
          <Crown size={22} weight="fill" className="text-forest-green" />
        </div>
        <h3 className="font-heading text-h4 text-deep-green mb-2">Inclus în abonamentul tău</h3>
        <p className="font-body text-body-sm text-secondary-text">
          Ai acces la această practică prin planul {TIER_LABEL[(profile?.plan as ContentTier) ?? "gratuit"]}.
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
        <Lock size={22} weight="fill" className="text-amber-600" />
      </div>
      <h3 className="font-heading text-h4 text-deep-green mb-2">Conținut {TIER_LABEL[tier]}</h3>
      <p className="font-body text-body-sm text-secondary-text mb-5">
        {tier === "premium"
          ? "Această practică e disponibilă doar cu abonamentul Premium."
          : "Această practică necesită un abonament Standard sau Premium."}
      </p>
      <Link href={user ? "/preturi" : "/register"} className="btn btn-primary w-full">
        {user ? "Vezi abonamentele" : "Creează cont"}
      </Link>
      <p className="font-ui text-label-xs text-secondary-text mt-3">14 zile gratuit · Fără card</p>
    </div>
  );
}
