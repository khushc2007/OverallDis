'use client';

import { useEffect } from 'react';

export default function HeroAsciiOne() {
  useEffect(() => {
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

    const style = document.createElement('style');
    style.id = 'unicorn-overrides';
    style.textContent = `
      /* ── Full-screen, upright, no tilt ── */
      [data-us-project] {
        position: absolute !important;
        inset: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        /* Remove any inherited transform that could cause tilt */
        transform: none !important;
      }
      [data-us-project] canvas {
        /* No crop, no rotation, no skew — perfectly upright */
        clip-path: none !important;
        transform: none !important;
        max-width: 100% !important;
        max-height: 100% !important;
      }
      [data-us-project] * {
        pointer-events: none !important;
      }

      /* ── Hide branding ── */
      [data-us-project] a[href*="unicorn"],
      [data-us-project] button[title*="unicorn"],
      [data-us-project] div[title*="Made with"],
      [data-us-project] .unicorn-brand,
      [data-us-project] [class*="brand"],
      [data-us-project] [class*="credit"],
      [data-us-project] [class*="watermark"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        position: absolute !important;
        left: -9999px !important;
        top: -9999px !important;
      }
    `;
    document.head.appendChild(style);

    const hideBranding = () => {
      const selectors = [
        '[data-us-project]',
        '[data-us-project="OMzqyUv6M3kSnv0JeAtC"]',
        '.unicorn-studio-container',
        'canvas[aria-label*="Unicorn"]',
      ];
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(container => {
          (container.querySelectorAll('*') as NodeListOf<HTMLElement>).forEach(el => {
            const text  = (el.textContent || '').toLowerCase();
            const title = (el.getAttribute('title') || '').toLowerCase();
            const href  = (el.getAttribute('href')  || '').toLowerCase();
            if (
              text.includes('made with') || text.includes('unicorn') ||
              title.includes('made with') || title.includes('unicorn') ||
              href.includes('unicorn.studio')
            ) {
              el.style.cssText +=
                ';display:none!important;visibility:hidden!important;opacity:0!important;' +
                'position:absolute!important;left:-9999px!important;top:-9999px!important;';
              try { el.remove(); } catch (_) {}
            }
          });
        });
      });
    };

    hideBranding();
    const interval = setInterval(hideBranding, 80);
    const timers = [500, 1000, 2000, 5000, 10000].map(ms => setTimeout(hideBranding, ms));

    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
      try { document.head.removeChild(embedScript); } catch (_) {}
      const s = document.getElementById('unicorn-overrides');
      if (s) try { document.head.removeChild(s); } catch (_) {}
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        // No transform here — keep it perfectly straight
      }}
    >
      <div
        data-us-project="OMzqyUv6M3kSnv0JeAtC"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}
