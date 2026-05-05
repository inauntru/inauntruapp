"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useInView, useAnimation, Variant } from "framer-motion";

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  from?: "bottom" | "left" | "right" | "top" | "scale";
  once?: boolean;
}

const VARIANTS: Record<string, { hidden: Variant; visible: Variant }> = {
  bottom: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  top: {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
};

export default function AnimateIn({
  children,
  delay = 0,
  duration = 0.7,
  className,
  from = "bottom",
  once = true,
}: AnimateInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={VARIANTS[from]}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  childClassName?: string;
  from?: "bottom" | "left" | "right" | "scale";
  delay?: number;
  once?: boolean;
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.1,
  childClassName,
  from = "bottom",
  delay = 0,
  once = true,
}: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-50px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {(Array.isArray(children) ? children : [children]).map((child, i) => (
        <motion.div key={i} variants={VARIANTS[from]} transition={{ duration: 0.6, ease: "easeOut" }} className={childClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

export function CountUp({ from = 0, to, duration = 2, suffix = "", prefix = "", className }: {
  from?: number;
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, from, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{count.toLocaleString("ro-RO")}{suffix}
    </span>
  );
}
