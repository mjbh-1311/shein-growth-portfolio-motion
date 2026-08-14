import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import AccordionGallery from './AccordionGallery';
import BorderGlow from './BorderGlow';
import HalftoneReveal from './HalftoneReveal';
import ParticleText from './ParticleText';
import RippleDistortion from './RippleDistortion';
import WarpText from './WarpText';

const ease = [0.22, 1, 0.36, 1] as const;

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const isMedia = /(hero-preview|market-card|banner-stage|visual-card|before-after|product-card|proof-image)/.test(className);
  const isLift = /(metric-card|market-card|workflow-card|visual-card|product-card|prompt-system)/.test(className);
  const isTilt = /(hero-preview|market-card|banner-stage|visual-card|before-after|product-card|proof-image)/.test(className);
  const isReflective = /(metric-card|market-card|workflow-card|visual-card|product-card|prompt-system|banner-stage)/.test(className);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rotateX = useSpring(rawRotateX, { stiffness: 180, damping: 24, mass: .45 });
  const rotateY = useSpring(rawRotateY, { stiffness: 180, damping: 24, mass: .45 });
  const initial = isMedia
    ? { opacity: 0, clipPath: 'inset(8% 0 0 0 round 20px)', filter: 'blur(7px)' }
    : { opacity: 0, y: 34 };
  const visible = isMedia
    ? { opacity: 1, clipPath: 'inset(0% 0 0 0 round 20px)', filter: 'blur(0px)' }
    : { opacity: 1, y: 0 };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((!isTilt && !isReflective) || reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - bounds.left) / bounds.width - .5;
    const py = (event.clientY - bounds.top) / bounds.height - .5;
    event.currentTarget.style.setProperty('--pointer-x', `${(px + .5) * 100}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${(py + .5) * 100}%`);
    if (isTilt) {
      const flipStrength = className.includes('original-market-card') ? 15 : 5;
      rawRotateX.set(py * (className.includes('original-market-card') ? -8 : -4));
      rawRotateY.set(px * flipStrength);
    }
  };
  const resetTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    event.currentTarget.style.setProperty('--pointer-x', '50%');
    event.currentTarget.style.setProperty('--pointer-y', '50%');
  };
  const motionStyle = !reduceMotion ? {
    ...(isMedia ? { y: parallaxY } : {}),
    ...(isTilt ? { rotateX, rotateY, transformPerspective: 1200 } : {}),
  } : undefined;

  return <motion.div ref={ref} className={className} data-motion-surface={isReflective || undefined} style={motionStyle} onPointerMove={onPointerMove} onPointerLeave={resetTilt} initial={reduceMotion ? false : initial} whileInView={reduceMotion ? undefined : visible} whileHover={isLift && !reduceMotion ? (isMedia ? { scale: 1.004 } : { y: -6 }) : undefined} viewport={{ once: true, amount: .18 }} transition={{ duration: .86, delay, ease }}>{children}</motion.div>;
}

function MotionSection({ children, className = '', id, onPointerMove, onPointerLeave }: { children: React.ReactNode; className?: string; id?: string; onPointerMove?: React.PointerEventHandler<HTMLElement>; onPointerLeave?: React.PointerEventHandler<HTMLElement> }) {
  const reduceMotion = useReducedMotion();
  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse') {
      const bounds = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty('--section-pointer-x', `${event.clientX - bounds.left}px`);
      event.currentTarget.style.setProperty('--section-pointer-y', `${event.clientY - bounds.top}px`);
    }
    onPointerMove?.(event);
  };
  const resetPointer = (event: React.PointerEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--section-pointer-x', '50%');
    event.currentTarget.style.setProperty('--section-pointer-y', '50%');
    onPointerLeave?.(event);
  };
  return <motion.section id={id} className={`motion-section ${className}`} onPointerMove={trackPointer} onPointerLeave={resetPointer} initial={reduceMotion ? false : { opacity: 0, y: 34, scale: .992, filter: 'blur(10px)' }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} viewport={{ once: true, amount: .06 }} transition={{ duration: 1.05, ease }}>{children}</motion.section>;
}

function SectionAmbientVideo({ src, className = '' }: { src: string; className?: string }) {
  return <div className={`section-ambient-video ${className}`} aria-hidden="true"><video src={src} autoPlay muted loop playsInline preload="metadata" /><div className="section-video-frost" /><div className="section-video-pointer" /></div>;
}

function InteractiveResultImage({ src, alt }: { src: string; alt: string }) {
  const [pulse, setPulse] = useState(0);
  const reduceMotion = useReducedMotion();
  return <motion.button type="button" className="comparison-result-click" aria-label={`点击查看 ${alt}`} onClick={() => setPulse(value => value + 1)} whileTap={reduceMotion ? undefined : { scale: .965 }}>
    <motion.img src={src} alt={alt} animate={pulse && !reduceMotion ? { scale: [1, 1.055, 1], filter: ['brightness(1)', 'brightness(1.18)', 'brightness(1)'] } : undefined} transition={{ duration: .65, ease }} />
    <AnimatePresence>{pulse > 0 && <motion.span key={pulse} className="comparison-click-flash" initial={{ opacity: .9, scale: .2 }} animate={{ opacity: 0, scale: 1.6 }} exit={{ opacity: 0 }} transition={{ duration: .7, ease }} />}</AnimatePresence>
  </motion.button>;
}

function MagneticButton({ children, className = '', onClick, ariaLabel }: { children: React.ReactNode; className?: string; onClick?: React.MouseEventHandler<HTMLButtonElement>; ariaLabel?: string }) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 20, mass: .35 });
  const y = useSpring(rawY, { stiffness: 260, damping: 20, mass: .35 });
  return <motion.button className={`magnetic-button ${className}`} aria-label={ariaLabel} onClick={onClick} style={reduceMotion ? undefined : { x, y }} onPointerMove={(event) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    rawX.set((event.clientX - bounds.left - bounds.width / 2) * .14);
    rawY.set((event.clientY - bounds.top - bounds.height / 2) * .14);
  }} onPointerLeave={() => { rawX.set(0); rawY.set(0); }} whileTap={reduceMotion ? undefined : { scale: .96 }}>{children}</motion.button>;
}

function SectionHead({ index, eyebrow, title, copy, titleEffect }: { index: string; eyebrow: string; title: string; copy?: string; titleEffect?: React.ReactNode }) {
  return <Reveal className="section-head"><div className="section-kicker"><span>{index}</span>{eyebrow}</div><div className="section-title-row">{titleEffect ?? <h2>{title}</h2>}{copy && <p>{copy}</p>}</div></Reveal>;
}

function CountUp({ value, unit = '', suffix = '', decimals = 0 }: { value: number; unit?: string; suffix?: string; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const visible = useInView(ref, { once: true });
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    if (!visible) return;
    const start = performance.now(); const duration = 1250;
    let frame = 0;
    const tick = (now: number) => { const p = Math.min((now - start) / duration, 1); setDisplay(value * (1 - Math.pow(1 - p, 3))); if (p < 1) frame = requestAnimationFrame(tick); };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [reduceMotion, visible, value]);
  return <span ref={ref} className="metric-value"><span>{display.toFixed(decimals)}{unit}</span>{suffix && <span className="metric-suffix">{suffix}</span>}</span>;
}

function SvgCountUpLabel({ value, x, y, delay }: { value: number; x: number; y: number; delay: number }) {
  const ref = useRef<SVGTextElement>(null);
  const reduceMotion = useReducedMotion();
  const visible = useInView(ref, { once: true });
  const [display, setDisplay] = useState(reduceMotion ? value : 0);
  useEffect(() => {
    if (reduceMotion) { setDisplay(value); return; }
    if (!visible) return;
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / 900, 1);
      setDisplay(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    const timer = window.setTimeout(() => { frame = requestAnimationFrame(tick); }, delay * 1000);
    return () => { window.clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [delay, reduceMotion, value, visible]);
  return <motion.text ref={ref} x={x} y={y} textAnchor="middle" className="value-label" initial={reduceMotion ? false : { opacity: 0, y: 6 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay, duration: .45 }}>{display.toFixed(2)}</motion.text>;
}

const metrics = [
  { value: 480, suffix: '+', label: 'SKU SUPPORTED', cn: '支持商品规模' },
  { value: 95.24, suffix: '%', decimals: 2, label: '7-DAY ACTIVATION RATE', cn: '7 天启动率' },
  { value: 73.79, suffix: '%', decimals: 2, label: '35-DAY RETENTION RATE', cn: '35 天商品持续表现率', detail: '上线35天后，仍保持有效表现的商品比例。' },
  { value: 10, unit: 'K', suffix: '+', label: 'BEST SELLER SALES', cn: '爆款单品销量', detail: '部分参与优化SKU累计销量达到1万+' },
];

export function HeroSection() {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const glowX = useSpring(pointerX, { stiffness: 55, damping: 24, mass: .8 });
  const glowY = useSpring(pointerY, { stiffness: 55, damping: 24, mass: .8 });
  const moveLight = (event: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(event.clientX - bounds.left - bounds.width / 2);
    pointerY.set(event.clientY - bounds.top - bounds.height / 2);
  };
  const resetLight = () => { pointerX.set(0); pointerY.set(0); };
  return <MotionSection className="hero section-pad" onPointerMove={moveLight} onPointerLeave={resetLight}>
    <div className="hero-video-layer" aria-hidden="true"><video src="/assets/videos/hero-3291.mp4" poster="/assets/context/16.png" autoPlay muted loop playsInline preload="metadata" /><div className="hero-video-frost" /></div>
    <motion.div className="hero-pointer-glow" aria-hidden="true" style={reduceMotion ? undefined : { x: glowX, y: glowY }} />
    <div className="hero-meta"><span>OVERSEAS E-COMMERCE · CASE STUDY</span><span>海外电商增长作品集</span></div>
    <motion.div className="hero-type particle-hero-type" initial={reduceMotion ? false : { opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .85, ease }}>
      <ParticleText text="SHEIN Overseas Toy" className="hero-particle-line" particleSize={2.05} density={4} scatter={165} gatherDuration={1450} pointerRepel={44} repelRadius={135} trigger="hover" fontSize="clamp(2.8rem, 6vw, 5.8rem)" fontWeight={400} color="#f5f5f5" highlightColor="#c9ff34" glow />
      <ParticleText text="Category Growth" className="hero-particle-line" particleSize={2.05} density={4} scatter={165} gatherDuration={1550} stagger={410} pointerRepel={44} repelRadius={135} trigger="hover" fontSize="clamp(2.8rem, 6vw, 5.8rem)" fontWeight={400} color="#f5f5f5" highlightColor="#c9ff34" glow />
      <motion.p className="hero-sub" initial={reduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .4, ease }}>AI-assisted Product Growth &amp; Visual Optimization</motion.p>
    </motion.div>
    <Reveal className="role-pill-motion"><BorderGlow className="role-pill" animated><div className="role-pill-content"><img className="role-mark" src="/assets/role-bot.svg" alt="AI visual growth role icon" /><div><small>ROLE / 项目角色</small><b>Overseas E-commerce Operation &amp; Visual Growth Intern</b><em>海外电商运营与视觉增长实习生</em></div></div></BorderGlow></Reveal>
    <div className="metrics-grid">{metrics.map((m, i) => <Reveal key={m.label} delay={i * .08} className="metric-card-motion"><BorderGlow className="metric-card" animated={i === 0}><strong><CountUp {...m} /></strong><span>{m.label}</span><small>{m.cn}</small>{m.detail && <small className="metric-detail">{m.detail}</small>}</BorderGlow></Reveal>)}</div>
    <Reveal className="hero-preview accordion-hero-preview"><div className="browser-gallery-label"><i /><i /><i /><span>us.shein.com / toys</span></div><AccordionGallery items={[{ image: '/assets/hero/1.png', label: 'Fidget Toy · Hello Kitty', alt: 'Fidget toy and Hello Kitty campaign banners' }, { image: '/assets/hero/5.png', label: 'PINY Beach', alt: 'PINY beach toy campaign banner' }, { image: '/assets/hero/2.png', label: 'Coming Soon · Little Friends', alt: 'Coming Soon and Soft Little Friends campaign banners' }]} defaultIndex={1} expandRatio={.55} trigger="hover" height={500} gap={14} radius={20} accentColor="#c9ff34" overlayColor="#050607" grayscale={false} tilt={6} parallax={.55} /></Reveal>
  </MotionSection>;
}

export function ProjectOverview() {
  return <MotionSection id="overview" className="ruled overview-video-section"><SectionAmbientVideo src="/assets/videos/growth-3537.mp4" className="overview-background-video" /><div className="section-pad section-video-content overview-content-frame"><SectionHead index="02 / 08" eyebrow="PROJECT OVERVIEW / 项目概览" title="从选品到反馈，建立可复用的增长系统。" titleEffect={<WarpText className="overview-warp-title" text={'从选品到反馈，建立可复用的\n增长系统。'} />} copy="Building overseas toy category growth through product selection, AI visual optimization and data-driven iteration." />
    <div className="overview-grid"><Reveal><span className="eyebrow">BACKGROUND / 项目背景</span><p className="lead-cn">SHEIN 海外品类扩展项目覆盖欧美、日韩及东亚市场。针对不同消费者审美，以差异化视觉策略提升商品吸引力与转化表现。</p></Reveal><Reveal className="facts"><div><small>PERIOD / 项目周期</small><b>2025.11 — 2026.04</b></div><div><small>FOCUS / 核心方向</small><b>Product Growth · AI Visual · Data Feedback</b></div><div><small>MARKET / 市场</small><b>EU / US · JP / KR · East Asia</b></div></Reveal></div></div>
  </MotionSection>;
}

const markets = [
  { code: 'EU/US', name: '欧美市场', image: '/assets/context/9.png', focus: '/assets/context/18.png', items: ['潮玩公仔', '盲盒 / 手办', '毛绒玩具', '创意玩具', '解压玩具'] },
  { code: 'JP/KR', name: '日韩市场', image: '/assets/context/13.png', focus: '/assets/context/19.png', items: ['可爱形象玩具', '角色周边 / 配饰', '迷你玩具 / 套装', '生活方式小物'] },
  { code: 'EAST ASIA', name: '东亚市场', image: '/assets/context/17.png', focus: '/assets/context/14.png', items: ['杯具 / 水壶', '香薰 / 蜡烛', '收纳 / 家居用品', '日用百货'] },
];
export function MarketCategoryInsight() {
  return <MotionSection className="section-pad original-section market-role-section">
    <div className="original-label-row"><div><b>MARKET COVERAGE</b><span>市场覆盖</span></div><div><b>MY ROLE</b><span>我的职责与参与流程</span></div></div>
    <div className="market-role-layout"><div className="market-coverage-grid">{markets.map((m, i) => <Reveal className="market-glow-motion" key={m.code} delay={i * .08}><BorderGlow className="original-market-card" borderRadius={28} animated={i === 0}><img className="market-background" src={m.image} alt="" /><div className="market-darken" /><div className="original-market-head"><b>{m.code}</b><span>{m.name}</span></div><img className="market-focus" src={m.focus} alt={`${m.name}代表商品`} /><ul>{m.items.map(x => <li key={x}>{x}</li>)}</ul></BorderGlow></Reveal>)}</div><Reveal className="role-flow-motion"><BorderGlow className="role-flow-original" borderRadius={28}><img src="/assets/context/1.png" alt="我的职责与参与流程：市场洞察、商品筛选、AI提示词设计、视觉生产优化、上架与转化支持、数据反馈迭代" /></BorderGlow></Reveal></div>
  </MotionSection>;
}

type BannerAsset = {
  src: string;
  label: string;
  note: string;
  position: string;
  video?: { mp4?: string; webm?: string };
};

const banners: BannerAsset[] = [
  { src: '/assets/context/20.png', label: 'BEACH CHEER', note: 'Emotional storytelling · Sports & companionship', position: 'center', video: { mp4: '/assets/videos/4500.mp4' } },
  { src: '/assets/hero/5.png', label: 'PINY BEACH', note: 'IP world-building · Immersive seasonal campaign', position: 'top', video: { mp4: '/assets/videos/4582.mp4' } },
  { src: '/assets/context/6.png', label: 'LAST JOURNEY', note: 'Campaign finale · Promotion-led visual narrative', position: 'center', video: { mp4: '/assets/videos/4518.mp4' } },
];

function BannerMedia({ banner }: { banner: BannerAsset }) {
  if (banner.video?.mp4 || banner.video?.webm) {
    return <video className="banner-media" poster={banner.src} autoPlay muted loop playsInline preload="metadata" aria-label={banner.label}>
      {banner.video.webm && <source src={banner.video.webm} type="video/webm" />}
      {banner.video.mp4 && <source src={banner.video.mp4} type="video/mp4" />}
    </video>;
  }
  return <img className="banner-media" src={banner.src} alt={banner.label} style={{ objectPosition: banner.position }} />;
}

export function BannerShowcase() {
  return <MotionSection className="section-pad original-section simple-banner-section"><div className="simple-section-label"><b>Banner</b><span>店铺首页设计</span></div><div className="simple-banner-grid">{banners.map((banner, i) => <Reveal className="simple-banner-item" key={banner.label} delay={i * .06}><BannerMedia banner={banner} /></Reveal>)}</div>
  </MotionSection>;
}

const workflow = [
  ['01', 'Product Selection', '商品筛选 · 识别增长潜力'], ['02', 'Market Analysis', '市场分析 · 判断受众场景'], ['03', 'AI Prompt Design', '提示词设计 · 构建视觉体系'], ['04', 'Visual Optimization', '视觉优化 · 强化购买理由'], ['05', 'Listing & Conversion', '商品上架 · 完成销售验证'], ['06', 'Data Feedback', '数据反馈 · 驱动下一轮优化'],
];
const visualTypes = [
  ['首页 Banner', 'Homepage Banner'],
  ['品类导航', 'Category Navigation'],
  ['商品展示', 'Product Display'],
  ['场景化呈现', 'Scenario Display'],
];
export function AIWorkflow() {
  return <MotionSection id="workflow" className="section-pad original-section comparison-section">
    <Reveal className="visual-type-strip"><div className="visual-type-grid">{visualTypes.map((item, index) => <motion.div key={item[0]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: .62, delay: index * .1, ease }}><BorderGlow className="visual-type-glow" animated={index === 0}><span className={`visual-type-sprite visual-type-${index + 1}`} /><b>{item[0]}</b><small>{item[1]}</small></BorderGlow></motion.div>)}</div></Reveal>
    <div className="comparison-grid">
      <Reveal className="comparison-panel"><div className="comparison-col"><b>BEFORE</b><strong>原始供应商图</strong><img src="/assets/context/8.png" alt="原始加菲猫商品图" /></div><img className="comparison-hand" src="/assets/bestseller/11.png" alt="" /><div className="comparison-col"><b>AFTER</b><strong>AI 优化后图</strong><HalftoneReveal className="comparison-halftone" src="/assets/context/19.png" alt="AI优化后的加菲猫商品图" /></div><p>提取商品自身的橙、黄、奶油白作为场景色彩依据，通过同色系背景、棋盘格台面和圆柱展台建立视觉呼应；在保持产品造型、颜色及软胶质感不变的前提下，将低质供应商图片优化为具有童趣氛围和商业棚拍质感的电商视觉。</p></Reveal>
      <Reveal className="comparison-panel"><div className="comparison-col"><b>BEFORE</b><strong>原始供应商图</strong><img src="/assets/context/2.png" alt="原始家居商品图" /></div><img className="comparison-hand" src="/assets/bestseller/11.png" alt="" /><div className="comparison-col"><b>AFTER</b><strong>AI 优化后图</strong><HalftoneReveal className="comparison-halftone" src="/assets/context/14.png" alt="AI优化后的家居场景图" /></div><p>光影、百叶窗、麻布、地毯、极简、高雅，原产品材质等都不变；突出产品，产品在画面中比例大点，可以有相关的搭配植物，画面干净明亮，不要喧宾夺主。</p></Reveal>
    </div>
  </MotionSection>;
}

export function VisualOptimization() {
  const growthSteps = [['01','Selection','商品筛选 · 识别增长潜力'],['02','Market Analysis','市场分析 · 判断受众场景'],['03','AI Visual Optimization','AI 视觉优化 · 强化购买理由'],['04','Listing','商品上架 · 完成销售验证'],['05','Data Feedback','数据反馈 · 驱动下一轮优化']];
  return <MotionSection className="section-pad original-section growth-performance-section"><SectionAmbientVideo src="/assets/videos/growth-3537.mp4" className="growth-background-video" /><div className="section-video-content"><Reveal className="growth-kicker"><span>03 / 06</span><b>GROWTH PERFORMANCE</b><em>商品生命周期表现复盘</em></Reveal><Reveal className="growth-copy"><div><h3>五步形成闭环。</h3><p>One loop. Five connected actions.</p></div><p>Selection → Market Analysis → AI Visual<br />Optimization → Listing → Data Feedback</p></Reveal><div className="growth-step-grid">{growthSteps.map((step,i)=><Reveal className="growth-step-motion" key={step[0]} delay={i*.06}><BorderGlow className="growth-step-card" animated={i===0}><span>{step[0]}</span><i>→</i><div><b>{step[1]}</b><small>{step[2]}</small></div></BorderGlow></Reveal>)}</div><Reveal className="feedback-loop original-feedback"><b>DATA FEEDBACK / 数据反馈</b><span /><p>销售表现回流到选品与视觉策略，形成下一轮迭代。</p><em>↻</em></Reveal><div className="growth-visual-row"><Reveal><img src="/assets/growth/3.jpg" alt="原始素材" /><span>原始素材</span></Reveal><Reveal delay={.08}><img src="/assets/growth/6.png" alt="AI视觉生成" /><span>AI 视觉生成</span></Reveal><Reveal delay={.16}><img src="/assets/growth/7.png" alt="最终上架" /><span>最终上架</span></Reveal></div></div></MotionSection>;
}

const chartData = [{ m: '2025.11', v: 1.5 }, { m: '2025.12', v: 1.62 }, { m: '2026.01', v: 1.88 }, { m: '2026.02', v: 1.45 }, { m: '2026.03', v: 1.92 }, { m: '2026.04', v: 2.2 }];
function AnimatedGrowthChart() {
  const reduceMotion = useReducedMotion();
  const points = chartData.map((item, index) => ({ ...item, x: 150 + index * 150, y: 430 - (item.v / 2.4) * 300 }));
  const curve = 'M150 242.5 C205 242.5 245 230 300 227.5 S395 187 450 195 S545 260 600 248.75 S695 184 750 190 S845 155 900 155';
  const area = `${curve} L900 430 L150 430 Z`;
  const axis = [0, .4, .8, 1.2, 1.6, 2, 2.4];
  return <div className="growth-chart-ui">
    <div className="growth-chart-head"><div><span className="growth-chart-icon"><i /><i /><i /></span><div><h3>Category Penetration Growth</h3><p>品类渗透率增长趋势</p></div></div><div className="growth-chart-delta"><b>+0.70%</b><span>百分点提升</span><i>↗</i></div></div>
    <div className="growth-chart-label">渗透率 (%)</div>
    <svg viewBox="0 0 1040 520" role="img" aria-label="品类渗透率从2025年11月的1.50增长至2026年4月的2.20">
      <defs><linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d8ff3d" stopOpacity=".48"/><stop offset="1" stopColor="#d8ff3d" stopOpacity=".015"/></linearGradient><linearGradient id="growthBar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfff28" stopOpacity=".2"/><stop offset="1" stopColor="#bfff28" stopOpacity=".02"/></linearGradient><filter id="growthGlow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      {axis.map(value => { const y = 430 - (value / 2.4) * 300; return <g key={value}><line x1="125" y1={y} x2="930" y2={y} className="growth-grid-line"/><text x="90" y={y + 5} className="growth-axis-label">{value.toFixed(value % 1 ? 1 : 0)}</text></g>; })}
      {points.map((point, index) => <motion.rect key={`bar-${point.m}`} x={point.x - 18} y={point.y} width="36" height={430 - point.y} rx="8" fill="url(#growthBar)" initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }} whileInView={reduceMotion ? undefined : { scaleY: 1, opacity: 1 }} viewport={{ once: true, amount: .3 }} transition={{ duration: .9, delay: .18 + index * .1, ease }} style={{ transformBox: 'fill-box', transformOrigin: 'center bottom' }} />)}
      <motion.path d={area} fill="url(#growthArea)" initial={reduceMotion ? false : { opacity: 0 }} whileInView={reduceMotion ? undefined : { opacity: 1 }} viewport={{ once: true, amount: .3 }} transition={{ duration: 1.1, delay: .45 }} />
      <motion.path d={curve} className="growth-curve" pathLength="1" initial={reduceMotion ? false : { pathLength: 0 }} whileInView={reduceMotion ? undefined : { pathLength: 1 }} viewport={{ once: true, amount: .3 }} transition={{ duration: 2, ease }} />
      {points.map((point, index) => <g key={point.m}><motion.circle cx={point.x} cy={point.y} r="10" className="growth-point" initial={reduceMotion ? false : { scale: 0, opacity: 0 }} whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 190, damping: 16, delay: .42 + index * .16 }} /><motion.text x={point.x} y={point.y - 24} textAnchor="middle" className="growth-value" initial={reduceMotion ? false : { opacity: 0, y: 7 }} whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: .55 + index * .14 }}>{point.v.toFixed(2)}</motion.text><text x={point.x} y="474" textAnchor="middle" className="growth-date">{point.m}</text>{index === points.length - 1 && <motion.text x={point.x} y={point.y - 58} textAnchor="middle" className="growth-crown" initial={reduceMotion ? false : { scale: 0, rotate: -15 }} whileInView={reduceMotion ? undefined : { scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', delay: 1.4 }}>♛</motion.text>}</g>)}
    </svg>
    <div className="growth-chart-summary"><span>♛</span><p>两个月内渗透率由 <b>1.50% → 2.20%</b>，提升 <b>0.70</b> 个百分点，持续增长</p></div>
  </div>;
}
export function DataGrowthAnalysis() {
  return <MotionSection className="section-pad original-section original-chart-section"><SectionAmbientVideo src="/assets/videos/growth-3537.mp4" className="chart-background-video" /><div className="section-video-content"><Reveal className="simple-section-label"><b>DATA GROWTH ANALYSIS</b><span>数据增长分析</span></Reveal><Reveal className="original-chart"><AnimatedGrowthChart /></Reveal></div></MotionSection>;
}

const products = [
  { image: '/assets/bestseller/2.png', sales: '10K+', price: '$4.28', name: 'Creative Fun Green Apple' },
  { image: '/assets/bestseller/3.png', sales: '8.7K+', price: '$2.85', name: 'Random Color Sensory Set' },
  { image: '/assets/bestseller/4.png', sales: '2.4K+', price: '$2.19', name: 'Color Dessert Play Set' },
  { image: '/assets/bestseller/5.png', sales: '10K+', price: '$2.28', name: 'Super Soft Block Toy' },
  { image: '/assets/context/18.png', sales: '9.8K+', price: '$3.14', name: 'Ocean Themed Sensory Cube' },
];

export function AIPromptSystem() {
  return <Reveal className="prompt-system"><span>AI</span><div><h3>AI Prompt System</h3><p>Top 5 商品统一采用可复用的视觉提示词体系，持续赋能爆品增长。</p></div></Reveal>;
}

function RisingLinesAmbient() {
  return <div className="rising-lines-local" aria-hidden="true"><div className="rising-horizon" />{Array.from({ length: 9 }, (_, i) => <i key={`line-${i}`} className={`rising-line rising-line-${i + 1}`} />)}{Array.from({ length: 14 }, (_, i) => <span key={`particle-${i}`} className={`rising-particle rising-particle-${i + 1}`} />)}</div>;
}

export function BestsellerPerformance() {
  return <MotionSection id="impact" className="section-pad original-section original-bestseller-section"><RisingLinesAmbient /><div className="bestseller-original-content"><div className="bestseller-original-head"><div><b>Bestseller Performance</b><span>爆品持续表现验证</span></div><div><strong><CountUp value={3} suffix="+" /></strong><span>Months<small>持续霸榜</small></span></div></div><Reveal className="bestseller-original-rail"><RippleDistortion src="/assets/bestseller/1.png" alt="Top5爆款商品榜单" /></Reveal><div className="bestseller-proof-row"><Reveal><img src="/assets/bestseller/8.png" alt="3月Top5" /><span>3月Top5</span></Reveal><img className="proof-hand" src="/assets/bestseller/11.png" alt="" /><Reveal><img src="/assets/bestseller/10.png" alt="7月Top5" /><span>7月Top5</span></Reveal></div><Reveal className="bestseller-system-original"><img src="/assets/bestseller/9.png" alt="Top5商品统一AI视觉提示词体系，持续赋能爆品增长" /></Reveal></div></MotionSection>;
}
