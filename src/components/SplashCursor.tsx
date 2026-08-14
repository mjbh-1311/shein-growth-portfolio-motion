import { useEffect, useRef } from 'react';

type Drop = { x:number; y:number; px:number; py:number; life:number; size:number; hue:number };

export default function SplashCursor({ COLOR = '#c9ff34' }: { COLOR?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0, dpr = 1, lastX = innerWidth / 2, lastY = innerHeight / 2;
    const drops: Drop[] = [];
    const resize = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`; ctx.setTransform(dpr,0,0,dpr,0,0); };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const distance = Math.hypot(e.clientX-lastX,e.clientY-lastY);
      if (distance > 3) drops.push({x:e.clientX,y:e.clientY,px:lastX,py:lastY,life:1,size:18+Math.min(distance,38),hue:(performance.now()/45)%360});
      lastX=e.clientX;lastY=e.clientY;
      if (drops.length>70) drops.splice(0,drops.length-70);
    };
    const draw = () => {
      ctx.clearRect(0,0,innerWidth,innerHeight);ctx.globalCompositeOperation='lighter';
      for (let i=drops.length-1;i>=0;i--){const d=drops[i];d.life*=.945;d.size+=.22;const g=ctx.createRadialGradient(d.x,d.y,0,d.x,d.y,d.size);g.addColorStop(0,`${COLOR}${Math.round(d.life*75).toString(16).padStart(2,'0')}`);g.addColorStop(.35,`hsla(${d.hue},80%,62%,${d.life*.16})`);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill();ctx.strokeStyle=`rgba(201,255,52,${d.life*.12})`;ctx.lineWidth=Math.max(1,d.life*4);ctx.beginPath();ctx.moveTo(d.px,d.py);ctx.quadraticCurveTo((d.px+d.x)/2-8,(d.py+d.y)/2+8,d.x,d.y);ctx.stroke();if(d.life<.025)drops.splice(i,1)}
      ctx.globalCompositeOperation='source-over';raf=requestAnimationFrame(draw);
    };
    resize();addEventListener('resize',resize);addEventListener('pointermove',move,{passive:true});raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('pointermove',move)};
  },[COLOR]);
  return <canvas ref={canvasRef} className="splash-cursor" aria-hidden="true" />;
}
