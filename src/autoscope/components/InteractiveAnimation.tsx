import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
  sat: number;
  light: number;
  life: number;
  maxLife: number;
  type: "ambient" | "burst" | "trail" | "star" | "spiral" | "ember" | "ring";
  trail: { x: number; y: number }[];
}

interface Ripple {
  x: number;
  y: number;
  startTime: number;
  hue: number;
  maxRadius: number;
  thickness: number;
}

interface Attractor {
  x: number;
  y: number;
  strength: number;
  startTime: number;
  duration: number;
  hue: number;
}

interface FloatText {
  text: string;
  x: number;
  y: number;
  startTime: number;
  hue: number;
  size: number;
}

const WORDS = ["✦", "✧", "⟡", "◈", "✶", "⊹", "⋆", "∗"];
const MAX_PARTICLES = 250;
const MOUSE_RADIUS = 180;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const createParticle = (x: number, y: number, type: Particle["type"], hueBase: number, opts?: Partial<Particle>): Particle => {
  const angle = Math.random() * Math.PI * 2;
  const speeds: Record<string, [number, number]> = {
    ambient: [0.15, 0.4], burst: [3, 10], trail: [0.5, 1.5],
    star: [2, 6], spiral: [1.5, 4], ember: [0.5, 2], ring: [2, 5],
  };
  const [min, max] = speeds[type] || [0.5, 2];
  const speed = Math.random() * (max - min) + min;

  return {
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: type === "ambient" ? Math.random() * 2 + 0.8 :
          type === "burst" ? Math.random() * 3.5 + 1.5 :
          type === "star" ? Math.random() * 3 + 2 :
          type === "ember" ? Math.random() * 1.5 + 0.5 :
          Math.random() * 2 + 1,
    hue: hueBase + Math.random() * 40 - 20,
    sat: 75 + Math.random() * 20,
    light: 55 + Math.random() * 20,
    life: 0,
    maxLife: type === "ambient" ? 999999 :
             type === "burst" ? 50 + Math.random() * 40 :
             type === "star" ? 70 + Math.random() * 50 :
             type === "ember" ? 30 + Math.random() * 30 :
             type === "ring" ? 60 + Math.random() * 30 :
             80 + Math.random() * 60,
    type,
    trail: [],
    ...opts,
  };
};

const InteractiveCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999, px: -999, py: -999, active: false, holding: false });
  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const attractorsRef = useRef<Attractor[]>([]);
  const textsRef = useRef<FloatText[]>([]);
  const frameRef = useRef(0);
  const globalHueRef = useRef(175);
  const lastEventRef = useRef(0);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const [combo, setCombo] = useState(0);
  const [eventLabel, setEventLabel] = useState<string | null>(null);

  const cw = useCallback(() => canvasRef.current?.offsetWidth ?? 0, []);
  const ch = useCallback(() => canvasRef.current?.offsetHeight ?? 0, []);

  const spawn = useCallback((x: number, y: number, count: number, type: Particle["type"] = "burst", opts?: Partial<Particle>) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push(createParticle(x, y, type, globalHueRef.current, opts));
    }
    while (particlesRef.current.length > MAX_PARTICLES) {
      const idx = particlesRef.current.findIndex(p => p.type !== "ambient");
      if (idx >= 0) particlesRef.current.splice(idx, 1);
      else particlesRef.current.shift();
    }
  }, []);

  const addRipple = useCallback((x: number, y: number, opts?: Partial<Ripple>) => {
    ripplesRef.current.push({
      x, y, startTime: Date.now(),
      hue: globalHueRef.current, maxRadius: 130, thickness: 2.5,
      ...opts,
    });
  }, []);

  const addText = useCallback((text: string, x: number, y: number, size = 14) => {
    textsRef.current.push({ text, x, y, startTime: Date.now(), hue: globalHueRef.current, size });
  }, []);

  const triggerRandomEvent = useCallback(() => {
    const events = ["aurora", "bloom", "vortex", "cascade", "pulse", "constellation"];
    const event = events[Math.floor(Math.random() * events.length)];
    const cx = Math.random() * cw() * 0.6 + cw() * 0.2;
    const cy = Math.random() * ch() * 0.6 + ch() * 0.2;

    setEventLabel(event);
    setTimeout(() => setEventLabel(null), 2000);

    switch (event) {
      case "aurora": {
        // Soft wave of embers across screen
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * cw();
          const y = ch() * 0.3 + Math.sin(x * 0.01) * 80 + Math.random() * 60;
          spawn(x, y, 1, "ember", {
            vy: -Math.random() * 1.5 - 0.5,
            vx: Math.random() * 0.6 - 0.3,
            hue: 160 + Math.random() * 80,
            maxLife: 100 + Math.random() * 80,
          });
        }
        break;
      }
      case "bloom": {
        // Beautiful expanding rings
        for (let r = 0; r < 4; r++) {
          const count = 12 + r * 6;
          for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = r * 3;
            spawn(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1, "ring", {
              vx: Math.cos(angle) * (2 + r * 1.2),
              vy: Math.sin(angle) * (2 + r * 1.2),
              hue: globalHueRef.current + r * 25,
              maxLife: 70 + r * 15,
            });
          }
          addRipple(cx, cy, { maxRadius: 80 + r * 50 });
        }
        break;
      }
      case "vortex": {
        attractorsRef.current.push({
          x: cx, y: cy, strength: 4, startTime: Date.now(), duration: 3500,
          hue: globalHueRef.current + 60,
        });
        // Seed spiral particles
        const arms = 4;
        for (let a = 0; a < arms; a++) {
          for (let i = 0; i < 12; i++) {
            const angle = (a / arms) * Math.PI * 2 + i * 0.35;
            const dist = i * 10;
            spawn(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 1, "spiral", {
              vx: Math.cos(angle + Math.PI / 2) * 2.5,
              vy: Math.sin(angle + Math.PI / 2) * 2.5,
              hue: globalHueRef.current + a * 30,
            });
          }
        }
        addText("⟲", cx, cy, 24);
        break;
      }
      case "cascade": {
        for (let i = 0; i < 35; i++) {
          setTimeout(() => {
            const x = Math.random() * cw();
            spawn(x, -5, 1, "star", {
              vx: (Math.random() - 0.5) * 0.8,
              vy: Math.random() * 3 + 2,
              maxLife: 120 + Math.random() * 60,
              hue: globalHueRef.current + Math.random() * 60,
            });
          }, i * 40);
        }
        break;
      }
      case "pulse": {
        // Center pulse wave
        for (let r = 0; r < 5; r++) {
          setTimeout(() => {
            addRipple(cx, cy, { maxRadius: 200, thickness: 3 - r * 0.4, hue: globalHueRef.current + r * 15 });
          }, r * 120);
        }
        spawn(cx, cy, 35, "burst");
        break;
      }
      case "constellation": {
        const stars: { x: number; y: number }[] = [];
        for (let i = 0; i < 8; i++) {
          const sx = cx + (Math.random() - 0.5) * 250;
          const sy = cy + (Math.random() - 0.5) * 200;
          stars.push({ x: sx, y: sy });
          spawn(sx, sy, 2, "star", { maxLife: 200, size: 3 });
        }
        break;
      }
    }
  }, [spawn, addRipple, addText, cw, ch]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false })!;
    let animId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // Seed ambient
    for (let i = 0; i < 50; i++) {
      particlesRef.current.push(createParticle(
        Math.random() * canvas.offsetWidth,
        Math.random() * canvas.offsetHeight,
        "ambient", 175 + Math.random() * 80,
      ));
    }

    const loop = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      frameRef.current++;
      globalHueRef.current = (globalHueRef.current + 0.08) % 360;
      const now = Date.now();
      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      // Smooth dark background with subtle fade
      ctx.fillStyle = `hsla(220, 22%, 6%, 0.18)`;
      ctx.fillRect(0, 0, W, H);

      // Random events
      if (now - lastEventRef.current > 5000 + Math.random() * 5000) {
        lastEventRef.current = now;
        triggerRandomEvent();
      }

      // Combo decay
      if (now - comboTimerRef.current > 2500 && comboRef.current > 0) {
        comboRef.current = 0;
        setCombo(0);
      }

      // Mouse hold = emit + attract
      if (mouse.holding && mouse.active && frameRef.current % 2 === 0) {
        spawn(
          mouse.x + (Math.random() - 0.5) * 20,
          mouse.y + (Math.random() - 0.5) * 20,
          1, "ember",
        );
      }

      // Mouse trail
      if (mouse.active && !mouse.holding && frameRef.current % 4 === 0) {
        const speed = Math.sqrt((mouse.x - mouse.px) ** 2 + (mouse.y - mouse.py) ** 2);
        if (speed > 2) {
          spawn(mouse.x, mouse.y, 1, "trail", { size: Math.min(speed * 0.1, 2.5) });
        }
      }
      mouse.px = mouse.x;
      mouse.py = mouse.y;

      // Draw subtle mouse glow
      if (mouse.active) {
        const mg = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_RADIUS);
        mg.addColorStop(0, `hsla(${globalHueRef.current}, 70%, 60%, 0.04)`);
        mg.addColorStop(0.5, `hsla(${globalHueRef.current}, 70%, 60%, 0.015)`);
        mg.addColorStop(1, `hsla(${globalHueRef.current}, 70%, 60%, 0)`);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      }

      // Process attractors
      const attractors = attractorsRef.current;
      for (let i = attractors.length - 1; i >= 0; i--) {
        const a = attractors[i];
        const elapsed = now - a.startTime;
        if (elapsed > a.duration) { attractors.splice(i, 1); continue; }
        const progress = elapsed / a.duration;
        const ease = easeInOutSine(progress);
        const alpha = (1 - ease) * 0.25;
        const radius = 20 + (1 - ease) * 30;

        // Elegant attractor visual
        for (let r = 0; r < 3; r++) {
          const rr = radius + r * 8;
          ctx.beginPath();
          ctx.arc(a.x, a.y, rr, 0, Math.PI * 2);
          const ag = ctx.createRadialGradient(a.x, a.y, rr * 0.3, a.x, a.y, rr);
          ag.addColorStop(0, `hsla(${a.hue}, 80%, 65%, ${alpha * 0.5})`);
          ag.addColorStop(1, `hsla(${a.hue}, 80%, 65%, 0)`);
          ctx.fillStyle = ag;
          ctx.fill();
        }

        // Spinning ring
        const rot = elapsed * 0.003;
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.arc(0, 0, radius + 15, 0, Math.PI * 0.8);
        ctx.strokeStyle = `hsla(${a.hue}, 80%, 65%, ${alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, radius + 15, Math.PI, Math.PI * 1.8);
        ctx.strokeStyle = `hsla(${a.hue + 40}, 80%, 65%, ${alpha * 0.4})`;
        ctx.stroke();
        ctx.restore();

        // Pull particles
        const strength = a.strength * (1 - ease);
        for (const p of particles) {
          const dx = a.x - p.x;
          const dy = a.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300 && dist > 3) {
            const force = strength / (dist * 0.4);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
      }

      // Update & draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        // Store trail positions
        if (p.type === "burst" || p.type === "star" || p.type === "spiral") {
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 8) p.trail.shift();
        }

        // Mouse interaction
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS);
            const smoothForce = easeOutCubic(force);
            if (mouse.holding) {
              p.vx -= (dx / dist) * smoothForce * 1.5;
              p.vy -= (dy / dist) * smoothForce * 1.5;
            } else {
              p.vx += (dx / dist) * smoothForce * 0.5;
              p.vy += (dy / dist) * smoothForce * 0.5;
            }
          }
        }

        // Smooth damping
        p.vx *= 0.975;
        p.vy *= 0.975;

        // Spiral curving
        if (p.type === "spiral") {
          const angle = Math.atan2(p.vy, p.vx) + 0.06;
          const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = Math.cos(angle) * speed;
          p.vy = Math.sin(angle) * speed;
        }

        // Gentle ambient drift
        if (p.type === "ambient") {
          p.vx += Math.sin(frameRef.current * 0.005 + p.y * 0.01) * 0.003;
          p.vy += Math.cos(frameRef.current * 0.004 + p.x * 0.01) * 0.003;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Soft edge bounce
        const margin = 5;
        if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) * 0.4; }
        if (p.x > W - margin) { p.x = W - margin; p.vx = -Math.abs(p.vx) * 0.4; }
        if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) * 0.4; }
        if (p.y > H - margin) { p.y = H - margin; p.vy = -Math.abs(p.vy) * 0.4; }

        const lifeRatio = p.maxLife < 999999 ? 1 - p.life / p.maxLife : 1;
        if (lifeRatio <= 0) { particles.splice(i, 1); continue; }

        // Smooth fade in/out
        const fadeIn = Math.min(p.life / 8, 1);
        const fadeOut = p.maxLife < 999999 ? easeOutQuart(lifeRatio) : 1;
        const alpha = fadeIn * fadeOut * 0.9;
        const hue = (p.hue + globalHueRef.current * 0.3) % 360;

        // Twinkle for stars & ambient
        const twinkle = (p.type === "star" || p.type === "ambient")
          ? 0.6 + Math.sin(p.life * 0.15 + p.x * 0.1) * 0.4 : 1;

        // Draw trail
        if (p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(${hue}, ${p.sat}%, ${p.light}%, ${alpha * 0.2})`;
          ctx.lineWidth = p.size * 0.6;
          ctx.lineCap = "round";
          ctx.stroke();
        }

        // Main particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, ${p.sat}%, ${p.light}%, ${alpha * twinkle})`;
        ctx.fill();

        // Beautiful multi-layer glow
        const glowLayers = p.type === "burst" || p.type === "star" ? 3 : 2;
        for (let g = 0; g < glowLayers; g++) {
          const glowSize = p.size * (3 + g * 2.5);
          const glowAlpha = alpha * (0.15 - g * 0.04) * twinkle;
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
          grad.addColorStop(0, `hsla(${hue}, ${p.sat}%, ${p.light + 10}%, ${glowAlpha})`);
          grad.addColorStop(0.5, `hsla(${hue}, ${p.sat - 10}%, ${p.light}%, ${glowAlpha * 0.4})`);
          grad.addColorStop(1, `hsla(${hue}, ${p.sat}%, ${p.light}%, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Connection lines (only ambient + nearby)
        if (p.type === "ambient" || p.type === "trail") {
          for (let j = i - 1; j >= Math.max(0, i - 12); j--) {
            const p2 = particles[j];
            if (p2.type !== "ambient" && p2.type !== "trail") continue;
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100) {
              const lineAlpha = (1 - dist / 100) * 0.12 * alpha;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `hsla(${lerp(hue, (p2.hue + globalHueRef.current * 0.3) % 360, 0.5)}, 65%, 55%, ${lineAlpha})`;
              ctx.lineWidth = 0.4;
              ctx.stroke();
            }
          }
        }
      }

      // Draw ripples — smooth and elegant
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = now - r.startTime;
        if (age < 0) continue;
        const maxAge = 1400;
        if (age > maxAge) { ripples.splice(i, 1); continue; }
        const progress = age / maxAge;
        const ease = easeOutCubic(progress);
        const radius = ease * r.maxRadius;
        const alpha = (1 - progress) * 0.45;

        // Outer ring
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${r.hue}, 80%, 65%, ${alpha})`;
        ctx.lineWidth = r.thickness * (1 - progress);
        ctx.stroke();

        // Inner fill
        const rg = ctx.createRadialGradient(r.x, r.y, radius * 0.5, r.x, r.y, radius);
        rg.addColorStop(0, `hsla(${r.hue}, 80%, 65%, 0)`);
        rg.addColorStop(0.8, `hsla(${r.hue}, 80%, 65%, ${alpha * 0.05})`);
        rg.addColorStop(1, `hsla(${r.hue}, 80%, 65%, 0)`);
        ctx.beginPath();
        ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();
      }

      // Draw floating text — elegant fade
      const texts = textsRef.current;
      for (let i = texts.length - 1; i >= 0; i--) {
        const t = texts[i];
        const age = now - t.startTime;
        if (age > 1200) { texts.splice(i, 1); continue; }
        const progress = age / 1200;
        const alpha = progress < 0.2 ? easeOutCubic(progress / 0.2) : 1 - easeOutCubic((progress - 0.2) / 0.8);
        const yOff = easeOutCubic(progress) * 50;

        ctx.save();
        ctx.globalAlpha = alpha * 0.8;
        ctx.font = `${t.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = `hsla(${t.hue}, 80%, 75%, 1)`;
        ctx.shadowColor = `hsla(${t.hue}, 80%, 65%, 0.5)`;
        ctx.shadowBlur = 12;
        ctx.fillText(t.text, t.x, t.y - yOff);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [spawn, addRipple, triggerRandomEvent, cw, ch]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = mouseRef.current;
    m.px = m.x; m.py = m.y;
    m.x = e.clientX - rect.left;
    m.y = e.clientY - rect.top;
    m.active = true;
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    comboRef.current++;
    comboTimerRef.current = Date.now();
    setCombo(comboRef.current);

    const burstSize = Math.min(12 + comboRef.current * 4, 45);
    spawn(x, y, burstSize, "burst");
    addRipple(x, y);

    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    addText(
      comboRef.current > 3 ? `${comboRef.current}×` : word,
      x, y, comboRef.current > 3 ? 18 : 16,
    );

    if (comboRef.current === 5) {
      attractorsRef.current.push({ x, y, strength: 3.5, startTime: Date.now(), duration: 2500, hue: globalHueRef.current + 60 });
      addText("⟲ VORTEX", x, y - 30, 12);
    }
    if (comboRef.current >= 8) {
      spawn(x, y, 35, "star");
      for (let r = 0; r < 3; r++) {
        addRipple(x, y, { maxRadius: 100 + r * 60 });
      }
      addText("✦ SUPERNOVA", x, y - 30, 14);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    attractorsRef.current.push({ x, y, strength: 6, startTime: Date.now(), duration: 4500, hue: 275 });
    addText("⟲ BLACK HOLE", x, y, 14);
    for (let r = 0; r < 4; r++) {
      setTimeout(() => addRipple(x, y, { maxRadius: 180, thickness: 2, hue: 275 + r * 10 }), r * 200);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = e.touches[0];
    const m = mouseRef.current;
    m.px = m.x; m.py = m.y;
    m.x = t.clientX - rect.left;
    m.y = t.clientY - rect.top;
    m.active = true; m.holding = true;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    mouseRef.current = { x, y, px: x, py: y, active: true, holding: true };
    spawn(x, y, 18, "burst");
    addRipple(x, y);
    addText(WORDS[Math.floor(Math.random() * WORDS.length)], x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full cursor-crosshair"
      style={{ touchAction: "none" }}
      onMouseMove={handleMouseMove}
      onMouseDown={() => { mouseRef.current.holding = true; }}
      onMouseUp={() => { mouseRef.current.holding = false; }}
      onMouseLeave={() => { mouseRef.current.active = false; mouseRef.current.holding = false; }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { mouseRef.current.active = false; mouseRef.current.holding = false; }}
    />
  );
};

const InteractiveAnimation = () => {
  const [showHint, setShowHint] = useState(true);
  const [showEvent, setShowEvent] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 5500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <InteractiveCanvas />

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 glass px-8 py-4 rounded-2xl font-mono text-xs text-muted-foreground pointer-events-none tracking-wider"
          >
            <span className="text-primary">hover</span> to push
            <span className="mx-2 opacity-30">·</span>
            <span className="text-primary">click</span> to burst
            <span className="mx-2 opacity-30">·</span>
            <span className="text-primary">hold</span> to attract
            <span className="mx-2 opacity-30">·</span>
            <span className="text-primary">double-click</span> black hole
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveAnimation;
