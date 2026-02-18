import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import StarryAnimation from '../autoscope/components/StarryAnimation';
import '../autoscope/autoscope.css';

const MUSIC_URL = '/' + encodeURIComponent('The Way Life Goes (instrumental remix slowed reverb).mp3');

const AutoScope = () => {
  const musicRef = useRef(null);

  // Play music on mount, stop on unmount (navigate away)
  useEffect(() => {
    const audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.12;
    musicRef.current = audio;

    const tryPlay = () => {
      audio.play().catch(() => {
        // Autoplay blocked — unlock on first interaction
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
    };
    tryPlay();

    return () => {
      audio.pause();
      audio.src = '';
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
