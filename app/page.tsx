"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const HeroAsciiOne = dynamic(
  () => import("@/components/ui/hero-ascii-one"),
  { ssr: false }
);

const SECTIONS = [
  { id: "project",   name: "Project Info", short: "Project",   href: "https://0-2-xi.vercel.app/" },
  { id: "dashboard", name: "Dashboard",    short: "Dashboard", href: "https://login-jdj8.vercel.app/" },
  { id: "model",     name: "3D Model",     short: "3D Model",  href: "https://chamber3d.vercel.app/" },
  { id: "team",      name: "Team Info",    short: "Team",      href: "https://team-info-iau3.vercel.app/" },
] as const;

function StarField() {
  const stars = React.useMemo(() => {
    const s = [];
    let seed = 42;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    for (let i = 0; i < 180; i++) {
      s.push({ id: i, x: rand() * 100, y: rand() * 100, size: rand() * 1.4 + 0.3, delay: rand() * 6, dur: rand() * 3 + 2, opacity: rand() * 0.55 + 0.1 });
    }
    return s;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map(s => (
        <span key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.size, height:s.size, borderRadius:"50%", background:"#fff", opacity:s.opacity, animation:`twinkle ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
      <style>{`@keyframes twinkle { 0%{opacity:0.08;transform:scale(0.9)} 100%{opacity:0.75;transform:scale(1.15)} }`}</style>
    </div>
  );
}

export default function WaterIQHome() {
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
      if (next < 0 || next >= SECTIONS.length) { setIsTransitioning(false); return prev; }
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
    const onWheel = (e: WheelEvent) => { e.preventDefault(); if (Math.abs(e.deltaY) > 15) navigate(e.deltaY > 0 ? 1 : -1); };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [navigate]);

  useEffect(() => {
    const onTS = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; touchStartX.current = e.touches[0].clientX; };
    const onTE = (e: TouchEvent) => { const dy = touchStartY.current - e.changedTouches[0].clientY; const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX); if (Math.abs(dy) > 40 && Math.abs(dy) > dx) navigate(dy > 0 ? 1 : -1); };
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchend", onTE, { passive: true });
    return () => { window.removeEventListener("touchstart", onTS); window.removeEventListener("touchend", onTE); };
  }, [navigate]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key==="ArrowDown"||e.key==="ArrowRight") navigate(1); if (e.key==="ArrowUp"||e.key==="ArrowLeft") navigate(-1); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const active = SECTIONS[activeIndex];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none cursor-default touch-none">

      {/* Stars */}
      <StarField />

      {/* UnicornStudio Sisyphus */}
      {/* Desktop: left 52% */}
      <div className="hidden lg:block absolute z-10 pointer-events-none" style={{ left:0, top:0, width:"52%", height:"100%" }}>
        <HeroAsciiOne />
      </div>
      {/* Mobile: centered upper 62vh */}
      <div className="lg:hidden absolute z-10 pointer-events-none" style={{ left:"50%", top:0, transform:"translateX(-50%)", width:"100vw", height:"62vh" }}>
        <HeroAsciiOne />
      </div>

      {/* Corner accents */}
      <div className="absolute z-50 pointer-events-none" style={{ top:0, left:0, width:"clamp(20px,3vw,36px)", height:"clamp(20px,3vw,36px)", borderTop:"1px solid rgba(255,255,255,0.2)", borderLeft:"1px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute z-50 pointer-events-none" style={{ top:0, right:0, width:"clamp(20px,3vw,36px)", height:"clamp(20px,3vw,36px)", borderTop:"1px solid rgba(255,255,255,0.2)", borderRight:"1px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute z-50 pointer-events-none" style={{ bottom:0, left:0, width:"clamp(20px,3vw,36px)", height:"clamp(20px,3vw,36px)", borderBottom:"1px solid rgba(255,255,255,0.2)", borderLeft:"1px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute z-50 pointer-events-none" style={{ bottom:0, right:0, width:"clamp(20px,3vw,36px)", height:"clamp(20px,3vw,36px)", borderBottom:"1px solid rgba(255,255,255,0.2)", borderRight:"1px solid rgba(255,255,255,0.2)" }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none" style={{ borderBottom:"1px solid rgba(255,255,255,0.08)", padding:"10px clamp(1rem,3vw,2rem)" }}>
        <div className="flex items-center gap-2.5">
          <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"clamp(0.65rem,1.3vw,0.82rem)", fontWeight:700, letterSpacing:"0.3em", color:"rgba(255,255,255,0.65)", fontStyle:"italic", display:"inline-block", transform:"skewX(-8deg)" }}>WATER IQ</span>
          <div style={{ width:1, height:14, background:"rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize:"0.5rem", letterSpacing:"0.25em", color:"rgba(255,255,255,0.28)" }}>EST. 2025</span>
        </div>
        <span className="hidden lg:block" style={{ fontSize:"0.55rem", letterSpacing:"0.15em", color:"rgba(255,255,255,0.22)" }}>LAT: 12.9716° · LONG: 77.5946°</span>
      </div>

      {/* Desktop header — right side, top */}
      <div className="hidden lg:flex absolute z-30 pointer-events-none flex-col items-end gap-0.5" style={{ top:"clamp(3.5rem,8vh,5.5rem)", right:"clamp(2rem,6vw,6rem)" }}>
        <span style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontSize:"clamp(0.55rem,1vw,0.72rem)", letterSpacing:"0.4em", color:"rgba(255,255,255,0.32)", textTransform:"uppercase" }}>The</span>
        <span style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2rem,5vw,4.5rem)", letterSpacing:"0.06em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>WATER IQ</span>
        <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"clamp(0.4rem,0.75vw,0.56rem)", letterSpacing:"0.28em", color:"rgba(255,255,255,0.26)", textTransform:"uppercase", marginTop:4 }}>— What would you like to explore? —</span>
      </div>

      {/* Mobile header — top center */}
      <div className="lg:hidden absolute z-30 pointer-events-none flex flex-col items-center" style={{ top:"clamp(2.8rem,6vh,4rem)", left:0, right:0 }}>
        <span style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontSize:"0.58rem", letterSpacing:"0.4em", color:"rgba(255,255,255,0.32)", textTransform:"uppercase" }}>The</span>
        <span style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.7rem,8vw,2.8rem)", letterSpacing:"0.06em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>WATER IQ</span>
        <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.46rem", letterSpacing:"0.2em", color:"rgba(255,255,255,0.26)", textTransform:"uppercase", marginTop:3 }}>— Explore —</span>
      </div>

      {/* Left sidebar (desktop) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-2" style={{ left:"clamp(1.5rem,4vw,4rem)", bottom:"clamp(3rem,8vh,5rem)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex items-center gap-2.5 text-left">
            <motion.span animate={{ opacity: i===activeIndex?1:0, x: i===activeIndex?0:-4 }} transition={{ duration:0.3 }} style={{ color:"#fff", fontSize:"0.75rem", lineHeight:1 }}>·</motion.span>
            <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"clamp(0.44rem,0.9vw,0.6rem)", letterSpacing:"0.22em", textTransform:"uppercase", fontWeight: i===activeIndex?700:400, color: i===activeIndex?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.22)", transition:"color 0.3s" }}>{s.short}</span>
          </button>
        ))}
      </div>

      {/* Right sidebar (desktop) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-2 items-end" style={{ right:"clamp(1.5rem,4vw,4rem)", bottom:"clamp(3rem,8vh,5rem)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)} className="flex items-center gap-2.5">
            <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"clamp(0.44rem,0.9vw,0.6rem)", letterSpacing:"0.22em", textTransform:"uppercase", fontWeight: i===activeIndex?700:400, color: i===activeIndex?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.22)", transition:"color 0.3s" }}>{s.short}</span>
            <motion.span animate={{ opacity: i===activeIndex?1:0, x: i===activeIndex?0:4 }} transition={{ duration:0.3 }} style={{ color:"#fff", fontSize:"0.75rem", lineHeight:1 }}>·</motion.span>
          </button>
        ))}
      </div>

      {/* Active section — Desktop center-right */}
      <div className="hidden lg:flex absolute inset-0 z-20 items-center justify-end pointer-events-none" style={{ paddingRight:"clamp(3rem,8vw,9rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={active.id} initial={{ opacity:0, y:28, filter:"blur(8px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} exit={{ opacity:0, y:-18, filter:"blur(6px)" }} transition={{ duration:0.5, ease:[0.22,1,0.36,1] }} className="flex flex-col items-center gap-5">
            <div style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(2.8rem,9vw,9rem)", lineHeight:0.88, letterSpacing:"-0.02em", color:"#fff", textAlign:"center", textShadow:"0 2px 40px rgba(0,0,0,0.55)", textTransform:"uppercase" }}>
              {active.name}
            </div>
            <motion.a href={active.href} target="_blank" rel="noopener noreferrer" className="pointer-events-auto relative flex items-center gap-3 overflow-hidden" style={{ padding:"10px 28px", border:"1px solid rgba(255,255,255,0.3)", backdropFilter:"blur(12px)", background:"rgba(255,255,255,0.06)", textDecoration:"none" }} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
              <motion.div className="absolute inset-0 pointer-events-none" initial={{ x:"-110%" }} whileHover={{ x:"110%" }} transition={{ duration:0.55, ease:"easeInOut" }} style={{ background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)" }} />
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"clamp(0.55rem,0.9vw,0.68rem)", letterSpacing:"0.28em", fontWeight:600, color:"#fff", textTransform:"uppercase" }}>Proceed</span>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </motion.a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Active section — Mobile, below animation */}
      <div className="lg:hidden absolute inset-0 z-20 flex flex-col items-center justify-end pointer-events-none" style={{ paddingBottom:"clamp(4rem,12vh,7rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div key={active.id + "-m"} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }} transition={{ duration:0.45, ease:[0.22,1,0.36,1] }} className="flex flex-col items-center gap-4">
            <div style={{ fontFamily:"var(--font-instrument-serif),Georgia,serif", fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.9rem,10vw,3.5rem)", lineHeight:0.9, color:"#fff", textAlign:"center", textTransform:"uppercase", letterSpacing:"-0.01em" }}>
              {active.name}
            </div>
            <a href={active.href} target="_blank" rel="noopener noreferrer" className="pointer-events-auto flex items-center gap-2" style={{ padding:"8px 22px", border:"1px solid rgba(255,255,255,0.28)", background:"rgba(255,255,255,0.05)", textDecoration:"none" }}>
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.58rem", letterSpacing:"0.25em", color:"#fff", textTransform:"uppercase" }}>Proceed</span>
              <svg width="10" height="8" viewBox="0 0 12 10" fill="none"><path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* Desktop numbered dots */}
        <div className="hidden lg:flex justify-center items-center gap-2 pb-3">
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)} style={{ minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" }} aria-label={s.name}>
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.55rem", letterSpacing:"0.12em", color: i===activeIndex?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.18)", fontWeight: i===activeIndex?700:400, transition:"color 0.3s" }}>{String(i+1).padStart(2,"0")}</span>
            </button>
          ))}
        </div>

        {/* Mobile 4-segment bar */}
        <div className="lg:hidden flex gap-1.5 px-5 pb-2.5">
          {SECTIONS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={SECTIONS[i].name} style={{ flex:1, height:2, borderRadius:1, background: i===activeIndex?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.12)", transition:"background 0.4s", border:"none", cursor:"pointer", minHeight:20, display:"flex", alignItems:"flex-end" }} />
          ))}
        </div>

        {/* Progress track */}
        <div className="relative" style={{ height:1.5, background:"rgba(255,255,255,0.08)" }}>
          <motion.div className="absolute top-0 left-0 h-full" style={{ background:"rgba(255,255,255,0.5)" }} animate={{ width:`${((activeIndex+1)/SECTIONS.length)*100}%` }} transition={{ duration:0.65, ease:[0.32,0.72,0,1] }} />
        </div>
      </div>

      {/* Mobile swipe hint */}
      <motion.div className="lg:hidden absolute z-40 flex justify-center pointer-events-none" style={{ bottom:52, left:0, right:0 }} initial={{ opacity:0.5 }} animate={{ opacity:0 }} transition={{ delay:2.5, duration:1.5 }}>
        <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.5rem", letterSpacing:"0.25em", color:"rgba(255,255,255,0.35)", textTransform:"uppercase" }}>swipe to navigate</span>
      </motion.div>
    </div>
  );
}
