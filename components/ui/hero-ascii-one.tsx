'use client';

import { useEffect } from 'react';

export default function HeroAsciiOne() {
  useEffect(() => {
    // ── Load UnicornStudio ──
    const embedScript = document.createElement('script');
    embedScript.type = 'text/javascript';
    embedScript.textContent = `
      !function(){
        if(!window.UnicornStudio){
          window.UnicornStudio={isInitialized:!1};
          var i=document.createElement("script");
          i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
          i.onload=function(){
            window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)
          };
          (document.head || document.body).appendChild(i)
        }
      }();
    `;
    document.head.appendChild(embedScript);

    // ── CSS overrides: full-screen, upright, no branding ──
    const style = document.createElement('style');
    style.id = 'unicorn-overrides';
    style.textContent = `
      [data-us-project] {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        transform: none !important;
        rotate: none !important;
        skew: none !important;
      }
      [data-us-project] canvas {
        clip-path: none !important;
        transform: none !important;
        rotate: none !important;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover !important;
        object-position: center center !important;
        display: block !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }
      /* ── Nuke every possible branding element ── */
      [data-us-project] a,
      [data-us-project] [class*="logo"],
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="badge"],
      [data-us-project] [class*="watermark"],
      [data-us-project] [class*="made"],
      [data-us-project] [id*="logo"],
      [data-us-project] [id*="brand"],
      [data-us-project] [id*="credit"],
      [data-us-project] [id*="badge"],
      [data-us-project] [id*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
        clip: rect(0,0,0,0) !important;
      }
      /* Catch any fixed/absolute positioned overlay that UnicornStudio injects */
      body > [style*="position: fixed"][style*="bottom"],
      body > [style*="position:fixed"][style*="bottom"],
      body > div[style*="z-index: 9"],
      body > div[style*="z-index:9"] {
        display: none !important;
      }
    `;
    document.head.appendChild(style);

    // ── Aggressive DOM branding removal with MutationObserver ──
    const BRAND_KEYWORDS = ['made with', 'unicorn', 'unicornstudio', 'powered by'];

    const nukeEl = (el: HTMLElement) => {
      el.style.cssText =
        'display:none!important;visibility:hidden!important;opacity:0!important;' +
        'pointer-events:none!important;position:absolute!important;' +
        'left:-99999px!important;top:-99999px!important;width:0!important;height:0!important;';
      try { el.remove(); } catch (_) {}
    };

    const scanAndNuke = () => {
      // 1. Nuke anything inside the project container matching keywords
      document.querySelectorAll('[data-us-project] *').forEach(node => {
        const el = node as HTMLElement;
        const text  = (el.textContent  || '').toLowerCase().trim();
        const title = (el.getAttribute('title') || '').toLowerCase();
        const href  = (el.getAttribute('href')  || '').toLowerCase();
        const alt   = (el.getAttribute('alt')   || '').toLowerCase();
        if (BRAND_KEYWORDS.some(k => text.includes(k) || title.includes(k) || href.includes(k) || alt.includes(k))) {
          nukeEl(el);
        }
      });

      // 2. Nuke any body-level overlays injected by the script (fixed position, high z-index, near bottom)
      document.querySelectorAll('body > *').forEach(node => {
        const el = node as HTMLElement;
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return;
        const cs = window.getComputedStyle(el);
        const isFixed = cs.position === 'fixed';
        const isHighZ = parseInt(cs.zIndex || '0', 10) > 100;
        const isBottom = parseInt(cs.bottom || '-1', 10) >= 0;
        const text = (el.textContent || '').toLowerCase();
        if (isFixed && isHighZ && isBottom && BRAND_KEYWORDS.some(k => text.includes(k))) {
          nukeEl(el);
        }
        // Also catch by href inside
        el.querySelectorAll('a[href]').forEach(a => {
          const h = (a.getAttribute('href') || '').toLowerCase();
          if (BRAND_KEYWORDS.some(k => h.includes(k))) nukeEl(a as HTMLElement);
        });
      });
    };

    scanAndNuke();
    const interval = setInterval(scanAndNuke, 60);

    // MutationObserver catches dynamically injected nodes
    const observer = new MutationObserver(() => scanAndNuke());
    observer.observe(document.body, { childList: true, subtree: true });

    const timers = [300, 800, 1500, 3000, 6000, 12000].map(ms => setTimeout(scanAndNuke, ms));

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      observer.disconnect();
      try { document.head.removeChild(embedScript); } catch (_) {}
      const s = document.getElementById('unicorn-overrides');
      if (s) try { document.head.removeChild(s); } catch (_) {}
    };
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <div
        data-us-project="OMzqyUv6M3kSnv0JeAtC"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
}
