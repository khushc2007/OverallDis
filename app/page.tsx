"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  {
    id: "project",
    name: "Project Info",
    shortName: "Project",
    href: "https://0-2-xi.vercel.app",
    background: "/bg-project.jpg",
  },
  {
    id: "model",
    name: "3D Model",
    shortName: "Model",
    href: "https://0-2-xi.vercel.app",
    background: "/bg-model.jpg",
  },
  {
    id: "dashboard",
    name: "Dashboard",
    shortName: "Dashboard",
    href: "https://login-jdj8.vercel.app",
    background: "/bg-dashboard.jpg",
  },
  {
    id: "team",
    name: "Team Info",
    shortName: "Team",
    href: "https://teaminfo-nu.vercel.app",
    background: "/bg-team.jpg",
  },
];

function BgSlide({ section, active }: { section: typeof sections[0]; active: boolean }) {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${section.background})` }}
      />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.6) 100%)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.55) 100%)" }} />
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay"
        style={{
          opacity: 0.07,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </motion.div>
  );
}

export default function WaterIQ() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const lastScroll = useRef(0);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  const navigate = useCallback((dir: 1 | -1) => {
    const now = Date.now();
    if (isTransitioning || now - lastScroll.current < 750) return;
    lastScroll.current = now;
    setIsTransitioning(true);
    setActiveIndex(prev => {
      const next = prev + dir;
      if (next < 0 || next >= sections.length) { setIsTransitioning(false); return prev; }
      return next;
    });
    setTimeout(() => setIsTransitioning(false), 750);
  }, [isTransitioning]);

  const goTo = useCallback((i: number) => {
    if (isTransitioning || i === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(i);
    setTimeout(() => setIsTransitioning(false), 750);
  }, [isTransitioning, activeIndex]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 15) navigate(e.deltaY > 0 ? 1 : -1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [navigate]);

  useEffect(() => {
    const onTS = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    };
    const onTE = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
      // Only navigate if vertical swipe is dominant
      if (Math.abs(dy) > 40 && Math.abs(dy) > dx) navigate(dy > 0 ? 1 : -1);
    };
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchend", onTE, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend", onTE);
    };
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") navigate(1);
      if (e.key === "ArrowUp") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const active = sections[activeIndex];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none cursor-default touch-none">

      {/* Preloaded backgrounds */}
      {sections.map((s, i) => (
        <BgSlide key={s.id} section={s} active={i === activeIndex} />
      ))}

      {/* ── HEADER ── */}
      <div className="absolute top-0 left-0 right-0 z-30 flex justify-center items-start pt-6 md:pt-10 pointer-events-none">
        <div className="text-center" style={{ fontFamily: "var(--font-instrument-serif), Georgia, serif" }}>
          <div className="text-white/50 italic" style={{ fontSize: "clamp(0.6rem, 1.8vw, 1rem)", letterSpacing: "0.35em", textTransform: "uppercase" }}>
            The
          </div>
          <div className="text-white font-bold italic" style={{ fontSize: "clamp(1.6rem, 5.5vw, 4.5rem)", lineHeight: 1, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            WATER IQ
          </div>
        </div>
      </div>

      {/* ── LEFT SIDEBAR — hidden on small phones, visible md+ ── */}
      <div className="hidden sm:flex absolute left-4 md:left-8 lg:left-12 top-1/2 -translate-y-1/2 z-30 flex-col gap-2 md:gap-2.5">
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex items-center gap-2 text-left">
            <motion.span
              animate={{ opacity: i === activeIndex ? 1 : 0, x: i === activeIndex ? 0 : -4 }}
              transition={{ duration: 0.3 }}
              className="text-white text-base leading-none"
            >·</motion.span>
            <span
              className="uppercase transition-all duration-300"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "clamp(0.48rem, 1.1vw, 0.68rem)",
                letterSpacing: "0.22em",
                fontWeight: i === activeIndex ? 700 : 400,
                color: i === activeIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.28)",
              }}
            >
              {s.shortName}
            </span>
          </button>
        ))}
      </div>

      {/* ── RIGHT SIDEBAR — hidden on small phones ── */}
      <div className="hidden sm:flex absolute right-4 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 z-30 flex-col gap-2 md:gap-2.5 items-end">
        {sections.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex items-center gap-2 text-right">
            <span
              className="uppercase transition-all duration-300"
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "clamp(0.48rem, 1.1vw, 0.68rem)",
                letterSpacing: "0.22em",
                fontWeight: i === activeIndex ? 700 : 400,
                color: i === activeIndex ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.28)",
              }}
            >
              {s.shortName}
            </span>
            <motion.span
              animate={{ opacity: i === activeIndex ? 1 : 0, x: i === activeIndex ? 0 : 4 }}
              transition={{ duration: 0.3 }}
              className="text-white text-base leading-none"
            >·</motion.span>
          </button>
        ))}
      </div>

      {/* ── CENTER TITLE + PROCEED ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 md:gap-7 px-8 sm:px-16 md:px-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 md:gap-6"
          >
            {/* Title */}
            <div
              className="text-white font-bold uppercase text-center leading-[0.88]"
              style={{
                fontFamily: "var(--font-instrument-serif), Georgia, serif",
                fontSize: "clamp(2.4rem, 13vw, 11rem)",
                letterSpacing: "-0.02em",
                textShadow: "0 2px 40px rgba(0,0,0,0.5)",
              }}
            >
              {active.name}
            </div>

            {/* Proceed button */}
            <motion.a
              href={active.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center gap-3 overflow-hidden"
              style={{
                padding: "10px 28px",
                border: "1px solid rgba(255,255,255,0.35)",
                backdropFilter: "blur(12px)",
                background: "rgba(255,255,255,0.07)",
                touchAction: "manipulation",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: "-110%" }}
                whileHover={{ x: "110%" }}
                transition={{ duration: 0.55, ease: "easeInOut" }}
                style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)" }}
              />
              <span
                className="relative text-white uppercase"
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "clamp(0.6rem, 1.2vw, 0.72rem)",
                  letterSpacing: "0.28em",
                  fontWeight: 600,
                }}
              >
                Proceed
              </span>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none" className="relative text-white opacity-60">
                <path d="M0 5H11M7 1L11 5L7 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── BOTTOM PROGRESS ── */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        {/* Dot nav — mobile friendly */}
        <div className="flex justify-center items-center gap-3 pb-4">
          {sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              className="flex items-center gap-2 transition-all duration-300"
              style={{ minWidth: 44, minHeight: 44, justifyContent: "center" }}
              aria-label={s.name}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  color: i === activeIndex ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.2)",
                  fontWeight: i === activeIndex ? 600 : 400,
                  display: "block",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative h-[1.5px] bg-white/10">
          <motion.div
            className="absolute top-0 left-0 h-full bg-white/55"
            animate={{ width: `${((activeIndex + 1) / sections.length) * 100}%` }}
            transition={{ duration: 0.65, ease: [0.32, 0.72, 0, 1] }}
          />
        </div>
      </div>

      {/* ── MOBILE SWIPE HINT (first visit only) ── */}
      <motion.div
        className="sm:hidden absolute bottom-16 left-0 right-0 flex justify-center z-30 pointer-events-none"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 2.5, duration: 1.5 }}
      >
        <span style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "0.55rem", letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
          swipe to navigate
        </span>
      </motion.div>
    </div>
  );
}
