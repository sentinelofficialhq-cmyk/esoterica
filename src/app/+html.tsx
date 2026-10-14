import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const BG = '#07071A';

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
        <meta name="theme-color" content={BG} />
        <meta name="color-scheme" content="dark" />

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
      </head>
      <body>{children}</body>
    </html>
  );
}

// No white flash before the app paints, no rubber-band past the edges, no grey tap highlight.
const GLOBAL_CSS = `
html, body { background-color: ${BG}; overscroll-behavior: none; }
body { -webkit-tap-highlight-color: transparent; }
`;
