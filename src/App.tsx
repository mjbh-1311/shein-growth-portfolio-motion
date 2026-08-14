import { MotionConfig, motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { useEffect } from 'react';
import {
  AIWorkflow,
  BannerShowcase,
  BestsellerPerformance,
  DataGrowthAnalysis,
  HeroSection,
  MarketCategoryInsight,
  ProjectOverview,
  VisualOptimization,
} from './components/Sections';

function Header() {
  return (
    <header className="site-header">
      <a className="brand" href="#top"><b>SHEIN</b><span>PROJECT 01</span></a>
      <nav aria-label="作品集章节">
        <a href="#overview">Overview</a>
        <a href="#workflow">Workflow</a>
        <a href="#impact">Impact</a>
      </nav>
      <span className="year">2025—2026</span>
    </header>
  );
}

function Atmosphere() {
  const dots = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, delay: (i % 8) * .45,
  }));
  return (
    <div className="atmosphere" aria-hidden="true">
      <div className="glow glow-a" /><div className="glow glow-b" />
      {dots.map((dot, i) => <motion.i key={i} style={{ left: dot.left, top: dot.top }} animate={{ y: [0, -18, 0], opacity: [.08, .38, .08] }} transition={{ duration: 7 + i % 5, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }} />)}
    </div>
  );
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: .001 });
  useEffect(() => {
    const onResultClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const image = target.closest('.comparison-col:nth-of-type(2) img') as HTMLImageElement | null;
      if (!image) return;
      image.classList.remove('comparison-result-pulse');
      void image.offsetWidth;
      image.classList.add('comparison-result-pulse');
      window.setTimeout(() => image.classList.remove('comparison-result-pulse'), 760);
    };
    document.addEventListener('click', onResultClick);
    return () => document.removeEventListener('click', onResultClick);
  }, []);
  return (
    <MotionConfig reducedMotion="user">
      <motion.div id="top" className="app-shell" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .65, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div className="progress" style={{ scaleX }} />
        <Atmosphere />
        <Header />
        <main>
          <HeroSection />
          <ProjectOverview />
          <MarketCategoryInsight />
          <BannerShowcase />
          <AIWorkflow />
          <VisualOptimization />
          <DataGrowthAnalysis />
          <BestsellerPerformance />
        </main>
        <footer><span>SHEIN CASE STUDY</span><span>AI-ASSISTED PRODUCT GROWTH &amp; VISUAL OPTIMIZATION</span></footer>
      </motion.div>
    </MotionConfig>
  );
}
