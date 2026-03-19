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

    // ── CSS: canvas full-screen, no tilt, no branding ──
    const style = document.createElement('style');
    style.id = 'us-kill';
    style.textContent = `
      /* Canvas fills container, no distortion */
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
      [data-us-project] * { pointer-events: none !important; }

      /*
        UnicornStudio injects its badge as a direct child of <body>:
        a fixed div, bottom-right or bottom-left, z-index ~2147483647.
        Kill every non-app fixed element that could be the badge.
      */
      body > div[style*="position: fixed"],
      body > div[style*="position:fixed"],
      body > a[style*="position: fixed"],
      body > a[style*="position:fixed"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
        clip: rect(0,0,0,0) !important;
      }

      /* Also kill by class/id patterns */
      [class*="unicorn"], [id*="unicorn"],
      [class*="uimix"],  [id*="uimix"],
      [class*="made-with"], [id*="made-with"],
      [class*="watermark"], [id*="watermark"],
      [class*="powered-by"], [id*="powered-by"],
      [class*="us-badge"], [id*="us-badge"],
      [class*="us-branding"], [id*="us-branding"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    // ── DOM nuke: runs on every mutation ──
    const BRAND = ['made with', 'unicorn', 'unicornstudio', 'powered by', 'uimix'];

    const kill = (el: HTMLElement) => {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      el.style.setProperty('position', 'absolute', 'important');
      el.style.setProperty('left', '-99999px', 'important');
      el.style.setProperty('top', '-99999px', 'important');
      el.style.setProperty('width', '0', 'important');
      el.style.setProperty('height', '0', 'important');
      try { el.remove(); } catch (_) {}
    };

    const sweep = () => {
      // 1. Everything INSIDE the project container that isn't the canvas
      document.querySelectorAll('[data-us-project] *').forEach(n => {
        const el = n as HTMLElement;
        if (el.tagName === 'CANVAS') return;
        const tag = el.tagName?.toLowerCase();
        // Always kill links and buttons inside (badge is always an anchor)
        if (tag === 'a' || tag === 'button') { kill(el); return; }
        const text  = (el.textContent  || '').toLowerCase();
        const title = (el.getAttribute('title') || '').toLowerCase();
        const href  = (el.getAttribute('href')  || '').toLowerCase();
        if (BRAND.some(k => text.includes(k) || title.includes(k) || href.includes(k))) kill(el);
      });

      // 2. Direct children of <body> that are fixed and look like a badge
      //    (UnicornStudio injects the badge OUTSIDE the project container)
      const knownSafe = new Set(['#__next', '#root', 'body > script', 'body > style', 'body > link', 'body > noscript']);
      document.querySelectorAll('body > *').forEach(n => {
        const el = n as HTMLElement;
        const tag = el.tagName?.toLowerCase();
        if (['script','style','link','noscript','meta'].includes(tag)) return;
        if (el.id === 'us-kill') return;
        if (el.id === '__next' || el.id === 'root') return;
        if (el.hasAttribute('data-us-project')) return;

        // Check computed style for fixed positioning
        try {
          const cs = window.getComputedStyle(el);
          const pos = cs.position;
          const isFixed = pos === 'fixed';

          if (isFixed) {
            const text = (el.textContent || '').toLowerCase();
            const z = parseInt(cs.zIndex || '0', 10);
            const bottom = parseFloat(cs.bottom || '-1');
            const right  = parseFloat(cs.right  || '-1');
            const left   = parseFloat(cs.left   || '-1');
            const w = parseFloat(cs.width  || '0');
            const h = parseFloat(cs.height || '0');

            // Badge is: fixed, high-z, near a corner, small, contains brand text OR has no children we care about
            const nearCorner = (bottom >= 0 && bottom < 120) && (right >= 0 && right < 200 || left >= 0 && left < 200);
            const isTiny     = w < 300 && h < 100;
            const hasBrand   = BRAND.some(k => text.includes(k));

            if (hasBrand) { kill(el); return; }
            if (nearCorner && isTiny && z > 100) { kill(el); return; }
            // Very high z-index fixed element that isn't our app = badge
            if (z > 1000000 && isFixed) { kill(el); return; }
          }
        } catch (_) {}

        // Also scan inner content for brand text regardless of position
        const text = (el.textContent || '').toLowerCase();
        if (BRAND.some(k => text.includes(k))) {
          // Only kill if it looks like a small overlay, not our whole app shell
          try {
            const cs = window.getComputedStyle(el);
            const w = parseFloat(cs.width  || '9999');
            const h = parseFloat(cs.height || '9999');
            if (w < 400 && h < 150) kill(el);
          } catch (_) {}
        }
      });
    };

    // Run immediately, frequently, and watch for injections
    sweep();
    const iv = setInterval(sweep, 40);

    const obs = new MutationObserver(() => sweep());
    obs.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    [100, 300, 600, 1200, 2500, 5000, 10000].forEach(ms => setTimeout(sweep, ms));

    return () => {
      clearInterval(iv);
      obs.disconnect();
      try { document.head.removeChild(embedScript); } catch (_) {}
      const s = document.getElementById('us-kill');
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
