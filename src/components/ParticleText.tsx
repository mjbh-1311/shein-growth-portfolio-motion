import { CSSProperties, useEffect, useRef } from 'react';
import './ParticleText.css';

type ParticleTextProps = {
  text: string;
  particleSize?: number;
  density?: number;
  color?: string;
  highlightColor?: string;
  scatter?: number;
  gatherDuration?: number;
  stagger?: number;
  pointerRepel?: number;
  repelRadius?: number;
  idleDrift?: number;
  trigger?: 'mount' | 'hover' | 'click';
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  glow?: boolean;
  className?: string;
  style?: CSSProperties;
};

type Particle = {
  x: number; y: number; startX: number; startY: number;
  targetX: number; targetY: number; size: number; seed: number;
  depth: number; delay: number; color: string;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function ParticleText({
  text,
  particleSize = 2,
  density = 4,
  color = '#f5f5f5',
  highlightColor = '#c9ff34',
  scatter = 150,
  gatherDuration = 1500,
  stagger = 360,
  pointerRepel = 38,
  repelRadius = 120,
  idleDrift = .65,
  trigger = 'hover',
  fontSize = 'clamp(3rem, 7vw, 6.8rem)',
  fontWeight = 400,
  fontFamily = 'Inter, sans-serif',
  glow = true,
  className = '',
  style,
}: ParticleTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let particles: Particle[] = [];
    let frame = 0;
    let resizeFrame = 0;
    let gathering = true;
    let gatherStart = performance.now();
    let width = 0;
    let height = 0;
    let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { active: false, x: 0, y: 0, smoothX: 0, smoothY: 0 };

    const resolveFontSize = () => {
      if (typeof fontSize === 'number') return fontSize;
      const probe = document.createElement('span');
      Object.assign(probe.style, { position: 'absolute', visibility: 'hidden', fontSize, fontWeight: String(fontWeight), fontFamily });
      probe.textContent = 'M';
      container.appendChild(probe);
      const value = parseFloat(getComputedStyle(probe).fontSize) || 86;
      probe.remove();
      return value;
    };

    const scatterParticles = () => {
      const now = performance.now();
      particles.forEach(particle => {
        const angle = particle.seed * Math.PI * 2;
        const distance = (reduced ? 0 : scatter) * (.35 + particle.depth * .72);
        particle.x = particle.targetX + Math.cos(angle) * distance;
        particle.y = particle.targetY + Math.sin(angle) * distance;
        particle.startX = particle.x;
        particle.startY = particle.y;
        particle.delay = reduced ? 0 : particle.seed * stagger;
      });
      gatherStart = now;
      gathering = true;
    };

    const build = async () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const size = resolveFontSize();
      const font = `${fontWeight} ${size}px ${fontFamily}`;
      try { await document.fonts?.load(font); } catch { /* font fallback is safe */ }
      const off = document.createElement('canvas');
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      if (!offCtx) return;
      offCtx.font = font;
      const measure = offCtx.measureText(text);
      const scale = Math.min(1, (width * .98) / Math.max(1, measure.width));
      const finalSize = Math.max(20, size * scale);
      offCtx.font = `${fontWeight} ${finalSize}px ${fontFamily}`;
      const finalMeasure = offCtx.measureText(text);
      const padding = Math.ceil(finalSize * .12);
      off.width = Math.ceil(finalMeasure.width + padding * 2);
      off.height = Math.ceil(finalSize * 1.22 + padding * 2);
      offCtx.font = `${fontWeight} ${finalSize}px ${fontFamily}`;
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#fff';
      offCtx.fillText(text, padding, off.height / 2);
      const pixels = offCtx.getImageData(0, 0, off.width, off.height).data;
      const targets: Array<{ x: number; y: number }> = [];
      const step = Math.max(2, Math.floor(density));
      for (let y = 0; y < off.height; y += step) for (let x = 0; x < off.width; x += step) {
        if (pixels[(y * off.width + x) * 4 + 3] > 48) targets.push({ x: width * .006 + x, y: height / 2 - off.height / 2 + y });
      }
      const stride = Math.max(1, Math.ceil(targets.length / 4400));
      particles = targets.filter((_, i) => i % stride === 0).map((target, index) => {
        const seed = ((index * 9301 + 49297) % 233280) / 233280;
        const depth = .5 + (((index * 233 + 97) % 1000) / 1000) * .8;
        return { x: target.x, y: target.y, startX: target.x, startY: target.y, targetX: target.x, targetY: target.y, size: particleSize * (.75 + depth * .22), seed, depth, delay: seed * stagger, color: seed > .78 ? highlightColor : color };
      });
      scatterParticles();
    };

    const render = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      pointer.smoothX += (pointer.x - pointer.smoothX) * .18;
      pointer.smoothY += (pointer.y - pointer.smoothY) * .18;
      let complete = true;
      ctx.shadowBlur = glow && !reduced ? particleSize * 3 : 0;
      ctx.shadowColor = highlightColor;
      particles.forEach(particle => {
        let baseX = particle.targetX;
        let baseY = particle.targetY;
        if (gathering) {
          const progress = clamp((now - gatherStart - particle.delay) / Math.max(1, gatherDuration), 0, 1);
          const eased = easeOutCubic(progress);
          baseX = particle.startX + (particle.targetX - particle.startX) * eased;
          baseY = particle.startY + (particle.targetY - particle.startY) * eased;
          if (progress < 1) complete = false;
        } else if (!reduced) {
          baseX += Math.sin(now * .0009 + particle.seed * 10) * idleDrift * particle.depth;
          baseY += Math.cos(now * .00075 + particle.depth * 10) * idleDrift * particle.depth;
        }
        if (pointer.active && !reduced) {
          const dx = baseX - pointer.smoothX;
          const dy = baseY - pointer.smoothY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < repelRadius) {
            const force = Math.pow(1 - distance / repelRadius, 2) * pointerRepel;
            baseX += dx / distance * force;
            baseY += dy / distance * force;
          }
        }
        particle.x += (baseX - particle.x) * (reduced ? 1 : .22);
        particle.y += (baseY - particle.y) * (reduced ? 1 : .22);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      });
      if (gathering && complete) gathering = false;
      frame = requestAnimationFrame(render);
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const enter = (event: PointerEvent) => { updatePointer(event); if (trigger === 'hover') scatterParticles(); };
    const click = () => { if (trigger === 'click') scatterParticles(); };
    const resize = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(build); };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    canvas.addEventListener('pointerenter', enter);
    canvas.addEventListener('pointermove', updatePointer);
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    canvas.addEventListener('click', click);
    build();
    frame = requestAnimationFrame(render);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); canvas.removeEventListener('pointerenter', enter); canvas.removeEventListener('pointermove', updatePointer); canvas.removeEventListener('click', click); };
  }, [color, density, fontFamily, fontSize, fontWeight, gatherDuration, glow, highlightColor, idleDrift, particleSize, pointerRepel, repelRadius, scatter, stagger, text, trigger]);

  return <div ref={containerRef} className={`particle-text ${className}`} style={style} aria-label={text}><canvas ref={canvasRef} className="particle-text__canvas" aria-hidden="true" /><span className="particle-text__sr">{text}</span></div>;
}
