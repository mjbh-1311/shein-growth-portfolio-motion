import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import './BorderGlow.css';

type GlowStyle = CSSProperties & Record<`--${string}`, string | number>;

const positions = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];

export default function BorderGlow({ children, className = '', borderRadius = 18, glowRadius = 34, glowIntensity = 1, animated = false, colors = ['#c9ff34', '#63d9a7', '#7a8cff'] }: { children: ReactNode; className?: string; borderRadius?: number; glowRadius?: number; glowIntensity?: number; animated?: boolean; colors?: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    const x = event.clientX - r.left;
    const y = event.clientY - r.top;
    const dx = x - r.width / 2;
    const dy = y - r.height / 2;
    const proximity = Math.min(1, Math.max(Math.abs(dx) / (r.width / 2), Math.abs(dy) / (r.height / 2)));
    el.style.setProperty('--edge-proximity', String(Math.max(0, (proximity - .42) / .58)));
    el.style.setProperty('--cursor-angle', `${Math.atan2(dy, dx) * 180 / Math.PI + 90}deg`);
    el.style.setProperty('--glow-x', `${x}px`);
    el.style.setProperty('--glow-y', `${y}px`);
  }, []);
  useEffect(() => {
    if (!animated || !ref.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    el.classList.add('border-glow-sweep');
    const timer = window.setTimeout(() => el.classList.remove('border-glow-sweep'), 2200);
    return () => window.clearTimeout(timer);
  }, [animated]);
  const style: GlowStyle = {
    '--border-radius': `${borderRadius}px`, '--glow-padding': `${glowRadius}px`, '--glow-intensity': glowIntensity,
  };
  positions.forEach((position, index) => { style[`--gradient-${index + 1}`] = `radial-gradient(at ${position}, ${colors[index % colors.length]} 0, transparent 54%)`; });
  return <div ref={ref} onPointerMove={move} onPointerLeave={() => ref.current?.style.setProperty('--edge-proximity', '0')} className={`border-glow-card ${className}`} style={style}>
    <span className="border-glow-edge" aria-hidden="true" />
    <div className="border-glow-inner">{children}</div>
  </div>;
}
