import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

import { WEB_PAINT_KEY } from '@/ui/theme';
import { EMBER } from '@/ui/themes';

/** The default look paints the page until the stored paint, then the app, takes over. */
const FIRST_PAINT = EMBER;

// Web only: the root HTML for every page at static-render time. Runs in Node, without the DOM.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* viewport-fit=cover lets the app draw under the notch; Screen pads by the safe-area insets. */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="Numerology, Western and Chinese astrology read together, with a guide modeled on Carl Jung." />
        <meta name="theme-color" content={FIRST_PAINT.colors.bg} />
        <meta name="color-scheme" content={FIRST_PAINT.scheme} />

        {/* Home Screen app on iPhone: full screen, translucent status bar, its own name and icon. */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Esoterica" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
        <script dangerouslySetInnerHTML={{ __html: PAINT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// No white flash before the app paints, no rubber-band past the edges, no grey tap highlight.
// --paint is the look's page color: set by the script below, then by the app (_layout).
const GLOBAL_CSS = `
html, body { background-color: var(--paint, ${FIRST_PAINT.colors.bg}); overscroll-behavior: none; }
body { -webkit-tap-highlight-color: transparent; }
`;

// Applies the paint the app stored for the chosen look before the bundle loads, so a light look
// never opens on a dark page. Runs in <head>: <body> does not exist yet, so the color goes through --paint.
const PAINT_SCRIPT = `
(function () {
  try {
    var p = JSON.parse(localStorage.getItem(${JSON.stringify(WEB_PAINT_KEY)}) || 'null');
    if (!p || typeof p.bg !== 'string' || (p.scheme !== 'dark' && p.scheme !== 'light')) return;
    var root = document.documentElement;
    root.style.setProperty('--paint', p.bg);
    root.style.colorScheme = p.scheme;
    var color = document.querySelector('meta[name="theme-color"]');
    if (color) color.setAttribute('content', p.bg);
    var scheme = document.querySelector('meta[name="color-scheme"]');
    if (scheme) scheme.setAttribute('content', p.scheme);
  } catch (e) {}
})();
`;
