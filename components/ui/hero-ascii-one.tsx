'use client';

import { useEffect } from 'react';

export default function HeroAsciiOne() {
  useEffect(() => {
    // Load UnicornStudio
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

    // CSS overrides
    const style = document.createElement('style');
    style.id = 'unicorn-overrides';
    style.textContent = `
      [data-us-project] {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        transform: none !important;
      }
      [data-us-project] canvas {
        clip-path: none !important;
        transform: none !important;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }
      /* Nuke ALL branding - every possible selector */
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
        width: 0 !important;
        height: 0 !important;
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
      }
      /* Kill any fixed overlay UnicornStudio injects into body */
      body > div[style*="position: fixed"],
      body > div[style*="position:fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
      }
    `;
    document.head.appendChild(style);

    const KEYWORDS = ['made with', 'unicorn', 'unicornstudio', 'powered by', 'uimix'];

    const nukeEl = (el: HTMLElement) => {
      el.style.cssText =
        'display:none!important;visibility:hidden!important;opacity:0!important;' +
        'pointer-events:none!important;position:absolute!important;' +
        'left:-99999px!important;top:-99999px!important;' +
        'width:0!important;height:0!important;overflow:hidden!important;';
      try { el.remove(); } catch (_) {}
    };

    const scanAndNuke = () => {
      // 1. Kill anything inside project container matching branding keywords
      document.querySelectorAll('[data-us-project] *').forEach(node => {
        const el = node as HTMLElement;
        const tag = el.tagName?.toLowerCase();
        if (tag === 'canvas') return; // never nuke the canvas itself
        const text  = (el.textContent  || '').toLowerCase().trim();
        const title = (el.getAttribute('title') || '').toLowerCase();
        const href  = (el.getAttribute('href')  || '').toLowerCase();
        const src   = (el.getAttribute('src')   || '').toLowerCase();
        if (KEYWORDS.some(k => text.includes(k) || title.includes(k) || href.includes(k) || src.includes(k))) {
          nukeEl(el);
        }
        // Also nuke non-canvas, non-script elements that are absolutely positioned
        // (the watermark badge is typically a small div/anchor floated in a corner)
        if (tag === 'a' || tag === 'button') nukeEl(el);
      });

      // 2. Kill body-level fixed overlays
      document.querySelectorAll('body > *').forEach(node => {
        const el = node as HTMLElement;
        const tag = el.tagName?.toLowerCase();
        if (['script','style','link','noscript'].includes(tag)) return;
        // Skip our own containers
        if (el.id === 'unicorn-overrides') return;
        if (el.hasAttribute('data-us-project')) return;
        // Check if it's a fixed positioned overlay with branding text
        try {
          const cs = window.getComputedStyle(el);
          const isFixed = cs.position === 'fixed' || cs.position === 'absolute';
          const text = (el.textContent || '').toLowerCase();
          if (isFixed && KEYWORDS.some(k => text.includes(k))) {
            nukeEl(el);
            return;
          }
          // High z-index fixed element near bottom = badge
          const z = parseInt(cs.zIndex || '0', 10);
          const bottom = parseInt(cs.bottom || '-1', 10);
          if (isFixed && z > 50 && bottom >= 0 && bottom < 80) {
            nukeEl(el);
          }
        } catch (_) {}
      });
    };

    // Run immediately, on interval, and observe mutations
    scanAndNuke();
    const interval = setInterval(scanAndNuke, 50);

    const observer = new MutationObserver(() => { scanAndNuke(); });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const timers = [200, 500, 1000, 2000, 4000, 8000].map(ms => setTimeout(scanAndNuke, ms));

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
