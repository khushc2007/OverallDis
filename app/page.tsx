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
    const s: { id:number; x:number; y:number; r:number; delay:number; dur:number }[] = [];
    let seed = 42;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    for (let i = 0; i < 220; i++) {
      s.push({ id:i, x:rand()*100, y:rand()*100, r:rand()*1.4+0.25, delay:rand()*7, dur:rand()*3+2 });
    }
    return s;
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map(s => (
        <span key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, borderRadius:"50%", background:"#fff", animation:`wiq-star ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
      <style>{`@keyframes wiq-star { 0%{opacity:0.04;transform:scale(0.8)} 100%{opacity:0.7;transform:scale(1.25)} }`}</style>
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
    const h = (e: WheelEvent) => { e.preventDefault(); if (Math.abs(e.deltaY) > 15) navigate(e.deltaY > 0 ? 1 : -1); };
    window.addEventListener("wheel", h, { passive: false });
    return () => window.removeEventListener("wheel", h);
  }, [navigate]);

  useEffect(() => {
    const ts = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; touchStartX.current = e.touches[0].clientX; };
    const te = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
      if (Math.abs(dy) > 40 && Math.abs(dy) > dx) navigate(dy > 0 ? 1 : -1);
    };
    window.addEventListener("touchstart", ts, { passive: true });
    window.addEventListener("touchend", te, { passive: true });
    return () => { window.removeEventListener("touchstart", ts); window.removeEventListener("touchend", te); };
  }, [navigate]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  navigate(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [navigate]);

  const active = SECTIONS[activeIndex];
  const MONO = "var(--font-geist-mono), 'Courier New', monospace";
  const SERIF = "var(--font-instrument-serif), Georgia, serif";

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none touch-none" style={{ cursor:"default" }}>

      {/* ── Z0: Stars ── */}
      <StarField />

      {/* ── Z1: UnicornStudio animation — FULL SCREEN background ──
          Desktop: fills entire screen, figure naturally sits left-centre in the composition.
          Mobile:  same full-screen fill; we use a scale+translate to force the Sisyphus
                   figure to be perfectly centred and fully within the frame.             */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">

        {/* Desktop — full screen, no transforms */}
        <div className="hidden lg:block" style={{ position:"absolute", inset:0 }}>
          <HeroAsciiOne />
        </div>

        {/* Mobile — scale up and shift so Sisyphus is centred & fully in-frame.
            UnicornStudio renders its canvas at a fixed internal resolution (~1920×1080 landscape).
            On portrait mobile we need to zoom in on the figure and centre it.
            The figure in the original comp sits roughly at x=30%, y=50% of the canvas.
            We scale to cover height, then translate to bring the figure to dead centre.      */}
        <div
          className="lg:hidden"
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
          }}
        >
          {/* Inner wrapper: scale the canvas so it fully covers the portrait viewport,
              centred on the Sisyphus figure (roughly the left-centre of the landscape canvas). */}
          <div style={{
            position: "absolute",
            // The canvas is landscape 16:9. To cover a portrait screen we scale it
            // so its height fills the viewport height, then shift left to centre on the figure.
            // Scale factor: vh / (vw * 9/16) but we want it bigger → use 180% of viewport height.
            width: "200vh",       // wide enough that the canvas doesn't repeat
            height: "100vh",
            left: "50%",
            top: 0,
            // The Sisyphus figure is at ~30% from left in the original canvas.
            // Shift: move left 30% of the container width to centre the figure horizontally.
            transform: "translateX(-30%)",
          }}>
            <HeroAsciiOne />
          </div>
        </div>

      </div>

      {/* ── Z2: Gradient vignettes — keep text readable ── */}
      {/* Desktop: darken right half more so the CTA text pops */}
      <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none" style={{
        background: `
          linear-gradient(to right,
            transparent 25%,
            rgba(0,0,0,0.3) 48%,
            rgba(0,0,0,0.72) 68%,
            rgba(0,0,0,0.85) 100%
          ),
          linear-gradient(to bottom,
            rgba(0,0,0,0.4) 0%,
            transparent 12%,
            transparent 82%,
            rgba(0,0,0,0.55) 100%
          )
        `,
      }} />
      {/* Mobile: top+bottom fade, keep middle clear for the figure */}
      <div className="lg:hidden absolute inset-0 z-20 pointer-events-none" style={{
        background: `linear-gradient(to bottom,
          rgba(0,0,0,0.6) 0%,
          rgba(0,0,0,0.15) 18%,
          rgba(0,0,0,0.0) 35%,
          rgba(0,0,0,0.0) 58%,
          rgba(0,0,0,0.55) 75%,
          rgba(0,0,0,0.88) 100%
        )`,
      }} />

      {/* ── Z3: Corner accents ── */}
      {(["tl","tr","bl","br"] as const).map(p => (
        <div key={p} className="absolute z-50 pointer-events-none" style={{
          width:36, height:36,
          top:    p[0]==="t" ? 0 : "auto", bottom: p[0]==="b" ? 0 : "auto",
          left:   p[1]==="l" ? 0 : "auto", right:  p[1]==="r" ? 0 : "auto",
          borderTop:    p[0]==="t" ? "1px solid rgba(255,255,255,0.2)" : "none",
          borderBottom: p[0]==="b" ? "1px solid rgba(255,255,255,0.2)" : "none",
          borderLeft:   p[1]==="l" ? "1px solid rgba(255,255,255,0.2)" : "none",
          borderRight:  p[1]==="r" ? "1px solid rgba(255,255,255,0.2)" : "none",
        }} />
      ))}

      {/* ── Z4: Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"10px 24px" }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily:MONO, fontSize:13, fontWeight:700, letterSpacing:"0.3em", color:"rgba(255,255,255,0.55)", fontStyle:"italic", display:"inline-block", transform:"skewX(-8deg)" }}>
            WATER IQ
          </span>
          <div style={{ width:1, height:12, background:"rgba(255,255,255,0.18)" }} />
          <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.22em", color:"rgba(255,255,255,0.22)" }}>EST. 2025</span>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.18)" }}>LAT: 12.9716°</span>
          <span style={{ color:"rgba(255,255,255,0.18)", fontSize:9 }}>·</span>
          <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.16em", color:"rgba(255,255,255,0.18)" }}>LONG: 77.5946°</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP LAYOUT
          Left sidebar  — vertically centred, left edge
          Right sidebar — vertically centred, right edge
          Center panel  — true screen centre, section name + CTA
          WATER IQ heading — top-right, not conflicting
      ══════════════════════════════════════════════ */}

      {/* Desktop — WATER IQ block, anchored top-right, clear of center */}
      <div className="hidden lg:flex absolute z-30 pointer-events-none flex-col items-end"
        style={{ top:64, right:40 }}>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:11, letterSpacing:"0.45em", color:"rgba(255,255,255,0.28)", textTransform:"uppercase", marginBottom:2 }}>The</span>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.8rem,3.2vw,3rem)", letterSpacing:"0.05em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>
          WATER IQ
        </span>
        <div className="flex gap-0.5 mt-1.5 mb-1" style={{ opacity:0.28 }}>
          {Array.from({length:20}).map((_,i)=>(
            <div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />
          ))}
        </div>
        <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.28em", color:"rgba(255,255,255,0.22)", textTransform:"uppercase" }}>
          What would you like to explore?
        </span>
      </div>

      {/* Desktop — Left sidebar nav (bigger labels, centred vertically) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-5"
        style={{ left:32, top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, padding:"4px 0" }}>
            <motion.div
              animate={{ width: i===activeIndex ? 28 : 10, opacity: i===activeIndex ? 1 : 0.22 }}
              transition={{ duration:0.35 }}
              style={{ height:1.5, background:"#fff", flexShrink:0 }}
            />
            <span style={{
              fontFamily: MONO,
              fontSize: i===activeIndex ? 13 : 11,
              letterSpacing:"0.2em",
              textTransform:"uppercase",
              fontWeight: i===activeIndex ? 700 : 400,
              color: i===activeIndex ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)",
              transition:"all 0.3s",
            }}>{s.short}</span>
          </button>
        ))}
      </div>

      {/* Desktop — Right sidebar nav (bigger labels, centred vertically) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-5 items-end"
        style={{ right:32, top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, padding:"4px 0" }}>
            <span style={{
              fontFamily: MONO,
              fontSize: i===activeIndex ? 13 : 11,
              letterSpacing:"0.2em",
              textTransform:"uppercase",
              fontWeight: i===activeIndex ? 700 : 400,
              color: i===activeIndex ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.3)",
              transition:"all 0.3s",
            }}>{s.short}</span>
            <motion.div
              animate={{ width: i===activeIndex ? 28 : 10, opacity: i===activeIndex ? 1 : 0.22 }}
              transition={{ duration:0.35 }}
              style={{ height:1.5, background:"#fff", flexShrink:0 }}
            />
          </button>
        ))}
      </div>

      {/* Desktop — Active section: TRUE screen centre, independent of sidebar positions.
          Sizing is deliberately moderate so it doesn't clash with the sidebars.            */}
      <div className="hidden lg:flex absolute inset-0 z-30 items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + "-d"}
            initial={{ opacity:0, y:24, filter:"blur(8px)" }}
            animate={{ opacity:1, y:0,  filter:"blur(0px)" }}
            exit={{   opacity:0, y:-18, filter:"blur(6px)" }}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20 }}
          >
            {/* Counter */}
            <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.3em", color:"rgba(255,255,255,0.32)", textTransform:"uppercase" }}>
              {String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}
            </span>

            {/* Section name — moderate size, centred, won't clip into sidebars */}
            <div style={{
              fontFamily: SERIF,
              fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(2.5rem,6vw,6rem)",
              lineHeight:0.88,
              letterSpacing:"-0.02em",
              color:"#fff",
              textAlign:"center",
              textShadow:"0 4px 50px rgba(0,0,0,0.7)",
              textTransform:"uppercase",
              // Constrain width so it never reaches the sidebars (which are ~120px from edge)
              maxWidth:"46vw",
            }}>
              {active.name}
            </div>

            {/* Dot separator */}
            <div style={{ display:"flex", gap:4, opacity:0.25 }}>
              {Array.from({length:20}).map((_,i)=>(
                <div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />
              ))}
            </div>

            {/* Proceed CTA */}
            <motion.a
              href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto relative flex items-center gap-3 overflow-hidden group"
              style={{
                padding:"10px 28px",
                border:"1px solid rgba(255,255,255,0.32)",
                backdropFilter:"blur(14px)",
                background:"rgba(255,255,255,0.06)",
                textDecoration:"none",
              }}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x:"-110%" }} whileHover={{ x:"110%" }}
                transition={{ duration:0.5, ease:"easeInOut" }}
                style={{ background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)" }}
              />
              <span style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.28em", fontWeight:600, color:"#fff", textTransform:"uppercase" }}>
                Proceed
              </span>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>

            <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:"0.2em", color:"rgba(255,255,255,0.18)", textTransform:"uppercase" }}>
              ∞ SISYPHUS.PROTOCOL
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════
          MOBILE LAYOUT
          - WATER IQ: small, top-centre
          - Animation: full screen, Sisyphus centred via wrapper transform
          - Section name + Proceed: bottom-centre above the segment bar
          - 4-segment bar: very bottom
      ══════════════════════════════════════════════ */}

      {/* Mobile — WATER IQ top-centre */}
      <div className="lg:hidden absolute z-30 pointer-events-none flex flex-col items-center"
        style={{ top:"clamp(2.6rem,6vh,4rem)", left:0, right:0 }}>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:10, letterSpacing:"0.45em", color:"rgba(255,255,255,0.28)", textTransform:"uppercase" }}>
          The
        </span>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.5rem,7vw,2.4rem)", letterSpacing:"0.06em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>
          WATER IQ
        </span>
        <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:"0.2em", color:"rgba(255,255,255,0.22)", textTransform:"uppercase", marginTop:3 }}>
          — Explore —
        </span>
      </div>

      {/* Mobile — Section name + CTA, bottom-centre */}
      <div className="lg:hidden absolute inset-0 z-30 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom:"clamp(3.2rem,9vh,5.5rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + "-m"}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}
          >
            <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.25em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
              {String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}
            </span>
            <div style={{
              fontFamily:SERIF, fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(1.9rem,10vw,3.5rem)",
              lineHeight:0.88, color:"#fff",
              textAlign:"center", textTransform:"uppercase",
              letterSpacing:"-0.01em",
              textShadow:"0 2px 30px rgba(0,0,0,0.8)",
            }}>
              {active.name}
            </div>
            <a href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-2"
              style={{ padding:"8px 22px", border:"1px solid rgba(255,255,255,0.28)", background:"rgba(0,0,0,0.35)", backdropFilter:"blur(10px)", textDecoration:"none" }}>
              <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.26em", color:"#fff", textTransform:"uppercase" }}>Proceed</span>
              <svg width="10" height="9" viewBox="0 0 12 10" fill="none">
                <path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ── */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        {/* Desktop: numbered dots */}
        <div className="hidden lg:flex justify-center items-center gap-1 pb-3">
          {SECTIONS.map((s, i) => (
            <button key={s.id} onClick={() => goTo(i)}
              style={{ minWidth:44, minHeight:44, display:"flex", alignItems:"center", justifyContent:"center", background:"none", border:"none", cursor:"pointer" }}
              aria-label={s.name}>
              <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.12em", color: i===activeIndex ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.18)", fontWeight: i===activeIndex ? 700 : 400, transition:"color 0.3s" }}>
                {String(i+1).padStart(2,"0")}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile: 4-segment bars */}
        <div className="lg:hidden flex gap-2 px-6 pb-3">
          {SECTIONS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={SECTIONS[i].name}
              style={{ flex:1, height:2, borderRadius:1, border:"none", cursor:"pointer", minHeight:18, background: i===activeIndex ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)", transition:"background 0.4s" }}
            />
          ))}
        </div>

        {/* Progress track */}
        <div style={{ position:"relative", height:1.5, background:"rgba(255,255,255,0.07)" }}>
          <motion.div
            style={{ position:"absolute", top:0, left:0, height:"100%", background:"rgba(255,255,255,0.5)" }}
            animate={{ width:`${((activeIndex+1)/SECTIONS.length)*100}%` }}
            transition={{ duration:0.65, ease:[0.32,0.72,0,1] }}
          />
        </div>
      </div>

      {/* Mobile swipe hint */}
      <motion.div className="lg:hidden absolute z-40 flex justify-center pointer-events-none"
        style={{ bottom:50, left:0, right:0 }}
        initial={{ opacity:0.45 }} animate={{ opacity:0 }} transition={{ delay:2.5, duration:1.5 }}>
        <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:"0.25em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
          swipe to navigate
        </span>
      </motion.div>
    </div>
  );
}
