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
    let volumeEnforcer = null;
    const MAX_ATTEMPTS = 3;
    
    // Detect device type once and store it at the top level
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                    window.innerWidth <= 768;

    const cleanup = () => {
      cancelled = true;
      if (volumeEnforcer) clearInterval(volumeEnforcer);
      if (audio) { 
        audio.pause(); 
        audio.src = ''; 
        audio.removeAttribute('playsinline');
        audio.removeAttribute('webkit-playsinline');
        
        // Clean up Web Audio API resources
        if (audio.gainNode) {
          audio.gainNode.disconnect();
          audio.gainNode = null;
        }
        if (audio.audioContext) {
          audio.audioContext.close();
          audio.audioContext = null;
        }
      }
      if (blobUrlRef.current) { 
        URL.revokeObjectURL(blobUrlRef.current); 
        blobUrlRef.current = null; 
      }
      musicRef.current = null;
    };

    const loadAndPlay = async () => {
      try {
        // Try direct file path first, then encoded fallback
        let res;
        try {
          res = await fetch('/' + MUSIC_FILE);
        } catch (e) {
          console.log('[AutoScope] Direct fetch failed, trying encoded path:', e.message);
          res = await fetch('/' + encodeURIComponent(MUSIC_FILE));
        }
        
        if (!res.ok || cancelled) return;
        const blob = await res.blob();
        if (cancelled) return;
        
        // Debug: Check if we got valid audio data
        console.log('[AutoScope] Audio blob size:', blob.size, 'bytes');
        console.log('[AutoScope] Audio blob type:', blob.type);
        
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        audio = new Audio(blobUrl);
        audio.loop = true;
        
        // Add more debugging
        audio.addEventListener('error', (e) => {
          console.error('[AutoScope] Audio element error:', e);
          console.error('[AutoScope] Audio error code:', audio.error);
          console.error('[AutoScope] Audio error message:', audio.error?.message);
          
          // If mobile and Web Audio API failed, try fallback
          if (isMobile && audio.gainNode && audio.error?.code === 4) {
            console.log('[AutoScope] Mobile Web Audio API aborted, switching to regular volume control');
            // Disconnect Web Audio API and use regular volume
            if (audio.gainNode) {
              audio.gainNode.disconnect();
              audio.gainNode = null;
            }
            if (audio.audioContext) {
              audio.audioContext.close();
              audio.audioContext = null;
            }
            audio.volume = 0.07;
            console.log('[AutoScope] Mobile fallback applied - Volume set to:', audio.volume);
            
            // Try to play again with regular volume
            setTimeout(() => {
              if (audio && audio.paused) {
                audio.play().then(() => {
                  console.log('[AutoScope] Mobile fallback play successful');
                }).catch(e => {
                  console.log('[AutoScope] Mobile fallback play failed:', e.message);
                });
              }
            }, 100);
          }
        });
        
        audio.addEventListener('loadeddata', () => {
          console.log('[AutoScope] Audio data loaded successfully');
          console.log('[AutoScope] Audio duration:', audio.duration);
          console.log('[AutoScope] Audio readyState:', audio.readyState);
        });
        
        // Create Web Audio API context for better volume control on mobile only
        let audioContext = null;
        let gainNode = null;
        
        // Only use Web Audio API on mobile devices
        if (isMobile) {
          try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audio);
            gainNode = audioContext.createGain();
            
            // Set gain based on device type
            const targetGain = 0.07;
            
            gainNode.gain.value = targetGain;
            console.log('[AutoScope] Mobile device detected - Using Web Audio API, Gain set to:', targetGain);
            
            // Connect audio nodes
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Store references for cleanup
            audio.gainNode = gainNode;
            audio.audioContext = audioContext;
            
            // Also set regular volume as backup for mobile
            audio.volume = 0.07;
            console.log('[AutoScope] Mobile backup volume set to:', audio.volume);
            
          } catch (e) {
            console.log('[AutoScope] Web Audio API not available, using fallback');
            // Fallback to regular volume control
            audio.volume = 0.07;
            console.log('[AutoScope] Mobile fallback - Volume set to:', audio.volume);
          }
        } else {
          // Desktop: use regular volume control
          audio.volume = 0.08;
          console.log('[AutoScope] Desktop detected - Using regular volume control, Volume set to:', audio.volume);
        }
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
              // Ensure volume is still set correctly before playing
              if (isMobile && audio.gainNode) {
                // Mobile with Web Audio API - gain is already set
                console.log('[AutoScope] Mobile Web Audio API - volume controlled by gain node');
              } else {
                // Desktop or mobile fallback - use regular volume
                audio.volume = isMobile ? 0.07 : 0.08;
                console.log('[AutoScope] Setting volume before play:', audio.volume);
              }
              await playPromise;
              console.log('[AutoScope] Background music playing successfully, volume:', audio.volume);
            }
          } catch (error) {
            console.log(`[AutoScope] Play attempt ${playAttempts} failed:`, error.message);
            
            // Set up user interaction listeners for subsequent attempts
            const unlock = async () => {
              try {
                // Ensure volume is still set correctly before playing
                if (isMobile && audio.gainNode) {
                  // Mobile with Web Audio API - gain is already set
                  console.log('[AutoScope] Mobile Web Audio API unlock - volume controlled by gain node');
                } else {
                  // Desktop or mobile fallback - use regular volume
                  audio.volume = isMobile ? 0.07 : 0.08;
                  console.log('[AutoScope] Setting volume on unlock:', audio.volume);
                }
                await audio.play();
                console.log('[AutoScope] Music unlocked by user interaction, volume:', audio.volume);
                document.removeEventListener('click', unlock);
                document.removeEventListener('touchstart', unlock);
                document.removeEventListener('keydown', unlock);
              } catch (e) {
                console.log('[AutoScope] Still failed after user interaction:', e.message);
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

        // Persistent volume enforcement - only for desktop and mobile fallback
        volumeEnforcer = setInterval(() => {
          if (audio && !cancelled) {
            // Only enforce regular volume if not using Web Audio API
            if (!isMobile || !audio.gainNode) {
              const targetVolume = isMobile ? 0.07 : 0.08;
              audio.volume = targetVolume;
              // Force volume setting multiple times
              setTimeout(() => audio.volume = targetVolume, 10);
              setTimeout(() => audio.volume = targetVolume, 50);
              setTimeout(() => audio.volume = targetVolume, 100);
            }
          }
        }, 500); // More frequent enforcement

        // Also enforce volume on audio events - only for desktop and mobile fallback
        const enforceVolume = () => {
          if (!isMobile || !audio.gainNode) {
            const targetVolume = isMobile ? 0.07 : 0.08;
            audio.volume = targetVolume;
          }
        };

        audio.addEventListener('play', enforceVolume);
        audio.addEventListener('playing', enforceVolume);
        audio.addEventListener('volumechange', enforceVolume);

      } catch (_e) {
        console.log('[AutoScope] Music failed to load — not critical');
      }
    };

    loadAndPlay();

    return cleanup;
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
