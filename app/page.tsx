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

/* ── Twinkling star field ── */
function StarField() {
  const stars = React.useMemo(() => {
    const s: { id:number; x:number; y:number; size:number; delay:number; dur:number; opacity:number }[] = [];
    let seed = 42;
    const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
    for (let i = 0; i < 220; i++) {
      s.push({ id:i, x:rand()*100, y:rand()*100, size:rand()*1.5+0.25, delay:rand()*7, dur:rand()*3+2, opacity:rand()*0.5+0.08 });
    }
    return s;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map(s => (
        <span key={s.id} style={{
          position:"absolute", left:`${s.x}%`, top:`${s.y}%`,
          width:s.size, height:s.size, borderRadius:"50%", background:"#fff",
          opacity:s.opacity,
          animation:`twinkle-star ${s.dur}s ${s.delay}s ease-in-out infinite alternate`,
        }} />
      ))}
      <style>{`
        @keyframes twinkle-star {
          0%   { opacity: 0.05; transform: scale(0.85); }
          100% { opacity: 0.75; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}

/* ── Main page ── */
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
    const s = (e: TouchEvent) => { touchStartY.current = e.touches[0].clientY; touchStartX.current = e.touches[0].clientX; };
    const e2 = (e: TouchEvent) => {
      const dy = touchStartY.current - e.changedTouches[0].clientY;
      const dx = Math.abs(touchStartX.current - e.changedTouches[0].clientX);
      if (Math.abs(dy) > 40 && Math.abs(dy) > dx) navigate(dy > 0 ? 1 : -1);
    };
    window.addEventListener("touchstart", s, { passive: true });
    window.addEventListener("touchend", e2, { passive: true });
    return () => { window.removeEventListener("touchstart", s); window.removeEventListener("touchend", e2); };
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

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none touch-none" style={{ cursor: "default" }}>

      {/* ── Layer 0: Stars — full screen, always ── */}
      <StarField />

      {/* ── Layer 1: UnicornStudio animation — full screen background, upright & centered ─────
           The UnicornStudio canvas renders the Sisyphus figure. We place it full-screen so it
           fills the entire viewport. On desktop the figure naturally sits left-center; on mobile
           we ensure it's centered with object-position tricks via CSS injected into hero-ascii-one.
      ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* Global style to force the UnicornStudio canvas upright, full-screen, centered */}
        <style>{`
          /* Remove the bottom-crop that was hiding branding — we handle centering differently */
          [data-us-project] canvas {
            clip-path: none !important;
          }
          /* Make the canvas fill and center properly */
          [data-us-project] {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
          /* On mobile: scale and center the Sisyphus figure */
          @media (max-width: 1023px) {
            [data-us-project] {
              transform: none !important;
            }
            [data-us-project] canvas {
              transform: none !important;
            }
          }
        `}</style>
        <HeroAsciiOne />
      </div>

      {/* ── Layer 2: Dark gradient vignette over animation — keeps text readable ── */}
      {/* Desktop: fade right half more so text pops */}
      <div
        className="absolute inset-0 z-20 pointer-events-none hidden lg:block"
        style={{
          background: `
            linear-gradient(to right, transparent 20%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.78) 100%),
            linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 15%, transparent 80%, rgba(0,0,0,0.5) 100%)
          `,
        }}
      />
      {/* Mobile: uniform soft vignette, strong on top+bottom for text */}
      <div
        className="absolute inset-0 z-20 pointer-events-none lg:hidden"
        style={{
          background: `
            linear-gradient(to bottom,
              rgba(0,0,0,0.55) 0%,
              rgba(0,0,0,0.1) 20%,
              rgba(0,0,0,0.05) 40%,
              rgba(0,0,0,0.05) 60%,
              rgba(0,0,0,0.6) 80%,
              rgba(0,0,0,0.85) 100%
            )
          `,
        }}
      />

      {/* ── Layer 3: Corner accents ── */}
      {(["tl","tr","bl","br"] as const).map(pos => (
        <div key={pos} className="absolute z-50 pointer-events-none" style={{
          width: "clamp(22px,3vw,40px)", height: "clamp(22px,3vw,40px)",
          top: pos[0]==="t" ? 0 : "auto", bottom: pos[0]==="b" ? 0 : "auto",
          left: pos[1]==="l" ? 0 : "auto", right: pos[1]==="r" ? 0 : "auto",
          borderTop:    pos[0]==="t" ? "1px solid rgba(255,255,255,0.22)" : "none",
          borderBottom: pos[0]==="b" ? "1px solid rgba(255,255,255,0.22)" : "none",
          borderLeft:   pos[1]==="l" ? "1px solid rgba(255,255,255,0.22)" : "none",
          borderRight:  pos[1]==="r" ? "1px solid rgba(255,255,255,0.22)" : "none",
        }} />
      ))}

      {/* ── Layer 3: Top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none"
        style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", padding:"11px clamp(1rem,3vw,2.5rem)" }}>
        <div className="flex items-center gap-3">
          <span style={{
            fontFamily:"var(--font-geist-mono),monospace",
            fontSize:"clamp(0.65rem,1.2vw,0.8rem)",
            fontWeight:700, letterSpacing:"0.32em",
            color:"rgba(255,255,255,0.6)",
            fontStyle:"italic",
            display:"inline-block", transform:"skewX(-8deg)",
          }}>WATER IQ</span>
          <div style={{ width:1, height:13, background:"rgba(255,255,255,0.18)" }} />
          <span style={{ fontSize:"0.48rem", letterSpacing:"0.25em", color:"rgba(255,255,255,0.25)" }}>EST. 2025</span>
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <span style={{ fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(255,255,255,0.2)" }}>LAT: 12.9716°</span>
          <div style={{ width:2, height:2, borderRadius:"50%", background:"rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(255,255,255,0.2)" }}>LONG: 77.5946°</span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP LAYOUT
          - "THE / WATER IQ / explore" anchored top-right
          - Active section name + Proceed CTA centered on right half
          - Left sidebar nav + Right sidebar nav flanking the center
      ═══════════════════════════════════════════════════════ */}

      {/* Desktop — WATER IQ heading block, top right */}
      <div className="hidden lg:flex absolute z-30 pointer-events-none flex-col items-end"
        style={{ top:"clamp(4rem,9vh,6rem)", right:"clamp(2.5rem,5vw,5rem)" }}>
        {/* Decorative top line */}
        <div className="flex items-center gap-2 mb-2 self-stretch justify-end opacity-40">
          <div style={{ flex:1, height:1, background:"#fff", maxWidth:80 }} />
          <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.55rem", color:"#fff" }}>∞</span>
        </div>
        <span style={{
          fontFamily:"var(--font-instrument-serif),Georgia,serif",
          fontStyle:"italic",
          fontSize:"clamp(0.55rem,0.95vw,0.7rem)",
          letterSpacing:"0.45em",
          color:"rgba(255,255,255,0.3)",
          textTransform:"uppercase",
          marginBottom:2,
        }}>The</span>
        <span style={{
          fontFamily:"var(--font-instrument-serif),Georgia,serif",
          fontStyle:"italic", fontWeight:700,
          fontSize:"clamp(2.2rem,5.5vw,5rem)",
          letterSpacing:"0.04em",
          textTransform:"uppercase",
          color:"#ffffff",
          lineHeight:0.95,
          textShadow:"0 0 80px rgba(255,255,255,0.08)",
        }}>WATER IQ</span>
        {/* Dot row */}
        <div className="flex gap-1 mt-2 mb-1.5 opacity-35">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />
          ))}
        </div>
        <span style={{
          fontFamily:"var(--font-geist-mono),monospace",
          fontSize:"clamp(0.38rem,0.65vw,0.52rem)",
          letterSpacing:"0.32em",
          color:"rgba(255,255,255,0.28)",
          textTransform:"uppercase",
        }}>— What would you like to explore? —</span>
      </div>

      {/* Desktop — Left sidebar nav */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-3"
        style={{ left:"clamp(1.8rem,4vw,4.5rem)", top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            className="flex items-center gap-3 text-left group" style={{ background:"none", border:"none", cursor:"pointer" }}>
            <motion.div
              animate={{ width: i===activeIndex ? 24 : 8, opacity: i===activeIndex ? 1 : 0.25 }}
              transition={{ duration: 0.35 }}
              style={{ height:1, background:"#fff", flexShrink:0 }}
            />
            <span style={{
              fontFamily:"var(--font-geist-mono),monospace",
              fontSize:"clamp(0.45rem,0.85vw,0.6rem)",
              letterSpacing:"0.22em", textTransform:"uppercase",
              fontWeight: i===activeIndex ? 700 : 400,
              color: i===activeIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
              transition:"color 0.3s",
            }}>{s.short}</span>
          </button>
        ))}
      </div>

      {/* Desktop — Right sidebar nav */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-3 items-end"
        style={{ right:"clamp(1.8rem,4vw,4.5rem)", top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            className="flex items-center gap-3" style={{ background:"none", border:"none", cursor:"pointer" }}>
            <span style={{
              fontFamily:"var(--font-geist-mono),monospace",
              fontSize:"clamp(0.45rem,0.85vw,0.6rem)",
              letterSpacing:"0.22em", textTransform:"uppercase",
              fontWeight: i===activeIndex ? 700 : 400,
              color: i===activeIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.22)",
              transition:"color 0.3s",
            }}>{s.short}</span>
            <motion.div
              animate={{ width: i===activeIndex ? 24 : 8, opacity: i===activeIndex ? 1 : 0.25 }}
              transition={{ duration: 0.35 }}
              style={{ height:1, background:"#fff", flexShrink:0 }}
            />
          </button>
        ))}
      </div>

      {/* Desktop — Active section name + CTA, centered on right half */}
      <div className="hidden lg:flex absolute inset-0 z-30 items-center justify-end pointer-events-none"
        style={{ paddingRight:"clamp(3.5rem,9vw,10rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + "-d"}
            initial={{ opacity:0, y:30, filter:"blur(10px)" }}
            animate={{ opacity:1, y:0,  filter:"blur(0px)" }}
            exit={{   opacity:0, y:-20, filter:"blur(8px)" }}
            transition={{ duration:0.55, ease:[0.22,1,0.36,1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Section index badge */}
            <div className="flex items-center gap-3 opacity-40" style={{ alignSelf:"stretch", justifyContent:"center" }}>
              <div style={{ flex:1, height:"1px", background:"#fff", maxWidth:40 }} />
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.52rem", letterSpacing:"0.25em", color:"#fff" }}>
                {String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}
              </span>
              <div style={{ flex:1, height:"1px", background:"#fff", maxWidth:40 }} />
            </div>

            {/* Big section name */}
            <div style={{
              fontFamily:"var(--font-instrument-serif),Georgia,serif",
              fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(3rem,9.5vw,9.5rem)",
              lineHeight:0.85, letterSpacing:"-0.025em",
              color:"#fff", textAlign:"center",
              textShadow:"0 4px 60px rgba(0,0,0,0.6)",
              textTransform:"uppercase",
            }}>
              {active.name}
            </div>

            {/* Dither dots */}
            <div className="flex gap-1 opacity-30">
              {Array.from({ length: 32 }).map((_, i) => (
                <div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />
              ))}
            </div>

            {/* Proceed button */}
            <motion.a
              href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto relative flex items-center gap-3 overflow-hidden group"
              style={{
                padding:"11px 32px",
                border:"1px solid rgba(255,255,255,0.35)",
                backdropFilter:"blur(16px)",
                background:"rgba(255,255,255,0.07)",
                textDecoration:"none",
              }}
              whileHover={{ scale:1.04, borderColor:"rgba(255,255,255,0.6)" }}
              whileTap={{ scale:0.96 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x:"-110%" }}
                whileHover={{ x:"110%" }}
                transition={{ duration:0.5, ease:"easeInOut" }}
                style={{ background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.12) 50%,transparent 70%)" }}
              />
              {/* Corner accents on button */}
              <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/0 group-hover:border-white/60 transition-all duration-200" />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/0 group-hover:border-white/60 transition-all duration-200" />
              <span style={{
                fontFamily:"var(--font-geist-mono),monospace",
                fontSize:"clamp(0.58rem,0.95vw,0.72rem)",
                letterSpacing:"0.3em", fontWeight:600,
                color:"#fff", textTransform:"uppercase",
              }}>Proceed</span>
              <svg width="13" height="11" viewBox="0 0 12 10" fill="none">
                <path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>

            {/* SISYPHUS.PROTOCOL tag */}
            <div className="flex items-center gap-2 opacity-25">
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.45rem", letterSpacing:"0.25em", color:"#fff" }}>∞</span>
              <div style={{ width:60, height:1, background:"#fff" }} />
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.45rem", letterSpacing:"0.2em", color:"#fff" }}>SISYPHUS.PROTOCOL</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MOBILE LAYOUT
          - "WATER IQ" top center (small)
          - Animation fills full screen (Sisyphus centered naturally)
          - Active section name + Proceed bottom center
          - 4-segment bar at very bottom
      ═══════════════════════════════════════════════════════ */}

      {/* Mobile — WATER IQ top */}
      <div className="lg:hidden absolute z-30 pointer-events-none flex flex-col items-center"
        style={{ top:"clamp(2.8rem,6vh,4.2rem)", left:0, right:0 }}>
        <span style={{
          fontFamily:"var(--font-instrument-serif),Georgia,serif",
          fontStyle:"italic", fontSize:"0.56rem",
          letterSpacing:"0.45em", color:"rgba(255,255,255,0.3)",
          textTransform:"uppercase",
        }}>The</span>
        <span style={{
          fontFamily:"var(--font-instrument-serif),Georgia,serif",
          fontStyle:"italic", fontWeight:700,
          fontSize:"clamp(1.6rem,7.5vw,2.5rem)",
          letterSpacing:"0.06em", textTransform:"uppercase",
          color:"#fff", lineHeight:1,
        }}>WATER IQ</span>
        <span style={{
          fontFamily:"var(--font-geist-mono),monospace",
          fontSize:"0.44rem", letterSpacing:"0.22em",
          color:"rgba(255,255,255,0.25)", textTransform:"uppercase",
          marginTop:3,
        }}>— Explore —</span>
      </div>

      {/* Mobile — Active section name + CTA, bottom */}
      <div className="lg:hidden absolute inset-0 z-30 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom:"clamp(3.5rem,10vh,6rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id + "-m"}
            initial={{ opacity:0, y:18 }}
            animate={{ opacity:1, y:0 }}
            exit={{   opacity:0, y:-14 }}
            transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
            className="flex flex-col items-center gap-3"
          >
            <span style={{
              fontFamily:"var(--font-geist-mono),monospace",
              fontSize:"0.48rem", letterSpacing:"0.25em",
              color:"rgba(255,255,255,0.35)", textTransform:"uppercase",
            }}>{String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}</span>
            <div style={{
              fontFamily:"var(--font-instrument-serif),Georgia,serif",
              fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(2rem,11vw,3.8rem)",
              lineHeight:0.88, color:"#fff",
              textAlign:"center", textTransform:"uppercase",
              letterSpacing:"-0.01em",
              textShadow:"0 2px 30px rgba(0,0,0,0.7)",
            }}>
              {active.name}
            </div>
            <a
              href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-2 mt-1"
              style={{
                padding:"9px 24px",
                border:"1px solid rgba(255,255,255,0.3)",
                background:"rgba(0,0,0,0.3)",
                backdropFilter:"blur(12px)",
                textDecoration:"none",
              }}
            >
              <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.56rem", letterSpacing:"0.28em", color:"#fff", textTransform:"uppercase" }}>Proceed</span>
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
              <span style={{
                fontFamily:"var(--font-geist-mono),monospace",
                fontSize:"0.52rem", letterSpacing:"0.12em",
                color: i===activeIndex ? "rgba(255,255,255,0.78)" : "rgba(255,255,255,0.18)",
                fontWeight: i===activeIndex ? 700 : 400,
                transition:"color 0.3s",
              }}>{String(i+1).padStart(2,"0")}</span>
            </button>
          ))}
        </div>

        {/* Mobile: 4-segment bars */}
        <div className="lg:hidden flex gap-2 px-6 pb-3">
          {SECTIONS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={SECTIONS[i].name}
              style={{
                flex:1, height:"2px", borderRadius:1, border:"none", cursor:"pointer",
                background: i===activeIndex ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.15)",
                transition:"background 0.4s",
                minHeight:20, display:"flex", alignItems:"flex-start",
                paddingTop:0,
              }}
            />
          ))}
        </div>

        {/* Progress track */}
        <div className="relative" style={{ height:"1.5px", background:"rgba(255,255,255,0.07)" }}>
          <motion.div
            className="absolute top-0 left-0 h-full"
            style={{ background:"rgba(255,255,255,0.5)" }}
            animate={{ width:`${((activeIndex+1)/SECTIONS.length)*100}%` }}
            transition={{ duration:0.65, ease:[0.32,0.72,0,1] }}
          />
        </div>
      </div>

      {/* Mobile swipe hint */}
      <motion.div
        className="lg:hidden absolute z-40 flex justify-center pointer-events-none"
        style={{ bottom:52, left:0, right:0 }}
        initial={{ opacity:0.5 }} animate={{ opacity:0 }}
        transition={{ delay:2.5, duration:1.5 }}
      >
        <span style={{ fontFamily:"var(--font-geist-mono),monospace", fontSize:"0.48rem", letterSpacing:"0.25em", color:"rgba(255,255,255,0.32)", textTransform:"uppercase" }}>
          swipe to navigate
        </span>
      </motion.div>
    </div>
  );
}
