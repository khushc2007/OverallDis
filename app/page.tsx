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
    for (let i = 0; i < 300; i++) s.push({ id:i, x:rand()*100, y:rand()*100, r:rand()*1.6+0.3, delay:rand()*7, dur:rand()*3+2 });
    return s;
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map(s => (
        <span key={s.id} style={{ position:"absolute", left:`${s.x}%`, top:`${s.y}%`, width:s.r, height:s.r, borderRadius:"50%", background:"#fff", animation:`wiq-star ${s.dur}s ${s.delay}s ease-in-out infinite alternate` }} />
      ))}
      <style>{`@keyframes wiq-star{0%{opacity:0.04;transform:scale(0.8)}100%{opacity:0.7;transform:scale(1.25)}}`}</style>
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
  const MONO  = "var(--font-geist-mono),'Courier New',monospace";
  const SERIF = "var(--font-instrument-serif),Georgia,serif";

  return (
    <div className="fixed inset-0 overflow-hidden bg-black select-none touch-none" style={{ cursor:"default" }}>

      {/* ── Stars ── */}
      <StarField />

      {/* ════════════════════════════════════════════════════
          ANIMATION LAYER

          DESKTOP: full screen, no transforms — the UnicornStudio
          canvas fills the viewport naturally and the figure sits
          on the left-centre as intended.

          MOBILE: The UnicornStudio canvas is a 16:9 LANDSCAPE
          composition (~1920×1080). On a portrait phone (~390×844)
          we need to:
            1. Render the canvas at a large enough size that the
               figure fills the phone height.
            2. Pan horizontally so the figure (at ~27% from the
               left of the original canvas) is centred on screen.

          Strategy:
            - Set container to: width = 100vw, height = 100vh
            - Inside, render a div that is (100vh * 16/9) wide,
              so the canvas aspect ratio is preserved and height = 100vh
            - translateX to centre on the figure:
              figure is at ~27% of canvas width from left.
              canvas render width = 100vh * (16/9)
              figure X = 0.27 * canvasWidth
              to centre it: offset = 50vw - figureX
              = 50vw - 0.27 * (100vh * 16/9)
              In CSS: calc(50vw - 0.27 * (100vh * 1.778))
              ≈ calc(50vw - 48vh)
      ════════════════════════════════════════════════════ */}

      {/* Desktop animation — full screen */}
      <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
        <HeroAsciiOne />
      </div>

      {/* Mobile animation — zoomed to portrait, centred on figure */}
      <div
        className="lg:hidden absolute z-10 pointer-events-none"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/*
          Inner canvas holder:
          - Width: 100vh * (16/9) = 177.78vh → enough to contain the full canvas at full height
          - Height: 100vh
          - Left offset: shifts so the Sisyphus figure (~27% from left of canvas) is at screen centre
            offset = 50vw - (0.27 * canvasWidth) = 50vw - (0.27 * 177.78vh) = 50vw - 48vh
        */}
        <div style={{
          position: "absolute",
          top: 0,
          left: "calc(50vw - 40vh)",   // centres the figure horizontally
          width: "177.78vh",            // 16:9 aspect at full viewport height
          height: "100vh",
          flexShrink: 0,
        }}>
          <HeroAsciiOne />
        </div>
      </div>

      {/* ── Gradient vignettes ── */}
      {/* Desktop: darken right half for text legibility */}
      <div className="hidden lg:block absolute inset-0 z-20 pointer-events-none" style={{
        background:`linear-gradient(to right,
          transparent 22%,
          rgba(0,0,0,0.25) 45%,
          rgba(0,0,0,0.55) 65%,
          rgba(0,0,0,0.65) 100%
        ),linear-gradient(to bottom,
          rgba(0,0,0,0.42) 0%,
          transparent 12%,
          transparent 82%,
          rgba(0,0,0,0.55) 100%
        )`,
      }} />
      {/* Mobile: top+bottom fade, preserve clear middle for figure */}
      <div className="lg:hidden absolute inset-0 z-20 pointer-events-none" style={{
        background:`linear-gradient(to bottom,
          rgba(0,0,0,0.65) 0%,
          rgba(0,0,0,0.15) 16%,
          rgba(0,0,0,0.0)  32%,
          rgba(0,0,0,0.0)  60%,
          rgba(0,0,0,0.5)  75%,
          rgba(0,0,0,0.9)  100%
        )`,
      }} />

      {/* ── Corner accents ── */}
      {(["tl","tr","bl","br"] as const).map(p => (
        <div key={p} className="absolute z-50 pointer-events-none" style={{
          width:32, height:32,
          top:    p[0]==="t"?0:"auto", bottom: p[0]==="b"?0:"auto",
          left:   p[1]==="l"?0:"auto", right:  p[1]==="r"?0:"auto",
          borderTop:    p[0]==="t"?"1px solid rgba(255,255,255,0.2)":"none",
          borderBottom: p[0]==="b"?"1px solid rgba(255,255,255,0.2)":"none",
          borderLeft:   p[1]==="l"?"1px solid rgba(255,255,255,0.2)":"none",
          borderRight:  p[1]==="r"?"1px solid rgba(255,255,255,0.2)":"none",
        }} />
      ))}

      {/* ── Top bar ── */}
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

      {/* ════════════════════════════════════════════════════
          DESKTOP UI
      ════════════════════════════════════════════════════ */}

      {/* Desktop — WATER IQ heading, top-right */}
      <div className="hidden lg:flex absolute z-30 pointer-events-none flex-col items-end"
        style={{ top:62, right:40 }}>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:13, letterSpacing:"0.45em", color:"rgba(255,255,255,0.28)", textTransform:"uppercase", marginBottom:3 }}>The</span>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:700, fontSize:"clamp(2.4rem,4vw,3.8rem)", letterSpacing:"0.05em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>
          WATER IQ
        </span>
        <div className="flex gap-0.5 mt-1.5 mb-1" style={{ opacity:0.25 }}>
          {Array.from({length:26}).map((_,i)=>(<div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />))}
        </div>
        <span style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.26em", color:"rgba(255,255,255,0.2)", textTransform:"uppercase" }}>
          What would you like to explore?
        </span>
      </div>

      {/* Desktop — Left sidebar (vertically centred, bigger) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-5"
        style={{ left:32, top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, padding:"4px 0" }}>
            <motion.div
              animate={{ width:i===activeIndex?28:10, opacity:i===activeIndex?1:0.22 }}
              transition={{ duration:0.35 }}
              style={{ height:1.5, background:"#fff", flexShrink:0 }}
            />
            <span style={{
              fontFamily:MONO, fontSize:i===activeIndex?13:11,
              letterSpacing:"0.2em", textTransform:"uppercase",
              fontWeight:i===activeIndex?700:400,
              color:i===activeIndex?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.3)",
              transition:"all 0.3s",
            }}>{s.short}</span>
          </button>
        ))}
      </div>

      {/* Desktop — Right sidebar (vertically centred, bigger) */}
      <div className="hidden lg:flex absolute z-30 flex-col gap-5 items-end"
        style={{ right:32, top:"50%", transform:"translateY(-50%)" }}>
        {SECTIONS.map((s, i) => (
          <button key={s.id} onClick={() => goTo(i)}
            style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:12, padding:"4px 0" }}>
            <span style={{
              fontFamily:MONO, fontSize:i===activeIndex?13:11,
              letterSpacing:"0.2em", textTransform:"uppercase",
              fontWeight:i===activeIndex?700:400,
              color:i===activeIndex?"rgba(255,255,255,0.92)":"rgba(255,255,255,0.3)",
              transition:"all 0.3s",
            }}>{s.short}</span>
            <motion.div
              animate={{ width:i===activeIndex?28:10, opacity:i===activeIndex?1:0.22 }}
              transition={{ duration:0.35 }}
              style={{ height:1.5, background:"#fff", flexShrink:0 }}
            />
          </button>
        ))}
      </div>

      {/* Desktop — Section name + CTA, true screen centre */}
      <div className="hidden lg:flex absolute inset-0 z-30 items-center justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id+"-d"}
            initial={{ opacity:0, y:24, filter:"blur(8px)" }}
            animate={{ opacity:1, y:0, filter:"blur(0px)" }}
            exit={{   opacity:0, y:-18, filter:"blur(6px)" }}
            transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:18 }}
          >
            <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.3em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
              {String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}
            </span>
            <div style={{
              fontFamily:SERIF, fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(2.4rem,5.5vw,5.5rem)",
              lineHeight:0.88, letterSpacing:"-0.02em",
              color:"#fff", textAlign:"center",
              textShadow:"0 4px 50px rgba(0,0,0,0.7)",
              textTransform:"uppercase",
              maxWidth:"44vw",
            }}>
              {active.name}
            </div>
            <div style={{ display:"flex", gap:4, opacity:0.22 }}>
              {Array.from({length:26}).map((_,i)=>(<div key={i} style={{ width:2, height:2, borderRadius:"50%", background:"#fff" }} />))}
            </div>
            <motion.a
              href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto relative flex items-center gap-3 overflow-hidden"
              style={{ padding:"10px 28px", border:"1px solid rgba(255,255,255,0.3)", backdropFilter:"blur(14px)", background:"rgba(255,255,255,0.06)", textDecoration:"none" }}
              whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}
            >
              <motion.div className="absolute inset-0 pointer-events-none"
                initial={{ x:"-110%" }} whileHover={{ x:"110%" }}
                transition={{ duration:0.5, ease:"easeInOut" }}
                style={{ background:"linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.1) 50%,transparent 70%)" }}
              />
              <span style={{ fontFamily:MONO, fontSize:11, letterSpacing:"0.28em", fontWeight:600, color:"#fff", textTransform:"uppercase" }}>Proceed</span>
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M0 5H11M7 1L11 5L7 9" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>
            <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:"0.2em", color:"rgba(255,255,255,0.15)", textTransform:"uppercase" }}>
              ∞ SISYPHUS.PROTOCOL
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ════════════════════════════════════════════════════
          MOBILE UI
          Everything z-30 or above. The animation is z-10,
          vignette z-20, UI z-30+.
          No sidebars on mobile — they caused the overlap issue.
      ════════════════════════════════════════════════════ */}

      {/* Mobile — WATER IQ top-centre */}
      <div className="lg:hidden absolute z-30 pointer-events-none flex flex-col items-center"
        style={{ top:"clamp(2.6rem,6vh,4rem)", left:0, right:0 }}>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontSize:10, letterSpacing:"0.42em", color:"rgba(255,255,255,0.28)", textTransform:"uppercase" }}>The</span>
        <span style={{ fontFamily:SERIF, fontStyle:"italic", fontWeight:700, fontSize:"clamp(1.5rem,7vw,2.2rem)", letterSpacing:"0.06em", textTransform:"uppercase", color:"#fff", lineHeight:1 }}>
          WATER IQ
        </span>
        <span style={{ fontFamily:MONO, fontSize:8, letterSpacing:"0.2em", color:"rgba(255,255,255,0.2)", textTransform:"uppercase", marginTop:3 }}>
          — Explore —
        </span>
      </div>

      {/* Mobile — Section name + CTA, bottom-centre */}
      <div className="lg:hidden absolute inset-0 z-30 flex flex-col items-center justify-end pointer-events-none"
        style={{ paddingBottom:"clamp(3.2rem,9vh,5.5rem)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id+"-m"}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            transition={{ duration:0.4, ease:[0.22,1,0.36,1] }}
            style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}
          >
            <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:"0.25em", color:"rgba(255,255,255,0.3)", textTransform:"uppercase" }}>
              {String(activeIndex+1).padStart(2,"0")} / {String(SECTIONS.length).padStart(2,"0")}
            </span>
            <div style={{
              fontFamily:SERIF, fontStyle:"italic", fontWeight:700,
              fontSize:"clamp(1.9rem,10vw,3.2rem)",
              lineHeight:0.88, color:"#fff",
              textAlign:"center", textTransform:"uppercase",
              letterSpacing:"-0.01em",
              textShadow:"0 2px 30px rgba(0,0,0,0.9)",
            }}>
              {active.name}
            </div>
            <a href={active.href} target="_blank" rel="noopener noreferrer"
              className="pointer-events-auto flex items-center gap-2 mt-1"
              style={{ padding:"8px 22px", border:"1px solid rgba(255,255,255,0.28)", background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)", textDecoration:"none" }}>
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
              <span style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.12em", color:i===activeIndex?"rgba(255,255,255,0.75)":"rgba(255,255,255,0.18)", fontWeight:i===activeIndex?700:400, transition:"color 0.3s" }}>
                {String(i+1).padStart(2,"0")}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile: 4-segment bars */}
        <div className="lg:hidden flex gap-2 px-6 pb-3">
          {SECTIONS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={SECTIONS[i].name}
              style={{ flex:1, height:2, borderRadius:1, border:"none", cursor:"pointer", minHeight:18, background:i===activeIndex?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.15)", transition:"background 0.4s" }}
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

      {/* Badge cover — desktop only.
          The UnicornStudio badge sits at z-index 2147483647 (max int), fixed, bottom-center.
          We use z-index 2147483646 so we're just UNDER it but above everything else,
          then a second div at 2147483648 to paint over it.
          Height is exactly the badge height (~44px). pointer-events:none so dots work. */}
      <div
        className="hidden lg:block fixed pointer-events-none"
        style={{
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 70,
          zIndex: 2147483648,
          background: "#000",
        }}
      />

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
