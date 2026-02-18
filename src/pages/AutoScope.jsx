import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import StarryAnimation from '../autoscope/components/StarryAnimation';
import '../autoscope/autoscope.css';

const MUSIC_FILE = 'The Way Life Goes (instrumental remix slowed reverb).mp3';

const AutoScope = () => {
  const musicRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Load music via fetch (avoids browser URI issues with spaces/parens in filename)
  useEffect(() => {
    let cancelled = false;
    let audio = null;

    const loadAndPlay = async () => {
      try {
        const res = await fetch('/' + encodeURIComponent(MUSIC_FILE));
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        audio = new Audio(blobUrl);
        audio.loop = true;
        audio.volume = 0.06;
        musicRef.current = audio;

        audio.play().catch(() => {
          const unlock = () => {
            audio.play().catch(() => {});
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('keydown', unlock);
          };
          document.addEventListener('click', unlock);
          document.addEventListener('touchstart', unlock);
          document.addEventListener('keydown', unlock);
        });
      } catch (_e) {
        // Music failed to load — not critical
      }
    };

    loadAndPlay();

    return () => {
      cancelled = true;
      if (audio) { audio.pause(); audio.src = ''; }
      if (blobUrlRef.current) { URL.revokeObjectURL(blobUrlRef.current); blobUrlRef.current = null; }
      musicRef.current = null;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>MelvinsAutoScope | Melvin Peralta</title>
        <meta
          name="description"
          content="Interactive resume modules, component kits, and AI experiments by Melvin Peralta."
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://mellowsites.com/autoscope" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mellowsites.com/autoscope" />
        <meta property="og:title" content="MelvinsAutoScope | Melvin Peralta" />
        <meta
          property="og:description"
          content="Interactive resume modules, component kits, and AI experiments by Melvin Peralta."
        />
        <meta property="og:image" content="https://mellowsites.com/screenshots/portfolio-portfolio-thumbnail.png" />
        <meta property="og:site_name" content="Melvin Peralta Portfolio" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mellowsites.com/autoscope" />
        <meta name="twitter:title" content="MelvinsAutoScope | Melvin Peralta" />
        <meta
          name="twitter:description"
          content="Interactive resume modules, component kits, and AI experiments by Melvin Peralta."
        />
        <meta name="twitter:image" content="https://mellowsites.com/screenshots/portfolio-portfolio-thumbnail.png" />
      </Helmet>

      <div className="autoscope-root">
        <StarryAnimation />
      </div>
    </>
  );
};

export default AutoScope;
