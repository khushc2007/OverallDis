'use client';

import { useEffect } from 'react';

export default function HeroAsciiOne() {
  useEffect(() => {
    // ── STEP 1: Pre-poison the DOM before UnicornStudio even loads ──
    // Override createElement and appendChild so any badge element
    // gets neutered the instant it's created.
    const origCreateElement = document.createElement.bind(document);
    const origAppendChild   = Element.prototype.appendChild;
    const origInsertBefore  = Element.prototype.insertBefore;

    const BRAND = ['unicorn', 'made with', 'uimix', 'powered by'];

    const isBadgeEl = (el: Element): boolean => {
      if (!el || el.nodeType !== 1) return false;
      const tag = (el as HTMLElement).tagName?.toLowerCase();
      // Badge is always an anchor or a small div — never canvas/script/style
      if (['canvas','script','style','link','meta'].includes(tag)) return false;
      // If it's going to be appended to body (not inside our project), suspicious
      const txt  = (el.textContent  || '').toLowerCase();
      const href = (el.getAttribute?.('href') || '').toLowerCase();
      const src  = (el.getAttribute?.('src')  || '').toLowerCase();
      if (BRAND.some(k => txt.includes(k) || href.includes(k) || src.includes(k))) return true;
      return false;
    };

    // Patch appendChild on body to intercept badge injection
    const origBodyAppend = document.body.appendChild.bind(document.body);
    (document.body as any).appendChild = function<T extends Node>(node: T): T {
      if (node.nodeType === 1) {
        const el = node as unknown as HTMLElement;
        const id  = el.id  || '';
        const tag = el.tagName?.toLowerCase();
        // Allow our app root and essential tags through
        if (id === '__next' || id === 'root' || id === 'us-kill') {
          return origBodyAppend(node);
        }
        if (['script','style','link','noscript','meta'].includes(tag)) {
          return origBodyAppend(node);
        }
        // Kill badge before it even enters the DOM
        if (isBadgeEl(el)) {
          el.style.setProperty('display', 'none', 'important');
          return node; // return without appending
        }
        // For anything else appended to body after our app is mounted,
        // let it through but immediately schedule a kill check
        const result = origBodyAppend(node);
        requestAnimationFrame(() => {
          if (document.body.contains(el) && el.id !== '__next' && el.id !== 'root') {
            if (isBadgeEl(el) || (el as HTMLElement).tagName?.toLowerCase() === 'a') {
              el.style.setProperty('display', 'none', 'important');
              try { el.remove(); } catch (_) {}
            }
          }
        });
        return result;
      }
      return origBodyAppend(node);
    };

    // ── STEP 2: Load UnicornStudio ──
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

    // ── STEP 3: CSS — belt and suspenders ──
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

      /* Kill badge by structure: fixed body child that isn't #__next/#root */
      body > *:not(#__next):not(#root):not([id="us-kill"]):not(script):not(style):not(link):not(noscript):not(meta) {
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
      /* Always keep app root visible */
      body > #__next,
      body > #root {
        all: revert !important;
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

    // ── STEP 4: Runtime DOM sweep — runs FAST, catches anything that slips through ──
    const SAFE_IDS  = new Set(['__next', 'root', 'us-kill']);
    const SAFE_TAGS = new Set(['script','style','link','noscript','meta']);

    const kill = (el: Element) => {
      const h = el as HTMLElement;
      h.style.setProperty('display',        'none',     'important');
      h.style.setProperty('visibility',     'hidden',   'important');
      h.style.setProperty('opacity',        '0',        'important');
      h.style.setProperty('pointer-events', 'none',     'important');
      h.style.setProperty('position',       'absolute', 'important');
      h.style.setProperty('left',           '-99999px', 'important');
      h.style.setProperty('top',            '-99999px', 'important');
      h.style.setProperty('width',          '0',        'important');
      h.style.setProperty('height',         '0',        'important');
      try { el.remove(); } catch (_) {}
    };

    const sweep = () => {
      // Kill non-canvas elements inside the project
      document.querySelectorAll('[data-us-project] *').forEach(n => {
        const el = n as HTMLElement;
        if (el.tagName === 'CANVAS') return;
        const tag = el.tagName?.toLowerCase();
        if (tag === 'a' || tag === 'button' || tag === 'img') { kill(n); return; }
        const txt  = (el.textContent  || '').toLowerCase();
        const href = (el.getAttribute('href') || '').toLowerCase();
        if (BRAND.some(k => txt.includes(k) || href.includes(k))) kill(n);
      });

      // Kill every body child that isn't our app
      document.querySelectorAll('body > *').forEach(n => {
        const el = n as HTMLElement;
        const tag = el.tagName?.toLowerCase();
        if (!tag || SAFE_TAGS.has(tag)) return;
        if (SAFE_IDS.has(el.id)) return;
        kill(n);
      });
    };

    sweep();
    const iv = setInterval(sweep, 20); // 20ms — catch it the frame it appears

    const obs = new MutationObserver(() => sweep());
    obs.observe(document.body, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ['style', 'class'],
    });

    [50,100,200,400,800,1600,3200].forEach(ms => setTimeout(sweep, ms));

    return () => {
      clearInterval(iv);
      obs.disconnect();
      // Restore patched appendChild
      (document.body as any).appendChild = origBodyAppend;
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
