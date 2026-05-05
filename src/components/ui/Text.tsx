import typography from "@/lib/typography";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export function H1({ children, className = "", white = false }: Props & { white?: boolean }) {
  return (
    <h1 className={`${typography.h1} ${white ? "text-white" : "text-[#1C3A2A]"} ${className}`}>
      {children}
    </h1>
  );
}

export function H2({ children, className = "" }: Props) {
  return (
    <h2 className={`${typography.h2} text-[#1C3A2A] ${className}`}>
      {children}
    </h2>
  );
}

export function H3({ children, className = "" }: Props) {
  return (
    <h3 className={`${typography.h3} text-[#1C3A2A] ${className}`}>
      {children}
    </h3>
  );
}

export function H4({ children, className = "" }: Props) {
  return (
    <h4 className={`${typography.h4} text-[#1C3A2A] ${className}`}>
      {children}
    </h4>
  );
}

export function Body({ children, className = "" }: Props) {
  return (
    <p className={`${typography.body} text-[#6B8F78] ${className}`}>
      {children}
    </p>
  );
}

export function BodyLarge({ children, className = "" }: Props) {
  return (
    <p className={`${typography.bodyLarge} text-[#6B8F78] ${className}`}>
      {children}
    </p>
  );
}

export function Caption({ children, className = "" }: Props) {
  return (
    <span className={`${typography.caption} text-[#6B8F78] ${className}`}>
      {children}
    </span>
  );
}

export function Eyebrow({ children, className = "" }: Props) {
  return (
    <span className={`${typography.eyebrow} text-[#3D7A5C] ${className}`}>
      {children}
    </span>
  );
}

export function Label({ children, className = "" }: Props) {
  return (
    <span className={`${typography.label} text-[#6B8F78] ${className}`}>
      {children}
    </span>
  );
}

export function Price({ children, className = "" }: Props) {
  return (
    <span className={`${typography.price} text-[#3D7A5C] ${className}`}>
      {children}
    </span>
  );
}

export function Stat({ children, className = "" }: Props) {
  return (
    <span className={`${typography.stat} text-[#3D7A5C] ${className}`}>
      {children}
    </span>
  );
}
