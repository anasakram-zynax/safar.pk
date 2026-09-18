"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

type RevealProps = { children: ReactNode; className?: string; delay?: number };

export function FadeIn({ children, className, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.42, delay }}>{children}</motion.div>;
}

export function SlideUp({ children, className, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.42, delay, ease: "easeOut" }}>{children}</motion.div>;
}

export function StaggerContainer({ children, className }: Omit<RevealProps, "delay">) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }}>{children}</motion.div>;
}

export function StaggerItem({ children, className }: Omit<RevealProps, "delay">) {
  const reduced = useReducedMotion();
  return <motion.div className={className} variants={{ hidden: reduced ? {} : { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.36 } } }}>{children}</motion.div>;
}
