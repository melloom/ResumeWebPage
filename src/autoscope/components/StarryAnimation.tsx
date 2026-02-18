import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import VoiceNarration from "@/autoscope/components/VoiceNarration";

interface Star {
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  color: string;
  vx: number;
  vy: number;
  isForming?: boolean;
  formationStrength?: number;
  // Enhanced star properties
  glowIntensity?: number;
  pulsePhase?: number;
  constellationId?: number;
  isConstellationStar?: boolean;
  twinkleOffset?: number;
  colorShift?: number;
  coreSize?: number;
  haloSize?: number;
  // Autonomous behavior properties
  isAutonomous?: boolean;
  wanderAngle?: number;
  wanderSpeed?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  orbitCenterX?: number;
  orbitCenterY?: number;
  orbitAngle?: number;
  clickExplosionPower?: number;
  isExploding?: boolean;
  explosionTime?: number;
  targetColor?: string;
  colorTransitionTime?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'explosion' | 'trail' | 'spark' | 'fragment' | 'orb' | 'ring' | 'missile' | 'firework';
  trail: { x: number; y: number; life: number }[];
  gravity?: number;
  friction?: number;
  glowIntensity?: number;
  explosionPower?: number;
  parentColor?: string;
  rotation?: number;
  rotationSpeed?: number;
}

interface ClickRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  color: string;
}

interface MouseTrail {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  lifeRatio?: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  color: string;
  trail: { x: number; y: number; opacity: number }[];
}

interface FloatingWord {
  x: number;
  y: number;
  z: number; // 3D depth
  vx: number;
  vy: number;
  vz: number; // 3D velocity
  text: string;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  isAmbient: boolean;
  birthTime: number;
  personality?: 'curious' | 'social' | 'shy' | 'playful' | 'wanderer' | 'explorer' | 'follower' | 'leader';
  energy?: number;
  mood?: number;
  socialRadius?: number;
  avoidanceRadius?: number;
  preferredDistance?: number;
  wanderAngle?: number;
  flowPhase?: number;
  connections?: number[];
  lastInteraction?: number;
  decisionTimer?: number;
  glowIntensity?: number;
  pulseSpeed?: number;
  // 3D properties
  depthScale?: number;
  perspectiveOffset?: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  shadowBlur?: number;
}

interface ConstellationLine {
  star1Index: number;
  star2Index: number;
  strength: number;
  color: string;
}

interface Planet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitCenterX: number;
  orbitCenterY: number;
  orbitAngle: number;
  rotation: number;
  rotationSpeed: number;
  moons: Moon[];
  ringRadius?: number;
  ringOpacity?: number;
  atmosphereColor?: string;
  atmosphereSize?: number;
  isGasGiant?: boolean;
  clickExplosionPower?: number;
  isExploding?: boolean;
  explosionTime?: number;
}

interface Moon {
  x: number;
  y: number;
  size: number;
  color: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitAngle: number;
  parentPlanet: Planet;
  rotation: number;
  rotationSpeed: number;
  phase: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  irregularity: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  tailLength: number;
  color: string;
  tailParticles: { x: number; y: number; opacity: number }[];
  brightness: number;
}

interface NebulaCloud {
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  driftX: number;
  driftY: number;
  pulsePhase: number;
  cloudDensity: number;
}

interface DrawingLine {
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
  age: number;
  maxAge: number;
}

interface DrawingPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
}

interface BlackHole {
  x: number;
  y: number;
  radius: number;
  mass: number;
  isActive: boolean;
  age: number;
  maxAge: number;
  pullStrength: number;
  absorbedStars: number;
  explosionTime: number;
  isExploding: boolean;
}

type ShapePattern = 'circle' | 'heart' | 'spiral' | 'infinity' | 'star' | 'random';

const MAX_STARS = 250; // Reduced from 300 for performance
const MAX_PARTICLES = 60; // Reduced from 100 for performance
const MAX_FLOATING_WORDS = 10; // Reduced from 12 for performance
const CURSOR_RADIUS = 120;
const FORMATION_RADIUS = 100;

interface StarryAnimationProps {
  onNarrationChange?: (playing: boolean) => void;
}

const StarryAnimation = ({ onNarrationChange }: StarryAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -999, y: -999, active: false, isAttracting: false, isDrawing: false, stationaryTime: 0 });
  const starsRef = useRef<Star[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const constellationLinesRef = useRef<ConstellationLine[]>([]);
  const clickRipplesRef = useRef<ClickRipple[]>([]);
  const mouseTrailsRef = useRef<MouseTrail[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const floatingWordsRef = useRef<FloatingWord[]>([]);
  const drawingLinesRef = useRef<DrawingLine[]>([]);
  const currentDrawingRef = useRef<DrawingLine | null>(null);
  const blackHolesRef = useRef<BlackHole[]>([]);
  const frameRef = useRef(0);
  const currentShapeRef = useRef<ShapePattern>('random');
  const formationProgressRef = useRef(0);
  const [showHint, setShowHint] = useState(true);
  const [clickCount, setClickCount] = useState(0);
  const [currentShape, setCurrentShape] = useState<ShapePattern>('random');

  const cw = useCallback(() => canvasRef.current?.offsetWidth ?? 0, []);
  const ch = useCallback(() => canvasRef.current?.offsetHeight ?? 0, []);

  // Shape generation functions
  const generateCirclePoints = useCallback((centerX: number, centerY: number, radius: number, count: number) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return points;
  }, []);

  const generateHeartPoints = useCallback((centerX: number, centerY: number, size: number, count: number) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(t), 3);
      const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      points.push({
        x: centerX + x * size / 16,
        y: centerY + y * size / 16
      });
    }
    return points;
  }, []);

  const generateSpiralPoints = useCallback((centerX: number, centerY: number, maxRadius: number, count: number) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 6; // 3 full rotations
      const radius = (i / count) * maxRadius;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return points;
  }, []);

  const generateInfinityPoints = useCallback((centerX: number, centerY: number, size: number, count: number) => {
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const scale = size / (1 + Math.sin(t) * Math.sin(t));
      points.push({
        x: centerX + scale * Math.cos(t),
        y: centerY + scale * Math.sin(2 * t) / 2
      });
    }
    return points;
  }, []);

  const generateStarPoints = useCallback((centerX: number, centerY: number, outerRadius: number, count: number) => {
    const points: { x: number; y: number }[] = [];
    const innerRadius = outerRadius * 0.4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
    return points;
  }, []);

  const createStar = useCallback((x?: number, y?: number): Star => {
    const isConstellation = Math.random() > 0.7; // 30% chance to be constellation star
    const baseHue = isConstellation ? 220 + Math.random() * 40 : 200 + Math.random() * 60;
    
    return {
      x: x ?? Math.random() * cw(),
      y: y ?? Math.random() * ch(),
      size: Math.random() * 3 + 0.5,
      brightness: Math.random(),
      twinkleSpeed: 0.01 + Math.random() * 0.04,
      color: `hsl(${baseHue}, 85%, ${75 + Math.random() * 25}%)`,
      vx: 0,
      vy: 0,
      isForming: false,
      formationStrength: 0,
      // Enhanced star properties
      glowIntensity: isConstellation ? 2.5 : 1.5,
      pulsePhase: Math.random() * Math.PI * 2,
      constellationId: isConstellation ? Math.floor(Math.random() * 5) : undefined,
      isConstellationStar: isConstellation,
      twinkleOffset: Math.random() * Math.PI * 2,
      colorShift: Math.random() * 20 - 10,
      coreSize: Math.random() * 1.5 + 0.5,
      haloSize: Math.random() * 8 + 4,
      // Autonomous behavior properties
      isAutonomous: isConstellation && Math.random() > 0.5, // 50% of constellation stars are autonomous
      wanderAngle: Math.random() * Math.PI * 2,
      wanderSpeed: Math.random() * 0.5 + 0.1,
      orbitRadius: Math.random() * 50 + 20,
      orbitSpeed: Math.random() * 0.02 + 0.005,
      orbitCenterX: x ?? Math.random() * cw(),
      orbitCenterY: y ?? Math.random() * ch(),
      orbitAngle: Math.random() * Math.PI * 2,
      clickExplosionPower: 0,
      isExploding: false,
      explosionTime: 0,
      targetColor: '',
      colorTransitionTime: 0,
    };
  }, [cw, ch]);

  const createPlanet = useCallback((x?: number, y?: number): Planet => {
    const planetTypes = ['rocky', 'gas-giant', 'ice-giant', 'desert', 'ocean'];
    const type = planetTypes[Math.floor(Math.random() * planetTypes.length)];
    
    let color, size, hasRings, hasAtmosphere;
    
    switch (type) {
      case 'rocky':
        color = `hsl(${Math.random() * 60 + 20}, 60%, ${Math.random() * 30 + 40}%)`;
        size = Math.random() * 8 + 4;
        hasRings = false;
        hasAtmosphere = Math.random() > 0.5;
        break;
      case 'gas-giant':
        color = `hsl(${Math.random() * 60 + 180}, 70%, ${Math.random() * 20 + 50}%)`;
        size = Math.random() * 15 + 10;
        hasRings = Math.random() > 0.3;
        hasAtmosphere = true;
        break;
      case 'ice-giant':
        color = `hsl(${Math.random() * 40 + 180}, 80%, ${Math.random() * 20 + 60}%)`;
        size = Math.random() * 12 + 8;
        hasRings = Math.random() > 0.5;
        hasAtmosphere = true;
        break;
      case 'desert':
        color = `hsl(${Math.random() * 40 + 20}, 70%, ${Math.random() * 20 + 40}%)`;
        size = Math.random() * 10 + 6;
        hasRings = false;
        hasAtmosphere = Math.random() > 0.7;
        break;
      case 'ocean':
        color = `hsl(${Math.random() * 40 + 200}, 80%, ${Math.random() * 20 + 50}%)`;
        size = Math.random() * 10 + 6;
        hasRings = false;
        hasAtmosphere = Math.random() > 0.6;
        break;
      default:
        color = `hsl(${Math.random() * 360}, 70%, 50%)`;
        size = Math.random() * 10 + 5;
        hasRings = false;
        hasAtmosphere = false;
    }
    
    const planet: Planet = {
      x: x ?? Math.random() * cw(),
      y: y ?? Math.random() * ch(),
      vx: 0,
      vy: 0,
      size,
      color,
      orbitRadius: Math.random() * 200 + 100,
      orbitSpeed: Math.random() * 0.005 + 0.001,
      orbitCenterX: cw() / 2,
      orbitCenterY: ch() / 2,
      orbitAngle: Math.random() * Math.PI * 2,
      rotation: 0,
      rotationSpeed: Math.random() * 0.02 + 0.005,
      moons: [],
      ringRadius: hasRings ? size * 1.8 : undefined,
      ringOpacity: hasRings ? Math.random() * 0.3 + 0.1 : undefined,
      atmosphereColor: hasAtmosphere ? color.replace(')', ', 0.1)').replace('hsl', 'hsla') : undefined,
      atmosphereSize: hasAtmosphere ? size * 1.3 : undefined,
      isGasGiant: type === 'gas-giant',
      clickExplosionPower: 0,
      isExploding: false,
      explosionTime: 0,
    };
    
    // Add moons
    const moonCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < moonCount; i++) {
      const moon: Moon = {
        x: 0,
        y: 0,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 180}, 60%, ${Math.random() * 20 + 60}%)`,
        orbitRadius: size * 2 + i * 8,
        orbitSpeed: Math.random() * 0.05 + 0.02,
        orbitAngle: (i / moonCount) * Math.PI * 2,
        parentPlanet: planet,
        rotation: 0,
        rotationSpeed: Math.random() * 0.03 + 0.01,
        phase: Math.random() * Math.PI * 2,
      };
      planet.moons.push(moon);
    }
    
    return planet;
  }, [cw, ch]);

  const createAsteroid = useCallback((x?: number, y?: number): Asteroid => {
    return {
      x: x ?? Math.random() * cw(),
      y: y ?? Math.random() * ch(),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: Math.random() * 3 + 1,
      color: `hsl(${Math.random() * 60 + 30}, 50%, ${Math.random() * 30 + 40}%)`,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      irregularity: Math.random() * 0.3 + 0.2,
    };
  }, [cw, ch]);

  const createComet = useCallback((x?: number, y?: number): Comet => {
    return {
      x: x ?? Math.random() * cw(),
      y: y ?? Math.random() * ch() * 0.3,
      vx: Math.random() * 3 + 1,
      vy: Math.random() * 2 + 1,
      size: Math.random() * 4 + 2,
      tailLength: Math.random() * 50 + 30,
      color: `hsl(${Math.random() * 60 + 180}, 90%, 80%)`,
      tailParticles: [],
      brightness: Math.random() * 0.5 + 0.5,
    };
  }, [cw, ch]);

  const createNebulaCloud = useCallback((x?: number, y?: number): NebulaCloud => {
    const colors = ['hsl(280, 70%, 50%)', 'hsl(320, 60%, 40%)', 'hsl(200, 80%, 30%)', 'hsl(160, 70%, 35%)'];
    return {
      x: x ?? Math.random() * cw(),
      y: y ?? Math.random() * ch(),
      size: Math.random() * 150 + 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.3 + 0.1,
      driftX: (Math.random() - 0.5) * 0.5,
      driftY: (Math.random() - 0.5) * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      cloudDensity: Math.random() * 0.5 + 0.3,
    };
  }, [cw, ch]);

  const createFloatingWord = useCallback((x: number, y: number, isAmbient: boolean = false): FloatingWord => {
    const words = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'API', 'Git', 'Docker', 
      'Kubernetes', 'MongoDB', 'PostgreSQL', 'Redis', 'AWS', 'Azure', 'GraphQL', 
      'REST', 'JSON', 'CSS', 'HTML', 'Webpack', 'Vite', 'Next.js', 'Vue.js', 
      'Angular', 'Express', 'NPM', 'Yarn', 'ESLint', 'Prettier', 'Jest', 'Cypress',
      'Dockerfile', 'CI/CD', 'DevOps', 'Frontend', 'Backend', 'Fullstack', 'Database',
      'Algorithm', 'DataStructure', 'Async', 'Promise', 'Callback', 'Hook', 'State',
      'Redux', 'Context', 'Component', 'Props', 'Render', 'Deploy', 'Build', 'Test',
      'Debug', 'Console', 'Terminal', 'VSCode', 'GitHub', 'GitLab', 'Slack', 'Jira',
      'Agile', 'Scrum', 'Sprint', 'Commit', 'Branch', 'Merge', 'PullRequest', 'CodeReview'
    ];
    const word = words[Math.floor(Math.random() * words.length)];
    
    return {
      x,
      y,
      z: Math.random() * 100 - 50, // Random depth between -50 and 50
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      vz: (Math.random() - 0.5) * 0.5, // Slower Z movement
      text: word,
      size: 16 + Math.random() * 10,
      color: `hsl(${180 + Math.random() * 120}, 80%, 70%)`,
      opacity: 1,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.03,
      isAmbient,
      birthTime: Date.now(),
      personality: ['curious', 'social', 'shy', 'playful', 'wanderer', 'explorer', 'follower', 'leader'][Math.floor(Math.random() * 8)] as any,
      energy: Math.random() * 0.8 + 0.2,
      mood: Math.random() * 0.8 + 0.2,
      // 3D properties
      depthScale: 0.8 + Math.random() * 0.4,
      perspectiveOffset: 0.5 + Math.random() * 0.3,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0,
      shadowBlur: 3 + Math.random() * 5,
      socialRadius: 100 + Math.random() * 50,
      avoidanceRadius: 60 + Math.random() * 30,
      preferredDistance: 80 + Math.random() * 40,
      wanderAngle: Math.random() * Math.PI * 2,
      flowPhase: Math.random() * Math.PI * 2,
      connections: [],
      lastInteraction: Date.now(),
      decisionTimer: 0,
      glowIntensity: Math.random() * 2 + 1,
      pulseSpeed: 0.002 + Math.random() * 0.003,
    };
  }, []);

  const createParticle = useCallback((x: number, y: number, type: Particle['type'] = 'explosion', color?: string): Particle => {
    const baseColor = color || `hsl(${Math.random() * 360}, 70%, 60%)`;
    const angle = Math.random() * Math.PI * 2;
    let speed = 1;
    let size = 2;
    let maxLife = 60;
    let gravity = 0.1;
    let friction = 0.98;
    let glowIntensity = 1;

    switch (type) {
      case 'explosion':
        speed = Math.random() * 8 + 4;
        size = Math.random() * 4 + 2;
        maxLife = 40 + Math.random() * 30;
        gravity = 0.05;
        friction = 0.96;
        glowIntensity = 2;
        break;
      case 'trail':
        speed = Math.random() * 2 + 1;
        size = Math.random() * 2 + 1;
        maxLife = 80 + Math.random() * 40;
        gravity = 0;
        friction = 0.99;
        glowIntensity = 1.5;
        break;
      case 'spark':
        speed = Math.random() * 12 + 6;
        size = Math.random() * 1.5 + 0.5;
        maxLife = 20 + Math.random() * 20;
        gravity = 0.15;
        friction = 0.95;
        glowIntensity = 3;
        break;
      case 'fragment':
        speed = Math.random() * 6 + 2;
        size = Math.random() * 3 + 1;
        maxLife = 60 + Math.random() * 40;
        gravity = 0.08;
        friction = 0.97;
        glowIntensity = 1.2;
        break;
      case 'orb':
        speed = Math.random() * 1 + 0.5;
        size = Math.random() * 6 + 4;
        maxLife = 100 + Math.random() * 50;
        gravity = -0.02; // Floats up
        friction = 0.98;
        glowIntensity = 2.5;
        break;
      case 'ring':
        speed = Math.random() * 3 + 2;
        size = Math.random() * 2 + 1;
        maxLife = 50 + Math.random() * 30;
        gravity = 0;
        friction = 0.99;
        glowIntensity = 2;
        break;
      case 'missile':
        speed = Math.random() * 4 + 8;
        size = Math.random() * 2 + 1;
        maxLife = 30 + Math.random() * 20;
        gravity = 0.12;
        friction = 0.94;
        glowIntensity = 3;
        break;
      case 'firework':
        speed = Math.random() * 10 + 5;
        size = Math.random() * 3 + 2;
        maxLife = 35 + Math.random() * 25;
        gravity = 0.2;
        friction = 0.92;
        glowIntensity = 4;
        break;
    }

    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size,
      life: 0,
      maxLife,
      color: baseColor,
      type,
      trail: [],
      gravity,
      friction,
      glowIntensity,
      parentColor: baseColor,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    };
  }, []);

  const createClickRipple = useCallback((x: number, y: number) => {
    const ripple: ClickRipple = {
      x,
      y,
      radius: 0,
      maxRadius: 200,
      life: 0,
      maxLife: 60,
      color: `hsl(${200 + Math.random() * 60}, 80%, 70%)`
    };
    clickRipplesRef.current.push(ripple);
    
    // Remove old ripples
    clickRipplesRef.current = clickRipplesRef.current.filter(r => r.life < r.maxLife);
  }, []);

  const createMouseTrail = useCallback((x: number, y: number) => {
    if (mouseTrailsRef.current.length > 20) return;
    
    // Simplified physics-based mouse trail
    const trail: MouseTrail = {
      x,
      y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      life: 0,
      maxLife: 30 + Math.random() * 15,
      size: Math.random() * 3 + 1.5,
      color: `hsl(${180 + Math.random() * 120}, 80%, 70%)`,
      lifeRatio: 1
    };
    
    // Add initial velocity based on mouse movement
    if (mouseRef.current.active) {
      const dx = x - mouseRef.current.x;
      const dy = y - mouseRef.current.y;
      trail.vx += dx * 0.08;
      trail.vy += dy * 0.08;
    }
    
    mouseTrailsRef.current.push(trail);
  }, []);

  const formShape = useCallback((shape: ShapePattern, centerX: number, centerY: number) => {
    const starsToUse = Math.min(50, starsRef.current.length);
    const selectedStars = starsRef.current.slice(-starsToUse);
    
    let points: { x: number; y: number }[] = [];
    
    switch (shape) {
      case 'circle':
        points = generateCirclePoints(centerX, centerY, FORMATION_RADIUS, starsToUse);
        break;
      case 'heart':
        points = generateHeartPoints(centerX, centerY, FORMATION_RADIUS * 0.8, starsToUse);
        break;
      case 'spiral':
        points = generateSpiralPoints(centerX, centerY, FORMATION_RADIUS, starsToUse);
        break;
      case 'infinity':
        points = generateInfinityPoints(centerX, centerY, FORMATION_RADIUS, starsToUse);
        break;
      case 'star':
        points = generateStarPoints(centerX, centerY, FORMATION_RADIUS, Math.min(10, starsToUse));
        // Add more stars for remaining
        while (points.length < starsToUse) {
          points.push(...generateStarPoints(centerX, centerY, FORMATION_RADIUS * 0.6, Math.min(10, starsToUse - points.length)));
        }
        break;
      default:
        return;
    }

    selectedStars.forEach((star, i) => {
      if (i < points.length) {
        star.targetX = points[i].x;
        star.targetY = points[i].y;
        star.isForming = true;
        star.formationStrength = 0;
      }
    });

    currentShapeRef.current = shape;
    setCurrentShape(shape);
    formationProgressRef.current = 0;
  }, [generateCirclePoints, generateHeartPoints, generateSpiralPoints, generateInfinityPoints, generateStarPoints]);


  const createStarExplosion = useCallback((star: Star) => {
    const colors = ['hsl(0, 100%, 60%)', 'hsl(30, 100%, 60%)', 'hsl(60, 100%, 60%)', 'hsl(120, 100%, 60%)', 'hsl(180, 100%, 60%)', 'hsl(240, 100%, 60%)', 'hsl(300, 100%, 60%)'];
    const explosionPower = star.clickExplosionPower || 1;
    
    for (let i = 0; i < 20 * explosionPower; i++) {
      const angle = (i / (20 * explosionPower)) * Math.PI * 2;
      const speed = (Math.random() * 4 + 2) * explosionPower;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = createParticle(star.x, star.y, 'explosion', color);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.explosionPower = explosionPower;
      particle.maxLife = 30 + Math.random() * 20;
      particle.size = Math.random() * 3 + 1;
      
      particlesRef.current.push(particle);
    }
    
    // Create ring explosion
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 2 * explosionPower;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      const particle = createParticle(star.x, star.y, 'ring', color);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.maxLife = 25;
      particle.size = 2;
      
      particlesRef.current.push(particle);
    }
  }, [createParticle]);

  const spawnParticles = useCallback((x: number, y: number, count: number) => {
    const types: Particle['type'][] = ['explosion', 'trail', 'spark', 'fragment', 'orb', 'ring', 'missile', 'firework'];
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const color = `hsl(${Math.random() * 360}, 80%, 65%)`;
      particlesRef.current.push(createParticle(x, y, type, color));
    }
    
    // Create secondary explosions for certain types
    if (Math.random() > 0.7) {
      for (let i = 0; i < 5; i++) {
        const offsetX = x + (Math.random() - 0.5) * 30;
        const offsetY = y + (Math.random() - 0.5) * 30;
        particlesRef.current.push(createParticle(offsetX, offsetY, 'spark', '#ffaa00'));
      }
    }
    
    while (particlesRef.current.length > MAX_PARTICLES) {
      particlesRef.current.shift();
    }
  }, [createParticle]);

  const createParticleExplosion = useCallback((x: number, y: number, intensity: number = 1) => {
    const particleCount = Math.floor(20 * intensity);
    
    // Create main explosion
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = Math.random() * 6 + 4 * intensity;
      const color = `hsl(${20 + Math.random() * 40}, 100%, ${50 + Math.random() * 30}%)`; // Orange/yellow colors
      
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color,
        type: 'explosion',
        trail: [],
        gravity: 0.08,
        friction: 0.96,
        glowIntensity: 3,
        parentColor: color,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
      });
    }
    
    // Create trailing sparks
    for (let i = 0; i < particleCount / 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 6;
      
      particlesRef.current.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 1.5 + 0.5,
        life: 0,
        maxLife: 15 + Math.random() * 15,
        color: '#ffdd00',
        type: 'spark',
        trail: [],
        gravity: 0.15,
        friction: 0.94,
        glowIntensity: 4,
        parentColor: '#ffdd00',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
      });
    }
    
    while (particlesRef.current.length > MAX_PARTICLES) {
      particlesRef.current.shift();
    }
  }, []);

  const triggerStarExplosion = useCallback((starIndex: number) => {
    const star = starsRef.current[starIndex];
    if (!star || star.isExploding) return;
    
    // Create particle explosion at star position
    createParticleExplosion(star.x, star.y, 2);
    spawnParticles(star.x, star.y, 15);
    
    // Remove the star from the array (it explodes and disappears)
    starsRef.current.splice(starIndex, 1);
  }, [createParticleExplosion, spawnParticles]);

  const updateAutonomousStars = useCallback(() => {
    starsRef.current.forEach((star, index) => {
      if (!star.isAutonomous || star.isExploding) return;
      
      // Handle explosion state
      if (star.isExploding && Date.now() - star.explosionTime > 500) {
        star.isExploding = false;
        star.clickExplosionPower = Math.max(0, star.clickExplosionPower - 0.2);
      }
      
      // Color transition
      if (star.targetColor && star.colorTransitionTime) {
        const transitionDuration = 1000; // 1 second transition
        const progress = Math.min(1, (Date.now() - star.colorTransitionTime) / transitionDuration);
        
        if (progress < 1) {
          // Interpolate color
          const currentHue = parseInt(star.color.match(/\d+/)[0]);
          const targetHue = parseInt(star.targetColor.match(/\d+/)[0]);
          const newHue = currentHue + (targetHue - currentHue) * progress;
          star.color = star.color.replace(/\d+/, newHue.toString());
        } else {
          star.color = star.targetColor;
          star.targetColor = '';
        }
      }
      
      // Autonomous movement patterns
      if (Math.random() > 0.98) {
        // Randomly change movement pattern
        const patterns = ['wander', 'orbit', 'spiral'];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        switch (pattern) {
          case 'wander':
            star.wanderAngle = Math.random() * Math.PI * 2;
            star.wanderSpeed = Math.random() * 0.5 + 0.1;
            break;
          case 'orbit':
            star.orbitRadius = Math.random() * 50 + 20;
            star.orbitSpeed = Math.random() * 0.02 + 0.005;
            star.orbitCenterX = Math.random() * cw();
            star.orbitCenterY = Math.random() * ch();
            break;
          case 'spiral':
            star.orbitRadius = 10;
            star.orbitSpeed = 0.05;
            star.orbitCenterX = star.x;
            star.orbitCenterY = star.y;
            star.orbitRadius = Math.min(100, star.orbitRadius + 0.5);
            break;
        }
      }
      
      // Apply movement
      if (star.orbitRadius !== undefined && star.orbitSpeed !== undefined) {
        // Orbital movement
        star.orbitAngle = (star.orbitAngle || 0) + star.orbitSpeed;
        star.x = star.orbitCenterX + Math.cos(star.orbitAngle) * star.orbitRadius;
        star.y = star.orbitCenterY + Math.sin(star.orbitAngle) * star.orbitRadius;
      } else if (star.wanderAngle !== undefined && star.wanderSpeed !== undefined) {
        // Wandering movement
        star.wanderAngle += (Math.random() - 0.5) * 0.2;
        star.vx = Math.cos(star.wanderAngle) * star.wanderSpeed;
        star.vy = Math.sin(star.wanderAngle) * star.wanderSpeed;
        star.x += star.vx;
        star.y += star.vy;
        
        // Apply damping
        star.vx *= 0.98;
        star.vy *= 0.98;
      }
      
      // Wrap around edges
      if (star.x < 0) star.x = cw();
      if (star.x > cw()) star.x = 0;
      if (star.y < 0) star.y = ch();
      if (star.y > ch()) star.y = 0;
    });
  }, [cw, ch]);



  const spawnFloatingWord = useCallback((x: number, y: number) => {
    if (floatingWordsRef.current.length < MAX_FLOATING_WORDS) {
      floatingWordsRef.current.push(createFloatingWord(x, y));
    }
  }, [createFloatingWord]);

  const makeAutonomousDecision = useCallback((word: FloatingWord, wordIndex: number) => {
    if (!word.personality || !word.energy || !word.mood) return;
    
    const currentTime = Date.now();
    const nearbyWords = floatingWordsRef.current.filter((w, i) => 
      i !== wordIndex && w.isAmbient && w.personality && w.energy && w.mood
    );
    
    switch (word.personality) {
      case 'curious':
        // Curious words explore and investigate nearby words
        if (nearbyWords.length > 0 && Math.random() > 0.3) {
          const target = nearbyWords[Math.floor(Math.random() * nearbyWords.length)];
          const dx = target.x - word.x;
          const dy = target.y - word.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < word.socialRadius) {
            word.vx += (dx / dist) * 0.1 * word.energy;
            word.vy += (dy / dist) * 0.1 * word.energy;
          }
        } else {
          // Random exploration
          word.wanderAngle = (word.wanderAngle || 0) + (Math.random() - 0.5) * Math.PI * 0.5;
          word.vx += Math.cos(word.wanderAngle) * 0.2 * word.energy;
          word.vy += Math.sin(word.wanderAngle) * 0.2 * word.energy;
        }
        break;
        
      case 'social':
        // Social words seek out other words
        if (nearbyWords.length > 0) {
          const closestWord = nearbyWords.reduce((closest, current) => {
            const distCurrent = Math.sqrt(Math.pow(current.x - word.x, 2) + Math.pow(current.y - word.y, 2));
            const distClosest = Math.sqrt(Math.pow(closest.x - word.x, 2) + Math.pow(closest.y - word.y, 2));
            return distCurrent < distClosest ? current : closest;
          });
          
          const dx = closestWord.x - word.x;
          const dy = closestWord.y - word.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > word.preferredDistance) {
            word.vx += (dx / dist) * 0.15 * word.energy;
            word.vy += (dy / dist) * 0.15 * word.energy;
          } else if (dist < word.avoidanceRadius) {
            word.vx -= (dx / dist) * 0.1 * word.energy;
            word.vy -= (dy / dist) * 0.1 * word.energy;
          }
        }
        break;
        
      case 'shy':
        // Shy words avoid others
        nearbyWords.forEach(otherWord => {
          const dx = word.x - otherWord.x;
          const dy = word.y - otherWord.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < word.avoidanceRadius) {
            word.vx += (dx / dist) * 0.2 * word.energy;
            word.vy += (dy / dist) * 0.2 * word.energy;
          }
        });
        break;
        
      case 'playful':
        // Playful words dance and move randomly
        word.wanderAngle = (word.wanderAngle || 0) + (Math.random() - 0.5) * Math.PI;
        word.vx += Math.cos(word.wanderAngle) * 0.3 * word.energy;
        word.vy += Math.sin(word.wanderAngle) * 0.3 * word.energy;
        break;
        
      case 'wanderer':
        // Wanderers move in flowing patterns
        if (word.flowPhase !== undefined) {
          word.vx += Math.cos(word.flowPhase) * 0.15 * word.energy;
          word.vy += Math.sin(word.flowPhase * 2) * 0.1 * word.energy;
        }
        break;
        
      case 'explorer':
        // Explorers move toward edges and new areas
        const centerX = cw() / 2;
        const centerY = ch() / 2;
        const dxFromCenter = word.x - centerX;
        const dyFromCenter = word.y - centerY;
        const distFromCenter = Math.sqrt(dxFromCenter * dxFromCenter + dyFromCenter * dyFromCenter);
        
        if (distFromCenter < Math.min(cw(), ch()) * 0.3) {
          word.vx += (dxFromCenter / distFromCenter) * 0.1 * word.energy;
          word.vy += (dyFromCenter / distFromCenter) * 0.1 * word.energy;
        }
        break;
        
      case 'follower':
        // Followers follow the nearest leader or social word
        const leaders = nearbyWords.filter(w => w.personality === 'leader' || w.personality === 'social');
        if (leaders.length > 0) {
          const target = leaders[0];
          const dx = target.x - word.x;
          const dy = target.y - word.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > word.preferredDistance && dist < word.socialRadius) {
            word.vx += (dx / dist) * 0.12 * word.energy;
            word.vy += (dy / dist) * 0.12 * word.energy;
          }
        }
        break;
        
      case 'leader':
        // Leaders move confidently and attract followers
        word.wanderAngle = (word.wanderAngle || 0) + (Math.random() - 0.5) * Math.PI * 0.3;
        word.vx += Math.cos(word.wanderAngle) * 0.1 * word.energy;
        word.vy += Math.sin(word.wanderAngle) * 0.1 * word.energy;
        break;
    }
  }, [cw, ch]);

  const applyAutonomousMovement = useCallback((word: FloatingWord, wordIndex: number) => {
    // Apply friction
    word.vx *= 0.98;
    word.vy *= 0.98;
    
    // Apply flow movement
    if (word.flowPhase !== undefined) {
      word.flowPhase += 0.02;
      word.vx += Math.cos(word.flowPhase) * 0.02;
      word.vy += Math.sin(word.flowPhase * 1.5) * 0.02;
    }
    
    // Limit maximum speed
    const currentSpeed = Math.sqrt(word.vx * word.vx + word.vy * word.vy);
    const maxSpeed = 2 + (word.energy || 0.5) * 2;
    if (currentSpeed > maxSpeed) {
      word.vx = (word.vx / currentSpeed) * maxSpeed;
      word.vy = (word.vy / currentSpeed) * maxSpeed;
    }
  }, []);

  const drawWordConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    const words = floatingWordsRef.current.filter(w => w.isAmbient && w.personality);
    
    words.forEach((word1, i) => {
      words.forEach((word2, j) => {
        if (i >= j) return; // Avoid duplicate connections
        
        const dx = word2.x - word1.x;
        const dy = word2.y - word1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Connect based on personalities and distance
        let shouldConnect = false;
        let connectionStrength = 0;
        
        if (word1.personality === 'social' || word2.personality === 'social') {
          shouldConnect = dist < 120;
          connectionStrength = 0.3;
        } else if (word1.personality === 'follower' && word2.personality === 'leader') {
          shouldConnect = dist < 150;
          connectionStrength = 0.4;
        } else if (word1.personality === word2.personality && dist < 100) {
          shouldConnect = true;
          connectionStrength = 0.2;
        }
        
        if (shouldConnect) {
          const opacity = (1 - dist / 150) * connectionStrength * (word1.mood || 0.5) * (word2.mood || 0.5);
          
          ctx.beginPath();
          ctx.moveTo(word1.x, word1.y);
          ctx.lineTo(word2.x, word2.y);
          ctx.strokeStyle = `rgba(150, 200, 255, ${opacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
  }, []);

  const enhanceMouseInteraction = useCallback((word: FloatingWord, wordIndex: number) => {
    if (!word.isAmbient) return;
    
    const mouse = mouseRef.current;
    if (!mouse.active) return;
    
    const dx = mouse.x - word.x;
    const dy = mouse.y - word.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // Mouse affects words based on personality
    switch (word.personality) {
      case 'curious':
      case 'social':
        // Attracted to mouse
        if (dist < 150 && dist > 20) {
          word.vx += (dx / dist) * 0.1;
          word.vy += (dy / dist) * 0.1;
        }
        break;
        
      case 'shy':
        // Repelled by mouse
        if (dist < 100) {
          word.vx -= (dx / dist) * 0.2;
          word.vy -= (dy / dist) * 0.2;
        }
        break;
        
      case 'playful':
        // Dances around mouse
        if (dist < 80) {
          const angle = Math.atan2(dy, dx) + Math.PI / 2;
          word.vx += Math.cos(angle) * 0.15;
          word.vy += Math.sin(angle) * 0.15;
        }
        break;
    }
  }, []);

  const createDrawingLine = useCallback((x: number, y: number, color: string): DrawingLine => {
    return {
      points: [{ x, y }],
      color,
      width: 3 + Math.random() * 2,
      opacity: 1,
      age: 0,
      maxAge: 120 + Math.random() * 60
    };
  }, []);

  const addDrawingPoint = useCallback((line: DrawingLine, x: number, y: number) => {
    line.points.push({ x, y });
    // Limit points to prevent memory issues
    if (line.points.length > 100) {
      line.points.shift();
    }
  }, []);

  const disperseStarsFromLine = useCallback((line: DrawingLine) => {
    starsRef.current.forEach(star => {
      line.points.forEach(point => {
        const dx = star.x - point.x;
        const dy = star.y - point.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 50) { // Disperse stars near the drawing line
          const force = (1 - dist / 50) * 8;
          star.vx += (dx / dist) * force;
          star.vy += (dy / dist) * force;
          star.brightness = Math.min(1, star.brightness + 0.2);
        }
      });
    });
  }, []);

  const createDrawing = useCallback((x: number, y: number) => {
    const hue = Math.random() * 360;
    const color = `hsl(${hue}, 80%, 60%)`;
    const newLine = createDrawingLine(x, y, color);
    currentDrawingRef.current = newLine;
    drawingLinesRef.current.push(newLine);
  }, [createDrawingLine]);

  const updateDrawing = useCallback((x: number, y: number) => {
    if (currentDrawingRef.current) {
      addDrawingPoint(currentDrawingRef.current, x, y);
      disperseStarsFromLine(currentDrawingRef.current);
    }
  }, [addDrawingPoint, disperseStarsFromLine]);

  const finishDrawing = useCallback(() => {
    currentDrawingRef.current = null;
  }, []);

  const createBlackHole = useCallback((x: number, y: number, mass: number = 1): BlackHole => {
    return {
      x,
      y,
      radius: 10 + mass * 5,
      mass,
      isActive: true,
      age: 0,
      maxAge: 180 + mass * 60, // Bigger black holes last longer
      pullStrength: 0.5 + mass * 0.3,
      absorbedStars: 0,
      explosionTime: 0,
      isExploding: false
    };
  }, []);

  const updateBlackHoles = useCallback(() => {
    blackHolesRef.current = blackHolesRef.current.filter(blackHole => {
      blackHole.age++;
      
      if (blackHole.isExploding) {
        // Handle explosion phase
        blackHole.explosionTime++;
        
        if (blackHole.explosionTime === 1) {
          // Create massive explosion
          for (let i = 0; i < blackHole.absorbedStars * 3; i++) {
            const angle = (Math.PI * 2 * i) / (blackHole.absorbedStars * 3);
            const speed = 5 + Math.random() * 10;
            const particle = createParticle(
              blackHole.x + Math.cos(angle) * 10,
              blackHole.y + Math.sin(angle) * 10,
              'explosion',
              `hsl(${280 + Math.random() * 60}, 100%, ${70 + Math.random() * 30}%)`
            );
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.size = 2 + Math.random() * 4;
            particle.maxLife = 60 + Math.random() * 40;
            particlesRef.current.push(particle);
          }
          
          // Create new stars from explosion with 10-second movement
          for (let i = 0; i < Math.min(blackHole.absorbedStars, 20); i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const star = createStar(
              blackHole.x + Math.cos(angle) * distance,
              blackHole.y + Math.sin(angle) * distance
            );
            
            // Set initial velocity for 10-second movement
            star.vx = Math.cos(angle) * 2;
            star.vy = Math.sin(angle) * 2;
            star.brightness = 1;
            
            // Add explosion movement timer (10 seconds = 600 frames at 60fps)
            star.isExploding = true;
            star.explosionTime = 0;
            star.targetColor = `hsl(${280 + Math.random() * 60}, 100%, 80%)`;
            star.colorTransitionTime = 600; // 10 seconds
            
            starsRef.current.push(star);
          }
        }
        
        return blackHole.explosionTime < 30; // Explosion lasts 30 frames
      } else {
        // Check if black hole should explode (absorbed enough stars)
        if (blackHole.absorbedStars >= 10 || blackHole.age >= blackHole.maxAge) {
          blackHole.isExploding = true;
          blackHole.explosionTime = 0;
        }
        
        // Apply gravitational pull to ALL stars with super force
        starsRef.current.forEach(star => {
          const dx = blackHole.x - star.x;
          const dy = blackHole.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Much larger influence range for super black hole (500px radius)
          if (dist < blackHole.radius * 16.67) { // 30 * 16.67 = 500px influence range
            // Super strong gravitational force (100x stronger)
            const force = (blackHole.pullStrength * blackHole.mass * 100) / (dist * dist) * 1000;
            star.vx += (dx / dist) * force;
            star.vy += (dy / dist) * force;
            
            // Check if star is absorbed (larger absorption radius)
            if (dist < blackHole.radius * 1.5) { // 45px absorption radius
              star.isExploding = true;
              star.explosionTime = 0;
              blackHole.absorbedStars++;
              blackHole.mass += 0.5; // Black hole grows faster
              blackHole.radius = Math.min(blackHole.radius + 1, 80); // Cap max size at 80px
            }
          }
        });
        
        return blackHole.age < blackHole.maxAge || blackHole.isExploding;
      }
    });
  }, [createParticle, createStar]);

  const updateConstellationLines = useCallback(() => {
    constellationLinesRef.current = [];
    const stars = starsRef.current;
    
    // Only connect stars that are close to each other (within 150px)
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const star1 = stars[i];
        const star2 = stars[j];
        
        // Calculate distance between stars
        const dx = star2.x - star1.x;
        const dy = star2.y - star1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only connect if stars are close enough (within 150px)
        if (distance < 150) {
          // Calculate line strength based on distance (closer = stronger)
          const strength = 1 - (distance / 150);
          const baseHue = 200 + Math.random() * 60;
          
          // Create constellation line with dynamic properties
          constellationLinesRef.current.push({
            star1Index: i,
            star2Index: j,
            strength,
            color: `hsla(${baseHue}, 80%, 70%, ${strength * 0.4})`
          });
        }
      }
    }
    
    // Remove lines that are too weak or too long
    constellationLinesRef.current = constellationLinesRef.current.filter(line => 
      line.strength > 0.1 && 
      line.strength < 0.9
    );
    
    // Limit total number of constellation lines for performance
    if (constellationLinesRef.current.length > 50) {
      constellationLinesRef.current = constellationLinesRef.current.slice(-50);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    
    let animId: number;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    
    resize();
    window.addEventListener("resize", resize);

    // Initialize stars
    starsRef.current = [];
    for (let i = 0; i < MAX_STARS; i++) {
      starsRef.current.push(createStar());
    }

    // Start ambient word generation - optimized
    const ambientWordInterval = setInterval(() => {
      if (Math.random() > 0.5 && floatingWordsRef.current.length < MAX_FLOATING_WORDS) { // 50% chance instead of 60%
        const x = Math.random() * cw();
        const y = Math.random() * ch();
        floatingWordsRef.current.push(createFloatingWord(x, y, true));
      }
    }, 4000); // Increased from 3000ms to 4000ms
    
    // Create shooting stars occasionally - optimized
    const shootingStarInterval = setInterval(() => {
      if (shootingStarsRef.current.length < 2 && Math.random() > 0.8) { // Reduced max and increased threshold
        shootingStarsRef.current.push({
          x: Math.random() * cw(),
          y: Math.random() * ch() * 0.3,
          vx: Math.random() * 8 + 4,
          vy: Math.random() * 4 + 2,
          length: Math.random() * 30 + 20,
          opacity: 1,
          color: `hsl(${200 + Math.random() * 60}, 90%, 80%)`,
          trail: []
        });
      }
    }, 5000); // Increased from 3000ms to 5000ms

    // Create random shapes occasionally - More frequent for better visibility
    const shapeMakerInterval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to form shape (was 30%)
        // Only form shape if mouse is NOT stationary
        if (mouseRef.current.stationaryTime < 60) { // Less than 1 second
          const shapes: ShapePattern[] = ['circle', 'heart', 'spiral', 'infinity', 'star'];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];
          const centerX = cw() / 2 + (Math.random() - 0.5) * 200;
          const centerY = ch() / 2 + (Math.random() - 0.5) * 200;
          formShape(shape, centerX, centerY);
        }
      }
    }, 3000); // Every 3 seconds (was 8 seconds)

    const animate = () => {
      frameRef.current++;
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      // Clear with fade effect - optimized
      ctx.fillStyle = 'rgba(10, 10, 30, 0.1)';
      ctx.fillRect(0, 0, W, H);

      const mouse = mouseRef.current;
      const stars = starsRef.current;

      // Update constellation lines - less frequent for performance
      if (frameRef.current % 4 === 0) {
        updateConstellationLines();
      }

      // Draw constellation lines - optimized rendering
      constellationLinesRef.current.forEach(line => {
        const star1 = stars[line.star1Index];
        const star2 = stars[line.star2Index];
        if (star1 && star2 && line.strength > 0.1) {
          ctx.beginPath();
          ctx.moveTo(star1.x, star1.y);
          ctx.lineTo(star2.x, star2.y);
          
          // Simplified coloring for performance
          ctx.strokeStyle = `hsla(200, 80%, 70%, ${line.strength * 0.6})`;
          ctx.lineWidth = Math.max(0.5, 1.5 * line.strength);
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      });

      // Update and draw stars - optimized
      stars.forEach((star) => {
        // Simplified twinkle effect
        star.brightness += star.twinkleSpeed;
        if (star.brightness > 1 || star.brightness < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        star.brightness = Math.max(0.2, Math.min(1, star.brightness));
        
        // Skip expensive updates if not needed
        if (frameRef.current % 2 === 0) {
          // Update pulse phase less frequently
          if (star.pulsePhase !== undefined) {
            star.pulsePhase += 0.04;
          }
          
          // Update color shift less frequently  
          if (star.colorShift !== undefined) {
            star.colorShift += 0.02;
          }
        }

        // Shape formation
        if (star.isForming && star.targetX !== undefined && star.targetY !== undefined) {
          const dx = star.targetX - star.x;
          const dy = star.targetY - star.y;
          star.vx = dx * 0.08;
          star.vy = dy * 0.08;
          star.formationStrength = Math.min(1, star.formationStrength + 0.02);
          
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
            star.x = star.targetX;
            star.y = star.targetY;
            star.vx = 0;
            star.vy = 0;
            star.isForming = false;
            star.formationStrength = 1;
          }
        }
        
        // Handle explosion movement (10 seconds)
        if (star.isExploding && star.explosionTime !== undefined && star.colorTransitionTime !== undefined) {
          star.explosionTime++;
          
          if (star.explosionTime < star.colorTransitionTime) {
            // Continue moving for 10 seconds
            // Apply gradual damping
            const dampingFactor = 1 - (star.explosionTime / star.colorTransitionTime);
            star.vx *= (0.98 + dampingFactor * 0.02); // Gradually slow down
            star.vy *= (0.98 + dampingFactor * 0.02);
            
            // Add slight random drift
            star.vx += (Math.random() - 0.5) * 0.1 * dampingFactor;
            star.vy += (Math.random() - 0.5) * 0.1 * dampingFactor;
            
            // Color transition from explosion color back to normal
            if (star.targetColor) {
              const progress = star.explosionTime / star.colorTransitionTime;
              const currentHue = 280 + (star.colorShift || 0) + progress * (200 - 280); // Transition from purple back to normal
              star.color = `hsl(${currentHue}, 80%, ${70 + (1 - progress) * 10}%)`;
            }
            
            // Enhanced brightness during explosion
            star.brightness = 1;
            star.glowIntensity = 3;
          } else {
            // End explosion movement
            star.isExploding = false;
            star.explosionTime = 0;
            star.colorTransitionTime = 0;
            star.targetColor = undefined;
            star.glowIntensity = undefined;
          }
        }
        
        // Update formation progress
        const formingStars = starsRef.current.filter(s => s.isForming);
        if (formingStars.length > 0) {
          formationProgressRef.current = Math.min(1, formationProgressRef.current + 0.02);
        }
        
        // Reset formation when complete
        if (formationProgressRef.current >= 1) {
          starsRef.current.forEach(star => {
            if (star.isForming) {
              star.isForming = false;
              star.formationStrength = 0;
              star.targetX = undefined;
              star.targetY = undefined;
            }
          });
          formationProgressRef.current = 0;
        }

        // Cursor interaction - Enhanced and more responsive
        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < CURSOR_RADIUS * 1.5) { // Increased interaction radius
            const force = Math.max(0.1, 1 - dist / (CURSOR_RADIUS * 1.5)) * 3; // Much stronger force
            
            if (mouse.isAttracting) {
              // Strong attraction to cursor
              star.vx += (dx / dist) * force;
              star.vy += (dy / dist) * force;
            } else {
              // Gentle attraction (default behavior)
              star.vx += (dx / dist) * force * 0.7;
              star.vy += (dy / dist) * force * 0.7;
            }
            
            // Enhanced brightness response
            star.brightness = Math.min(1, star.brightness + 0.1);
            
            // Add some energy to forming stars
            if (star.isForming) {
              star.formationStrength = Math.min(1, star.formationStrength + 0.05);
            }
          }
        }

        // Apply velocity
        star.x += star.vx;
        star.y += star.vy;
        
        // Enhanced damping for smoother movement
        star.vx *= 0.92; // Reduced damping for more responsive movement
        star.vy *= 0.92;
        
        // Add slight momentum preservation for smoother feel
        if (mouse.active) {
          const dx = mouse.x - star.x;
          const dy = mouse.y - star.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CURSOR_RADIUS * 1.5) {
            star.vx *= 0.98; // Less damping when near mouse
            star.vy *= 0.98;
          }
        }

        // Random drift for non-forming stars
        if (!star.isForming) {
          star.vx += (Math.random() - 0.5) * 0.08; // Reduced random drift
          star.vy += (Math.random() - 0.5) * 0.08;
        }

        // Wrap around edges
        if (star.x < 0) star.x = W;
        if (star.x > W) star.x = 0;
        if (star.y < 0) star.y = H;
        if (star.y > H) star.y = 0;

        // Draw enhanced star
        const twinkle = Math.sin(star.brightness * Math.PI + (star.twinkleOffset || 0)) * 0.5 + 0.5;
        const pulse = star.pulsePhase !== undefined ? Math.sin(star.pulsePhase) * 0.2 + 1 : 1;
        const colorShift = star.colorShift !== undefined ? star.colorShift : 0;
        
        // Calculate dynamic color
        const baseHue = parseInt(star.color.match(/\d+/)[0]);
        const newHue = baseHue + colorShift;
        const saturation = star.isConstellationStar ? 85 : 80;
        const lightness = star.isConstellationStar ? 75 : 70;
        
        const dynamicColor = `hsl(${newHue}, ${saturation}%, ${lightness + twinkle * 10}%)`;
        
        // Draw halo for constellation stars
        if (star.isConstellationStar && star.haloSize) {
          const haloOpacity = 0.3 * twinkle * pulse;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.haloSize * pulse, 0, Math.PI * 2);
          ctx.fillStyle = dynamicColor.replace(')', `, ${haloOpacity})`).replace('hsl', 'hsla');
          ctx.fill();
        }
        
        // Draw core
        const coreSize = star.coreSize || star.size;
        const actualSize = coreSize * pulse;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, actualSize, 0, Math.PI * 2);
        
        // Enhanced glow effect
        const glowSize = actualSize * (star.glowIntensity || 1.5);
        const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize);
        glowGradient.addColorStop(0, dynamicColor.replace(')', `, ${twinkle})`).replace('hsl', 'hsla'));
        glowGradient.addColorStop(0.3, dynamicColor.replace(')', `, ${twinkle * 0.8})`).replace('hsl', 'hsla'));
        glowGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = glowGradient;
        ctx.fill();
        
        // Draw bright core
        ctx.beginPath();
        ctx.arc(star.x, star.y, actualSize * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${newHue}, 95%, ${95 + twinkle * 5}%)`;
        ctx.fill();
      });

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update trail
        if (particle.type === 'trail' || particle.type === 'missile' || particle.type === 'firework') {
          particle.trail.push({ x: particle.x, y: particle.y, life: 20 });
          if (particle.trail.length > 15) {
            particle.trail.shift();
          }
        }
        
        // Update trail life
        particle.trail = particle.trail.filter(point => {
          point.life--;
          return point.life > 0;
        });

        // Apply physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += particle.gravity || 0.1;
        particle.vx *= particle.friction || 0.98;
        particle.vy *= particle.friction || 0.98;
        
        // Update rotation
        if (particle.rotation !== undefined && particle.rotationSpeed !== undefined) {
          particle.rotation += particle.rotationSpeed;
        }
        
        particle.life++;

        const lifeRatio = 1 - particle.life / particle.maxLife;
        if (lifeRatio <= 0) return false;

        // Draw trail
        if (particle.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            const point = particle.trail[i];
            const trailLifeRatio = point.life / 20;
            ctx.lineTo(point.x, point.y);
          }
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = particle.color.replace(')', `, ${lifeRatio * 0.3})`).replace('hsl', 'hsla');
          ctx.lineWidth = particle.size * 0.8 * lifeRatio;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Draw particle based on type
        ctx.save();
        
        switch (particle.type) {
          case 'orb':
            // Glowing orb with multiple layers
            const orbGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3);
            orbGradient.addColorStop(0, particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla'));
            orbGradient.addColorStop(0.3, particle.color.replace(')', `, ${lifeRatio * 0.5})`).replace('hsl', 'hsla'));
            orbGradient.addColorStop(1, 'transparent');
            ctx.fillStyle = orbGradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case 'ring':
            // Hollow ring
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            ctx.strokeStyle = particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla');
            ctx.lineWidth = particle.size * 0.8;
            ctx.stroke();
            break;
            
          case 'spark':
            // Sharp spark with rays
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation || 0);
            for (let i = 0; i < 4; i++) {
              ctx.rotate(Math.PI / 2);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(particle.size * 2, 0);
              ctx.strokeStyle = particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla');
              ctx.lineWidth = particle.size * 0.3;
              ctx.stroke();
            }
            break;
            
          case 'missile':
            // Missile-like shape with trail
            ctx.beginPath();
            ctx.moveTo(particle.x - particle.size, particle.y);
            ctx.lineTo(particle.x + particle.size, particle.y);
            ctx.strokeStyle = particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla');
            ctx.lineWidth = particle.size * 0.5;
            ctx.stroke();
            break;
            
          case 'firework':
            // Star-shaped firework
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.rotation || 0);
            for (let i = 0; i < 5; i++) {
              ctx.rotate(Math.PI * 2 / 5);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(particle.size * 2, 0);
              ctx.strokeStyle = particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla');
              ctx.lineWidth = particle.size * 0.4;
              ctx.stroke();
            }
            break;
            
          default:
            // Standard particle (explosion, fragment, trail)
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * lifeRatio, 0, Math.PI * 2);
            ctx.fillStyle = particle.color.replace(')', `, ${lifeRatio})`).replace('hsl', 'hsla');
            ctx.fill();
            break;
        }
        
        // Add glow effect
        if (particle.glowIntensity && particle.glowIntensity > 1) {
          const glowSize = particle.size * (2 + particle.glowIntensity);
          const glowGradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, glowSize);
          glowGradient.addColorStop(0, particle.color.replace(')', `, ${lifeRatio * 0.4})`).replace('hsl', 'hsla'));
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(particle.x - glowSize, particle.y - glowSize, glowSize * 2, glowSize * 2);
        }
        
        ctx.restore();

        return particle.life < particle.maxLife;
      });


      // Update and draw floating words
      floatingWordsRef.current = floatingWordsRef.current.filter((word, index) => {
        if (!word.isAmbient) {
          // Handle non-ambient words (if any)
          word.x += word.vx;
          word.y += word.vy;
          word.rotation += word.rotationSpeed;
          word.opacity -= 0.003;
        } else {
          // Autonomous behavior for ambient words
          const currentTime = Date.now();
          
          // Update decision timer
          if (word.decisionTimer !== undefined) {
            word.decisionTimer++;
          }
          
          // Make decisions periodically
          if (word.decisionTimer && word.decisionTimer > 60) { // Every ~1 second at 60fps
            word.decisionTimer = 0;
            makeAutonomousDecision(word, index);
          }
          
          // Apply mouse interaction
          enhanceMouseInteraction(word, index);
          
          // Apply autonomous movement
          // Only apply autonomous movement if mouse is NOT stationary for 3+ seconds
          if (mouseRef.current.stationaryTime < 180) { // Less than 3 seconds
            applyAutonomousMovement(word, index);
          }
          
          // Update flow phase
          if (word.flowPhase !== undefined) {
            word.flowPhase += 0.02;
          }
          
          // Update position with 3D movement
          word.x += word.vx;
          word.y += word.vy;
          word.z += word.vz || 0; // Add Z-axis movement
          word.rotation += word.rotationSpeed;
          
          // Update 2D movement (removed 3D rotations)
          word.x += word.vx;
          word.y += word.vy;
          word.rotation += word.rotationSpeed;
          
          // Slower fade for ambient words
          word.opacity -= 0.001;
          
          // Keep words on screen
          if (word.x < 0) word.x = cw();
          if (word.x > cw()) word.x = 0;
          if (word.y < 0) word.y = ch();
          if (word.y > ch()) word.y = 0;
        }

        if (word.opacity <= 0) return false;

        ctx.save();
        
        // Apply 2D transformations (removed 3D effects)
        ctx.translate(word.x, word.y);
        ctx.rotate(word.rotation);
        
        // Apply proper 3D rotation effects
        // Removed 3D rotation effects
        if (word.rotationY !== undefined) {
          const cosY = Math.cos(word.rotationY);
          const sinY = Math.sin(word.rotationY);
          ctx.transform(cosY, 0, sinY, 0, 0, 1);
        }
        if (word.rotationZ !== undefined) {
          const cosZ = Math.cos(word.rotationZ);
          const sinZ = Math.sin(word.rotationZ);
          ctx.transform(cosZ, sinZ, -sinZ, cosZ, 0, 0);
        }
        
        // Calculate 3D depth and scale
        const depth = word.z || 0;
        const scale = 1 + depth / 200; // Scale based on depth
        
        // Removed 3D scaling
        
        ctx.globalAlpha = word.opacity * (word.isAmbient ? 0.8 : 1);
        ctx.font = `bold ${word.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enhanced 3D glow effects
        const glowSize = (word.glowIntensity || 1) * 15 * (1 + Math.abs(depth) / 100);
        const shadowBlur = word.shadowBlur || 5;
        
        // Create depth-based color variation
        const depthHue = parseFloat(word.color.match(/\d+/)?.[0] || '200');
        const depthAdjustedColor = word.color.replace(
          `hsl(${depthHue}`, 
          `hsl(${depthHue + depth * 0.5}`
        );
        
        ctx.shadowColor = depthAdjustedColor;
        ctx.shadowBlur = glowSize + shadowBlur;
        
        // Add depth-based shadow offset
        ctx.shadowOffsetX = depth * 0.1;
        ctx.shadowOffsetY = depth * 0.1;
        
        ctx.fillStyle = depthAdjustedColor;
        
        // Draw text with enhanced pulse for ambient words
        if (word.isAmbient && word.birthTime && word.pulseSpeed) {
          const age = Date.now() - word.birthTime;
          const pulse = 1 + Math.sin(age * word.pulseSpeed) * 0.15;
          ctx.transform(pulse, 0, 0, pulse, 0, 0);
        }
        
        ctx.fillText(word.text, 0, 0);
        ctx.shadowBlur = 0;
        
        ctx.restore();

        return word.opacity > 0;
      });
      
      // Draw click ripples
      clickRipplesRef.current = clickRipplesRef.current.filter((ripple) => {
        ripple.life++;
        ripple.radius = (ripple.life / ripple.maxLife) * ripple.maxRadius;
        
        const opacity = 1 - (ripple.life / ripple.maxLife);
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = ripple.color.replace(')', `, ${opacity})`).replace('hsl', 'hsla');
        ctx.lineWidth = 2;
        ctx.stroke();
        
        return ripple.life < ripple.maxLife;
      });
      
      // Draw mouse trails
      mouseTrailsRef.current = mouseTrailsRef.current.filter((trail) => {
        trail.life++;
        trail.lifeRatio = 1 - trail.life / trail.maxLife;
        
        // Simplified physics-based movement
        if (trail.vx !== undefined && trail.vy !== undefined) {
          trail.x += trail.vx;
          trail.y += trail.vy;
          trail.vx *= 0.99;
          trail.vy *= 0.99;
          trail.vy += 0.03; // Reduced gravity
        }
        
        // Simplified drawing
        const radius = Math.max(0.1, trail.size * trail.lifeRatio);
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = trail.color.replace(')', `, ${trail.lifeRatio * 0.8})`).replace('hsl', 'hsla');
        ctx.fill();
        
        return trail.life < trail.maxLife;
      });
      
      // Draw connections between words
      drawWordConnections(ctx);
      
      // Draw interactive drawing lines
      drawingLinesRef.current = drawingLinesRef.current.filter(line => {
        line.age++;
        line.opacity = 1 - (line.age / line.maxAge);
        
        if (line.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(line.points[0].x, line.points[0].y);
          
          // Draw smooth curve through all points
          for (let i = 1; i < line.points.length; i++) {
            const prevPoint = line.points[i - 1];
            const currPoint = line.points[i];
            const nextPoint = line.points[i + 1];
            
            if (nextPoint) {
              // Use quadratic bezier for smooth curves
              const cpX = currPoint.x + (nextPoint.x - prevPoint.x) * 0.1;
              const cpY = currPoint.y + (nextPoint.y - prevPoint.y) * 0.1;
              ctx.quadraticCurveTo(cpX, cpY, currPoint.x, currPoint.y);
            } else {
              ctx.lineTo(currPoint.x, currPoint.y);
            }
          }
          
          // Enhanced line rendering
          ctx.strokeStyle = line.color.replace(')', `, ${line.opacity})`).replace('hsl', 'hsla');
          ctx.lineWidth = line.width;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          // Add glow effect
          ctx.shadowColor = line.color;
          ctx.shadowBlur = 15;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        
        return line.age < line.maxAge;
      });
      
      // Draw and update black holes
      updateBlackHoles();
      blackHolesRef.current.forEach(blackHole => {
        if (blackHole.isExploding) {
          // Draw explosion effect
          const explosionRadius = blackHole.radius * (1 + blackHole.explosionTime / 10);
          const opacity = 1 - (blackHole.explosionTime / 30);
          
          // Draw expanding shockwave
          ctx.beginPath();
          ctx.arc(blackHole.x, blackHole.y, explosionRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(280, 100%, 70%, ${opacity * 0.8})`;
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Draw bright flash
          ctx.beginPath();
          ctx.arc(blackHole.x, blackHole.y, blackHole.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(280, 100%, 90%, ${opacity})`;
          ctx.fill();
        } else {
          // Draw black hole with gravitational lensing effect
          const gradient = ctx.createRadialGradient(
            blackHole.x, blackHole.y, 0,
            blackHole.x, blackHole.y, blackHole.radius * 3
          );
          gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
          gradient.addColorStop(0.3, 'rgba(20, 0, 40, 0.8)');
          gradient.addColorStop(0.6, 'rgba(40, 0, 80, 0.4)');
          gradient.addColorStop(1, 'rgba(60, 0, 120, 0.1)');
          
          // Draw event horizon
          ctx.beginPath();
          ctx.arc(blackHole.x, blackHole.y, blackHole.radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Draw accretion disk
          ctx.beginPath();
          ctx.arc(blackHole.x, blackHole.y, blackHole.radius * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `hsla(280, 80%, 60%, 0.6)`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw gravitational lensing rings
          for (let i = 1; i <= 3; i++) {
            ctx.beginPath();
            ctx.arc(blackHole.x, blackHole.y, blackHole.radius * (2 + i), 0, Math.PI * 2);
            ctx.strokeStyle = `hsla(280, 60%, 40%, ${0.3 / i})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      });
      
      // Update autonomous stars
      updateAutonomousStars();
      
      // Draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.x += star.vx;
        star.y += star.vy;
        star.opacity -= 0.01;
        
        // Update trail
        star.trail.unshift({ x: star.x, y: star.y, opacity: star.opacity });
        if (star.trail.length > 20) {
          star.trail.pop();
        }
        
        // Draw trail
        ctx.beginPath();
        star.trail.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        const gradient = ctx.createLinearGradient(
          star.x - star.length, star.y,
          star.x, star.y
        );
        gradient.addColorStop(0, star.color.replace(')', `, 0)`).replace('hsl', 'hsla'));
        gradient.addColorStop(1, star.color.replace(')', `, ${star.opacity})`).replace('hsl', 'hsla'));
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw bright head
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = star.color.replace(')', `, ${star.opacity})`).replace('hsl', 'hsla');
        ctx.fill();
        
        return star.opacity > 0 && star.x < W + 100 && star.y < H + 100;
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(ambientWordInterval);
      clearInterval(shootingStarInterval);
      clearInterval(shapeMakerInterval);
      window.removeEventListener("resize", resize);
    };
  }, [createStar, updateConstellationLines]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Track stationary time for black hole creation AND mouse attraction
    const prevX = mouseRef.current.x;
    const prevY = mouseRef.current.y;
    const movedDistance = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
    
    if (movedDistance < 2) {
      // Mouse is stationary
      mouseRef.current.stationaryTime++;
      
      // Create super black hole if stationary for 10 seconds (600 frames at 60fps)
      if (mouseRef.current.stationaryTime > 600) { // 10 seconds at 60fps
        const mass = 10; // Fixed massive mass
        const blackHole = createBlackHole(x, y, mass);
        
        // Make it super powerful - 100x greater gravitational force
        blackHole.pullStrength = 50; // Much stronger pull
        blackHole.radius = 30; // Much larger radius
        blackHole.maxAge = 180; // Longer lifespan
        
        blackHolesRef.current.push(blackHole);
        mouseRef.current.stationaryTime = 0; // Reset timer
      }
      
      // Add mouse attraction effect when stationary for 3+ seconds
      if (mouseRef.current.stationaryTime > 180) { // 3 seconds at 60fps
        // Start pulling all stars and constellations toward mouse
        starsRef.current.forEach(star => {
          const dx = x - star.x;
          const dy = y - star.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) { // Avoid division by zero
            const attractionForce = 2.0; // MUCH STRONGER attraction force
            const force = attractionForce / distance;
            star.vx += dx * force;
            star.vy += dy * force;
            
            // Add some damping to prevent overshooting
            star.vx *= 0.95;
            star.vy *= 0.95;
          }
        });
        
        // Pull floating words toward cursor
        floatingWordsRef.current.forEach(word => {
          const dx = x - word.x;
          const dy = y - word.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const attractionForce = 1.5; // STRONGER attraction for words
            const force = attractionForce / distance;
            word.vx += dx * force;
            word.vy += dy * force;
            
            // Add damping
            word.vx *= 0.95;
            word.vy *= 0.95;
          }
        });
        
        // Also pull constellation lines
        constellationLinesRef.current.forEach(line => {
          const star1 = starsRef.current[line.star1Index];
          const star2 = starsRef.current[line.star2Index];
          if (star1 && star2) {
            const dx = x - (star1.x + star2.x) / 2;
            const dy = y - (star1.y + star2.y) / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
              const attractionForce = 1.5; // STRONGER attraction for lines
              const force = attractionForce / distance;
              star1.vx += dx * force;
              star1.vy += dy * force;
              star2.vx += dx * force;
              star2.vy += dy * force;
              
              // Add damping
              star1.vx *= 0.95;
              star1.vy *= 0.95;
              star2.vx *= 0.95;
              star2.vy *= 0.95;
            }
          }
        });
      }
    } else {
      // Mouse moved, reset stationary time
      mouseRef.current.stationaryTime = 0;
    }
    
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.active = true;
    mouseRef.current.isAttracting = e.shiftKey; // Hold shift to attract
    
    // Handle drawing
    if (e.buttons === 1) { // Left mouse button is held
      if (!mouseRef.current.isDrawing) {
        // Start drawing
        createDrawing(x, y);
        mouseRef.current.isDrawing = true;
      } else {
        // Continue drawing
        updateDrawing(x, y);
      }
    } else {
      // Stop drawing if button is released
      if (mouseRef.current.isDrawing) {
        finishDrawing();
        mouseRef.current.isDrawing = false;
      }
    }
    
    // Create mouse trail particles - optimized for performance
    if (frameRef.current % 5 === 0) { // Every 5 frames instead of 3
      createMouseTrail(x, y);
      
      // Create small particles around mouse (much less frequent)
      if (Math.random() > 0.9) { // Changed from 0.8 to 0.9
        const particle = createParticle(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
          'trail',
          `hsl(${180 + Math.random() * 60}, 70%, 60%)`
        );
        particle.maxLife = 12; // Reduced from 15
        particle.size = Math.random() * 1.5 + 0.5; // Reduced max size
        particlesRef.current.push(particle);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Start drawing on mouse down
    createDrawing(x, y);
    mouseRef.current.isDrawing = true;
  };

  const handleMouseUp = () => {
    // Stop drawing on mouse up
    if (mouseRef.current.isDrawing) {
      finishDrawing();
      mouseRef.current.isDrawing = false;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is on a star
    let clickedStar = false;
    starsRef.current.forEach((star, index) => {
      const dx = x - star.x;
      const dy = y - star.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < star.size * 3) {
        triggerStarExplosion(index);
        clickedStar = true;
      }
    });
    
    // Create enhanced particle explosion
    createParticleExplosion(x, y, 1); // Simple base explosion
    
    // Spawn additional particles with simple colors
    spawnParticles(x, y, 30); // More particles like the existing ones
    
    // Create enhanced star burst with simple colors
    for (let i = 0; i < 8; i++) { // Increased from 3 to 8 stars
      const angle = (Math.PI * 2 * i) / 8;
      const distance = 30 + Math.random() * 40;
      const star = createStar(
        x + Math.cos(angle) * distance,
        y + Math.sin(angle) * distance
      );
      
      // Give stars simple velocity
      star.vx = Math.cos(angle) * 2;
      star.vy = Math.sin(angle) * 2;
      star.brightness = 1;
      star.glowIntensity = 2;
      
      starsRef.current.push(star);
    }
    
    // Create simple central flash effect
    const flashParticle = createParticle(x, y, 'explosion', 'white');
    flashParticle.size = 10;
    flashParticle.maxLife = 8;
    flashParticle.glowIntensity = 5;
    particlesRef.current.push(flashParticle);
    
    setClickCount(prev => Math.min(prev + 1, 10));
    setTimeout(() => setClickCount(0), 2000);
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  // Enhanced touch detection for PWA
  const isPWAStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    
    // Enhanced touch feedback for PWA
    if (isPWAStandalone()) {
      // Add haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10); // Light vibration on touch
      }
    }
    
    // Treat touch start like mouse down
    createDrawing(x, y);
    mouseRef.current.isDrawing = true;
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.active = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling/zooming
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const t = e.touches[0];
    const x = t.clientX - rect.left;
    const y = t.clientY - rect.top;
    
    // Update mouse position for touch
    const prevX = mouseRef.current.x;
    const prevY = mouseRef.current.y;
    const movedDistance = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
    
    if (movedDistance < 2) {
      mouseRef.current.stationaryTime++;
    } else {
      mouseRef.current.stationaryTime = 0;
    }
    
    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.active = true;
    
    // Create drawing trail if drawing
    if (mouseRef.current.isDrawing) {
      createDrawing(x, y);
    }
  };

  const handleTouchEnd = () => {
    // Treat touch end like mouse up
    if (mouseRef.current.isDrawing) {
      finishDrawing();
      mouseRef.current.isDrawing = false;
    }
    mouseRef.current.active = false;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Space key creates particle effects and also triggers shape formation
    if (e.key === ' ') {
      e.preventDefault();
      
      // Only trigger shape formation if mouse is NOT stationary
      if (mouseRef.current.stationaryTime < 60) { // Less than 1 second
        // Create enhanced particle explosion at center
        createParticleExplosion(cw() / 2, ch() / 2, 2);
        spawnParticles(cw() / 2, ch() / 2, 20);
        
        // Also trigger a random shape formation immediately
        const shapes: ShapePattern[] = ['circle', 'heart', 'spiral', 'infinity', 'star'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        formShape(shape, cw() / 2, ch() / 2);
        console.log(`Manual shape formation: ${shape}`); // Debug log
      } else {
        // Just create particle effects if mouse is stationary
        createParticleExplosion(cw() / 2, ch() / 2, 2);
        spawnParticles(cw() / 2, ch() / 2, 20);
      }
    }
    
    // Press 'S' to manually trigger a specific shape
    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      const shapes: ShapePattern[] = ['circle', 'heart', 'spiral', 'infinity', 'star'];
      const shapeIndex = Math.floor(Math.random() * shapes.length);
      formShape(shapes[shapeIndex], cw() / 2, ch() / 2);
      console.log(`Manual shape formation: ${shapes[shapeIndex]}`); // Debug log
    }
  }, [cw, ch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    const timer = setTimeout(() => setShowHint(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ touchAction: 'none' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl font-mono text-xs text-white/90 pointer-events-none"
          >
            <span className="text-blue-400">click</span> to form shapes
            <span className="mx-2 text-white/40">·</span>
            <span className="text-purple-400">move</span> to interact
            <span className="mx-2 text-white/40">·</span>
            <span className="text-green-400">shift+move</span> to attract
            <span className="mx-2 text-white/40">·</span>
            <span className="text-yellow-400">spacebar</span> random shape
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Back to Portfolio ── */}
      <div className="absolute top-4 left-4 z-30">
        <Link
          to="/ai-lab"
          className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/15 rounded-full px-3 py-1.5 text-xs text-white/70 hover:text-white hover:border-white/35 transition-all duration-200 select-none"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          AI Lab
        </Link>
      </div>

      {/* ── Stats (top-right) ── */}
      <div className="absolute top-4 right-4 text-white/40 font-mono text-xs space-y-0.5 text-right">
        <div>Stars: {starsRef.current.length}</div>
        <div>Shape: <span className="text-cyan-400/70">{currentShape}</span></div>
        {formationProgressRef.current > 0 && formationProgressRef.current < 1 && (
          <div>Forming: {Math.round(formationProgressRef.current * 100)}%</div>
        )}
      </div>

      {/* ── Voice narration pill — bottom-center with safe area ── */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 z-20"
        style={{
          bottom: 'max(4rem, env(safe-area-inset-bottom) + 3rem)'
        }}
      >
        <VoiceNarration onNarrationChange={onNarrationChange} />
      </div>
    </div>
  );
};

export default StarryAnimation;