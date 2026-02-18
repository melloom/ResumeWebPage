import React, { useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import StarryAnimation from '../autoscope/components/StarryAnimation';
import '../autoscope/autoscope.css';

const MUSIC_FILE = 'The Way Life Goes (instrumental remix slowed reverb).mp3';

const AutoScope = () => {
  const musicRef = useRef(null);
  const blobUrlRef = useRef(null);

  // Enhanced music loading for PWA compatibility
  useEffect(() => {
    let cancelled = false;
    let audio = null;
    let playAttempts = 0;
    const MAX_ATTEMPTS = 3;

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
        audio.volume = 0.02; // Reduced from 0.06 to 0.02 for better balance with narration
        audio.muted = false; // Ensure unmuted
        audio.preload = 'auto';
        
        // Set audio attributes for better PWA compatibility
        audio.setAttribute('playsinline', '');
        audio.setAttribute('webkit-playsinline', '');
        
        musicRef.current = audio;

        // Enhanced PWA audio playback with multiple fallback strategies
        const attemptPlay = async () => {
          if (playAttempts >= MAX_ATTEMPTS) {
            console.log('[AutoScope] Max play attempts reached, waiting for user interaction');
            return;
          }
          playAttempts++;

          try {
            // Ensure audio is ready
            if (audio.readyState < 2) {
              await new Promise(resolve => {
                if (audio.readyState >= 2) resolve();
                else audio.addEventListener('loadeddata', resolve, { once: true });
              });
            }

            const playPromise = audio.play();
            if (playPromise !== undefined) {
              await playPromise;
              console.log('[AutoScope] Background music playing successfully');
            }
          } catch (error) {
            console.log(`[AutoScope] Play attempt ${playAttempts} failed:`, error.message);
            
            // Set up user interaction listeners for subsequent attempts
            const unlock = async () => {
              try {
                await audio.play();
                console.log('[AutoScope] Music unlocked by user interaction');
                document.removeEventListener('click', unlock);
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('keydown', unlock);
              } catch (e) {
                // Try again on next interaction
                if (playAttempts < MAX_ATTEMPTS) {
                  playAttempts++;
                }
              }
            };
            
            document.addEventListener('click', unlock, { once: true });
            document.addEventListener('touchstart', unlock, { once: true });
            document.addEventListener('keydown', unlock, { once: true });
          }
        };

        // Initial play attempt
        attemptPlay();

        // Also try playing after a short delay (helps with some PWA contexts)
        setTimeout(() => {
          if (!cancelled && audio && audio.paused) {
            attemptPlay();
          }
        }, 1000);

      } catch (_e) {
        console.log('[AutoScope] Music failed to load — not critical');
      }
    };

    loadAndPlay();

    return () => {
      cancelled = true;
      if (audio) { 
        audio.pause(); 
        audio.src = ''; 
        audio.removeAttribute('playsinline');
        audio.removeAttribute('webkit-playsinline');
      }
      if (blobUrlRef.current) { 
        URL.revokeObjectURL(blobUrlRef.current); 
        blobUrlRef.current = null; 
      }
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
