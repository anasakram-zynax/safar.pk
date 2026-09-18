"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type HeroSlide = {
  url: string;
  alt: string;
  location: string;
};

export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const reducedMotion = useReducedMotion();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(
      () =>
        setPosition(
          (current) =>
            (current + 1 + Math.floor(Math.random() * (slides.length - 1))) %
            slides.length,
        ),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [reducedMotion, slides]);

  // Randomness runs only after mount; the first server and client frame agree.
  const slide = slides[position];
  return (
    <AnimatePresence initial={false} mode="sync">
      <motion.div
        key={slide.url}
        className="absolute inset-0"
        initial={reducedMotion ? false : { opacity: 0, scale: 1.025 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.9, ease: "easeInOut" }}
      >
        <Image
          src={slide.url}
          alt={slide.alt}
          fill
          priority={position === 0}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b2c45]/55 to-transparent" />
        <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/35 bg-white/90 px-4 py-2 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm sm:bottom-7 sm:left-7">
          <MapPin size={14} className="text-primary" aria-hidden="true" />
          {slide.location}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
