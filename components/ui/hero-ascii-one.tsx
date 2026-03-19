'use client';

import { useEffect } from 'react';

export default function HeroAsciiOne() {
  useEffect(() => {
    // ── CSS first — kills badge before JS even runs ──
    const style = document.createElement('style');
    style.id = 'us-kill';
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
      [data-us-project] * { pointer-events: none !important; }

      /* Kill the badge pill — fixed, bottom-center, injected into body */
      body > a,
      body > div:not(#__next):not(#root) {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        position: absolute !important;
        left: -99999px !important;
        top: -99999px !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
      body > #__next,
      body > #root {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
        position: static !important;
        width: auto !important;
        height: auto !important;
        left: auto !important;
        top: auto !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);

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

    // ── DOM sweep — no monkey-patching, just clean removal ──
    const BRAND = ['made with', 'unicorn', 'unicornstudio', 'uimix', 'powered by'];
    const SAFE  = new Set(['__next', 'root', 'us-kill']);
    const SAFE_TAGS = new Set(['script','style','link','noscript','meta']);

    const kill = (el: Element) => {
      const h = el as HTMLElement;
      h.style.setProperty('display',        'none',     'important');
      h.style.setProperty('visibility',     'hidden',   'important');
      h.style.setProperty('opacity',        '0',        'important');
      h.style.setProperty('pointer-events', 'none',     'important');
      h.style.setProperty('left',           '-99999px', 'important');
      h.style.setProperty('top',            '-99999px', 'important');
      h.style.setProperty('width',          '0',        'important');
      h.style.setProperty('height',         '0',        'important');
      try { el.remove(); } catch (_) {}
    };

    const sweep = () => {
      // 1. Non-canvas elements inside project container
      document.querySelectorAll('[data-us-project] *').forEach(n => {
        const el = n as HTMLElement;
        if (el.tagName === 'CANVAS') return;
        const tag = el.tagName?.toLowerCase();
        if (tag === 'a' || tag === 'button') { kill(n); return; }
        const txt  = (el.textContent || '').toLowerCase();
        const href = (el.getAttribute('href') || '').toLowerCase();
        if (BRAND.some(k => txt.includes(k) || href.includes(k))) kill(n);
      });

      // 2. Foreign body children (badge is injected here)
      document.querySelectorAll('body > *').forEach(n => {
        const el = n as HTMLElement;
        const tag = el.tagName?.toLowerCase();
        if (!tag || SAFE_TAGS.has(tag)) return;
        if (SAFE.has(el.id)) return;
        kill(n);
      });
    };

    sweep();
    const iv = setInterval(sweep, 20);
    const obs = new MutationObserver(sweep);
    obs.observe(document.body, { childList: true, subtree: false }); // subtree:false = body children only, cheaper
    [100,300,600,1200,2500,5000].forEach(ms => setTimeout(sweep, ms));

    return () => {
      clearInterval(iv);
      obs.disconnect();
      try { document.head.removeChild(embedScript); } catch (_) {}
      const s = document.getElementById('us-kill');
      if (s) try { document.head.removeChild(s); } catch (_) {}
    };
  }, []);

  return (
    <div style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'hidden' }}>
      <div
        data-us-project="OMzqyUv6M3kSnv0JeAtC"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
      />
    </div>
  );
}
