import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import './AccordionGallery.css';

export type AccordionGalleryItem = { image: string; label?: string; link?: string; alt?: string };
type AccordionGalleryProps = {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  duration?: number;
  parallax?: number;
  tilt?: number;
  trigger?: 'hover' | 'click';
  showLabels?: boolean;
  grayscale?: boolean;
  className?: string;
};

export default function AccordionGallery({
  items,
  defaultIndex = 1,
  accentColor = '#c9ff34',
  overlayColor = '#050607',
  textColor = '#ffffff',
  height = 460,
  gap = 12,
  radius = 18,
  expandRatio = .56,
  duration = .65,
  parallax = .5,
  tilt = 7,
  trigger = 'hover',
  showLabels = true,
  grayscale = true,
  className = '',
}: AccordionGalleryProps) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), items.length - 1));
  const activeGrow = Math.max(2.15, expandRatio * items.length * 2.2);
  const open = (index: number) => setActive(index);
  return <div className={`accordion-gallery ${className}`} style={{ '--ag-accent': accentColor, '--ag-overlay': overlayColor, '--ag-text': textColor, '--ag-gap': `${gap}px`, '--ag-radius': `${radius}px`, height } as React.CSSProperties} role="list" aria-label="Campaign banner gallery">
    {items.map((item, index) => {
      const isActive = index === active;
      const drift = (active - index) * parallax * 8;
      return <motion.div key={item.image} className={`ag-panel${isActive ? ' ag-panel--active' : ''}`} role="listitem" tabIndex={0} aria-current={isActive || undefined} aria-label={item.label} onMouseEnter={() => trigger === 'hover' && open(index)} onClick={() => open(index)} onFocus={() => open(index)} onKeyDown={event => {
        if (event.key === 'ArrowRight') open((index + 1) % items.length);
        if (event.key === 'ArrowLeft') open((index - 1 + items.length) % items.length);
      }} animate={reduceMotion ? undefined : { flexGrow: isActive ? activeGrow : 1, rotateY: isActive ? 0 : index < active ? tilt : -tilt }} transition={{ duration, ease: [0.22, 1, 0.36, 1] }}>
        <span className="ag-panel__frame"><motion.span className="ag-panel__media" animate={reduceMotion ? undefined : { x: drift, scale: isActive ? 1.02 : 1.08, filter: grayscale && !isActive ? 'grayscale(1) brightness(.62)' : 'grayscale(0) brightness(1)' }} transition={{ duration, ease: [0.22, 1, 0.36, 1] }}><img src={item.image} alt={item.alt || item.label || ''} draggable={false} /></motion.span><span className="ag-panel__overlay" /></span>
        {showLabels && <motion.span className="ag-panel__label" animate={reduceMotion ? undefined : { opacity: isActive ? 1 : 0, x: isActive ? 0 : -14 }} transition={{ duration: duration * .75 }}><span className="ag-panel__bar" /><span className="ag-panel__text">{item.label}</span></motion.span>}
      </motion.div>;
    })}
  </div>;
}
