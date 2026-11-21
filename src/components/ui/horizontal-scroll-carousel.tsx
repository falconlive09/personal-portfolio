"use client";

import { motion, useTransform, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { portfolioData } from "@/data/portfolio";
import {
  Users, Brain, Users2, MessageSquare, Puzzle,
  RefreshCw, BookOpen, Network, LineChart, Search, Flag
} from "lucide-react";

// Lucide icons disesuaikan dengan skill baru (AI & Software Engineer)
const skillIcons: Record<string, any> = {
  'Problem Solving': Puzzle,
  'Systemic Thinking': Network,
  'Critical Thinking': Brain,
  'Continuous Learning': BookOpen,
  'Analytical Thinking': LineChart,
  'Adaptability': RefreshCw,
  'Leadership': Users,
  'Ownership': Flag,
  'Communication': MessageSquare,
  'Teamwork': Users2,
  'Research Skills': Search,
};

// unDraw illustrations (MIT) served via jsDelivr, pinned to a commit so they never change underneath us
const ILLUSTRATIONS = 'https://cdn.jsdelivr.net/gh/balazser/undraw-svg-collection@9c02f9893198f7bce6e514be2de2b6c544775ab1/svgs';
const skillVisuals: Record<string, string> = {
  'Problem Solving': `${ILLUSTRATIONS}/problem-solving.svg`,
  'Systemic Thinking': `${ILLUSTRATIONS}/process.svg`,
  'Critical Thinking': `${ILLUSTRATIONS}/processing-thoughts.svg`,
  'Continuous Learning': `${ILLUSTRATIONS}/learning.svg`,
  'Analytical Thinking': `${ILLUSTRATIONS}/analytics.svg`,
  'Adaptability': `${ILLUSTRATIONS}/solution-mindset.svg`,
  'Leadership': `${ILLUSTRATIONS}/team-goals.svg`,
  'Ownership': `${ILLUSTRATIONS}/goal.svg`,
  'Communication': `${ILLUSTRATIONS}/conversation.svg`,
  'Teamwork': `${ILLUSTRATIONS}/team-collaboration.svg`,
  'Research Skills': `${ILLUSTRATIONS}/analyze.svg`,
};

const allCards = portfolioData.softSkills.slice(0, 10).map((skill, index) => ({
  id: index + 1,
  title: skill.name,
  description: skill.description,
  url: skillVisuals[skill.name] || `${ILLUSTRATIONS}/process.svg`,
  Icon: skillIcons[skill.name] || Users
}));

export const HorizontalScrollCarousel = () => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-68%"]);

  // Below lg the fixed -68% stops before the last card on narrow screens, so slide by the
  // measured overflow instead (row width - viewport width). Desktop keeps the original -68%.
  const rowRef = useRef<HTMLDivElement>(null);
  const distanceRef = useRef(0);
  const [useMeasured, setUseMeasured] = useState(false);
  useEffect(() => {
    const measure = () => {
      const narrow = window.innerWidth < 1024;
      setUseMeasured(narrow);
      if (narrow && rowRef.current) distanceRef.current = Math.max(0, rowRef.current.scrollWidth - window.innerWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (rowRef.current) ro.observe(rowRef.current);
    window.addEventListener("resize", measure);
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const xMeasured = useTransform(scrollYProgress, (v) => -v * distanceRef.current);

  return (
    <section
      ref={targetRef}
      className="relative h-[350vh] bg-background"
    >
      <div className="sticky top-0 flex flex-col h-screen overflow-hidden pb-8 md:pb-12">

        {/* Title Section (Didorong ke paling atas layar) */}
        <div className="w-full px-6 md:px-24 pt-6 md:pt-8 lg:pt-12 z-20 flex-shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl max-lg:landscape:text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/40 leading-[0.9] pb-2">
              Strategic Directives
            </h2>
            <div className="w-20 h-1.5 bg-primary mt-4 mb-4 max-lg:landscape:my-2 rounded-full opacity-80"></div>
            <p className="text-muted-foreground text-base md:text-lg lg:text-xl max-lg:landscape:text-xs font-medium max-w-2xl leading-relaxed">
              Interpersonal capabilities engineered for high-impact leadership and systemic problem solving in complex environments.
            </p>
          </motion.div>
        </div>

        {/* Carousel Items (Rata atas dengan jarak pasti agar teks tidak nempel) */}
        <div className="flex-1 flex items-center w-full relative mt-4 lg:mt-6">
          <motion.div ref={rowRef} style={{ x: useMeasured ? xMeasured : x }} className="flex gap-6 md:gap-8 px-6 md:px-24 absolute w-max">
            {allCards.map((card) => {
              return <Card card={card} key={card.id} />;
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Card = ({ card }: { card: typeof allCards[0] }) => {
  const { Icon } = card;
  return (
    <div
      key={card.id}
      className="group relative h-[320px] w-[240px] sm:h-[360px] sm:w-[280px] md:h-[400px] md:w-[320px] lg:h-[440px] lg:w-[380px] overflow-hidden bg-card/10 hover:bg-card/30 border border-border/80 shadow-sm flex-shrink-0 transition-colors duration-500 rounded-none max-h-[50vh] lg:max-h-[60vh] max-lg:landscape:max-h-[52svh] max-lg:portrait:h-[55svh] max-lg:portrait:max-h-none max-lg:portrait:w-[min(72vw,340px)]"
    >
      {/* Sci-fi Corner Brackets (On Hover) */}
      <div className="absolute top-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-t-[2px] border-l-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute top-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-t-[2px] border-r-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute bottom-0 left-0 w-3 h-3 sm:w-4 sm:h-4 border-b-[2px] border-l-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform -translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />
      <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 border-b-[2px] border-r-[2px] border-blue-600 dark:border-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 transform translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0" />

      <div className="absolute inset-0 z-0 flex items-center justify-center p-6 sm:p-8 transition-transform duration-700 group-hover:scale-[1.03] opacity-60 group-hover:opacity-100">
        <img
          src={card.url}
          alt={card.title}
          className="w-full h-full object-contain dark:invert dark:hue-rotate-180"
        />
      </div>

      <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-background/60 to-transparent transition-opacity duration-500 opacity-90 group-hover:opacity-100 pointer-events-none"></div>

      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8 lg:p-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-3 lg:mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="p-2 border border-border bg-background/50 backdrop-blur-sm rounded-none">
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-foreground" />
          </div>
          <span className="text-[10px] lg:text-xs font-mono text-muted-foreground uppercase tracking-widest">
            #{String(card.id).padStart(2, '0')}
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase text-foreground mb-2 lg:mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75 leading-tight">
          {card.title}
        </h3>

        <p className="text-muted-foreground text-xs sm:text-sm lg:text-base leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-150 border-t border-border/50 pt-3 lg:pt-4">
          {card.description}
        </p>
      </div>
    </div>
  );
};

export default HorizontalScrollCarousel;
