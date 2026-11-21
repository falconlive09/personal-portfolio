import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Instagram, ArrowDown, ArrowDownRight, Bot, Zap, ExternalLink, MessageSquare, X } from 'lucide-react';
import { portfolioData } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import Link from 'next/link';
import gsap from "gsap";
import { ProfileCard } from "@/components/ui/profile-card";
import { Spotlight } from "@/components/ui/spotlight-new";

export function HeroVisual({ isExiting = false }: { isExiting?: boolean }) {
  const { personal } = portfolioData;
  const [showProfile, setShowProfile] = useState(false);
  // Phones can't hover: the badge opens the profile card as a modal on tap instead
  const [showProfileMobile, setShowProfileMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isPhone = () => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
  const [tooltip, setTooltip] = useState<{ show: boolean; text: string; x: number; y: number; icon: 'zap' | 'bot' | null }>({
    show: false,
    text: '',
    x: 0,
    y: 0,
    icon: null
  });

  const githubRef = useRef(null);
  const linkedinRef = useRef(null);
  const instagramRef = useRef(null);
  const zapRef = useRef(null);
  const zapSmallRef = useRef(null);
  const botRef = useRef(null);

  useEffect(() => {
    if (!isExiting) return;

    const ctx = gsap.context(() => {
      // Reveal + Loop for GitHub
      gsap.fromTo(githubRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(githubRef.current, {
              y: -10,
              duration: 2,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Reveal + Loop for LinkedIn
      gsap.fromTo(linkedinRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.1,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(linkedinRef.current, {
              y: 10,
              duration: 2.5,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Reveal + Loop for Instagram
      gsap.fromTo(instagramRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          onComplete: () => {
            gsap.to(instagramRef.current, {
              x: 10,
              duration: 3,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              force3D: true
            });
          }
        }
      );

      // Zap pulsing - Energetic heartbeat effect
      gsap.to([zapRef.current, zapSmallRef.current], {
        scale: 1.2,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        force3D: true
      });

      // Bot floating - Responsive and smooth
      gsap.to(botRef.current, {
        rotation: 8,
        y: -10,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        force3D: true
      });
    });

    return () => ctx.revert();
  }, [isExiting]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen min-h-[100svh] w-full flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/20"
    >
      {/* Background Pattern */}
      <div className="w-full absolute h-full z-0 bg-[radial-gradient(circle,_#888_0.5px,_transparent_0.5px)] dark:bg-[radial-gradient(circle,_#444_0.5px,_transparent_0.5px)] opacity-20 [background-size:24px_24px]" />

      {/* Spotlight Effect - Dramatic lighting */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <Spotlight
          duration={10}
          xOffset={120}
          translateY={-300}
          gradientFirst="radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(0, 0%, 100%, .15) 0, hsla(0, 0%, 100%, .05) 50%, transparent 80%)"
          gradientSecond="radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .1) 0, hsla(0, 0%, 100%, .02) 80%, transparent 100%)"
          gradientThird="radial-gradient(50% 50% at 50% 50%, hsla(0, 0%, 100%, .08) 0, hsla(0, 0%, 100%, 0) 80%, transparent 100%)"
        />
      </div>

      <main className="relative flex-1 flex flex-col justify-center pt-28 pb-8 max-lg:landscape:pt-20 max-lg:landscape:pb-4 lg:pt-40 lg:pb-20 z-10 max-w-[105rem] w-full mx-auto">
        <div className="[--fs:min(10.5vw,11svh)] max-lg:landscape:[--fs:min(8.3vw,18svh)] flex-1 lg:flex-none flex relative gap-4 max-lg:portrait:gap-[3.5svh] max-lg:landscape:gap-[1.5svh] pl-8 pr-3 md:px-6 items-center w-full flex-col justify-center">

          {/* Follow-Cursor Tooltip */}
          <AnimatePresence>
            {tooltip.show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="fixed pointer-events-none z-[100] flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold px-4 py-2.5 rounded-full shadow-2xl"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  x: "-50%",
                  y: "-150%", // offset slightly above the cursor
                }}
              >
                {tooltip.icon === 'zap' && <ExternalLink className="w-4 h-4" />}
                {tooltip.icon === 'bot' && <MessageSquare className="w-4 h-4" />}
                <span className="text-sm">{tooltip.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Line 1: BACKEND */}
          <div className="flex gap-[calc(var(--fs)*0.18)] lg:gap-8 items-center relative">
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="shrink-0 text-[clamp(7px,calc(var(--fs)*0.16),11px)] max-lg:portrait:text-[clamp(8px,calc(var(--fs)*0.2),12px)] max-lg:landscape:text-[11px] max-lg:landscape:tracking-[0.18em] lg:text-xs text-muted-foreground text-right leading-relaxed max-w-[calc(var(--fs)*2.3)] max-lg:portrait:max-w-[calc(var(--fs)*2.5)] max-lg:landscape:max-w-[calc(var(--fs)*2.9)] lg:max-w-[220px] font-medium uppercase tracking-[0.15em] lg:tracking-[0.2em]"
            >
              Hi, I'm {personal.name}. I build scalable systems powered by intelligence.
            </motion.p>
            <div className="relative">
              <div ref={githubRef} className="absolute -top-[calc(var(--fs)*0.48)] right-0 max-lg:landscape:top-[calc(50%-var(--fs)*0.26)] max-lg:landscape:-right-[calc(var(--fs)*0.72)] lg:-top-4 lg:right-2 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                  target="_blank"
                  className="block"
                >
                  <Github size={32} className="w-[calc(var(--fs)*0.52)] h-[calc(var(--fs)*0.52)] lg:w-8 lg:h-8" />
                </a>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-[length:var(--fs)] lg:text-[clamp(3rem,11vw,13rem)] font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-[calc(var(--fs)*0.1)] lg:px-4"
              >
                FULLSTACK
              </motion.h1>
            </div>
          </div>

          {/* Line 2: SOFT [ICON] WARE */}
          <div className="flex gap-[calc(var(--fs)*0.18)] lg:gap-8 items-center relative">
            <div className="relative">
              <div ref={linkedinRef} className="absolute top-[calc(50%-var(--fs)*0.26)] -left-[calc(var(--fs)*0.72)] lg:-top-8 lg:left-4 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={personal.socialLinks.find(s => s.platform === 'LinkedIn')?.url}
                  target="_blank"
                  className="block"
                >
                  <Linkedin size={32} className="w-[calc(var(--fs)*0.52)] h-[calc(var(--fs)*0.52)] lg:w-8 lg:h-8" />
                </a>
              </div>
              <div ref={instagramRef} className="absolute top-[calc(50%-var(--fs)*0.26)] -right-[calc(var(--fs)*0.72)] lg:top-auto lg:-bottom-12 lg:right-36 text-primary/60 hover:text-primary z-20 opacity-0">
                <a
                  href={personal.socialLinks.find(s => s.platform === 'Instagram')?.url}
                  target="_blank"
                  className="block"
                >
                  <Instagram size={32} className="w-[calc(var(--fs)*0.52)] h-[calc(var(--fs)*0.52)] lg:w-8 lg:h-8" />
                </a>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[length:var(--fs)] lg:text-[clamp(3rem,11vw,13rem)] flex items-center font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-[calc(var(--fs)*0.1)] lg:px-4"
              >
                <span className="">SOFT</span>
                <div
                  ref={zapRef}
                  className="hidden lg:block mx-[0.05em] relative cursor-pointer group"
                  onClick={() => window.open(personal.socialLinks.find(s => s.platform === 'GitHub')?.url, '_blank')}
                  onMouseEnter={(e) => setTooltip({ show: true, text: "View my GitHub", icon: 'zap', x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                >
                  <Zap className="w-[0.8em] h-[0.8em] text-sky-400 group-hover:text-sky-300 transition-colors" strokeWidth={1.5} />
                </div>
                <div
                  ref={zapSmallRef}
                  className="block lg:hidden mx-[0.02em] relative cursor-pointer group"
                  onClick={() => window.open(personal.socialLinks.find(s => s.platform === 'GitHub')?.url, '_blank')}
                  onMouseEnter={(e) => setTooltip({ show: true, text: "View my GitHub", icon: 'zap', x: e.clientX, y: e.clientY })}
                  onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                >
                  <Zap className="w-[0.8em] h-[0.8em] text-sky-400 group-hover:text-sky-300 transition-colors" strokeWidth={2} />
                </div>
                <span className="">WARE</span>
              </motion.h1>
            </div>
          </div>

          {/* Line 3: EN [ICON] GINEER */}
          <div className="flex gap-[calc(var(--fs)*0.18)] lg:gap-8 items-center relative">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isExiting ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[length:var(--fs)] lg:text-[clamp(3rem,11vw,13rem)] flex items-center font-black leading-[0.85] tracking-tighter text-shiny will-change-transform px-[calc(var(--fs)*0.1)] lg:px-4"
            >
              <span className="">EN</span>
              <div
                ref={botRef}
                className="mx-[0.05em] relative cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  window.dispatchEvent(new CustomEvent('portfolio:toggle-chatbot', {
                    detail: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
                  }));
                }}
                onMouseEnter={(e) => setTooltip({ show: true, text: "Talk to my AI Assistant", icon: 'bot', x: e.clientX, y: e.clientY })}
                onMouseMove={(e) => setTooltip(prev => ({ ...prev, x: e.clientX, y: e.clientY }))}
                onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
              >
                <Bot className="w-[0.85em] h-[0.85em] text-yellow-500 fill-yellow-500/10 group-hover:text-yellow-400 group-hover:fill-yellow-400/20 transition-colors" />
              </div>
              <span className="">GINEER</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="shrink-0 text-[clamp(7px,calc(var(--fs)*0.16),11px)] max-lg:portrait:text-[clamp(8px,calc(var(--fs)*0.2),12px)] max-lg:landscape:text-[11px] max-lg:landscape:tracking-[0.18em] lg:text-xs text-muted-foreground pt-[calc(var(--fs)*0.19)] max-lg:landscape:pt-[calc(var(--fs)*0.3)] lg:pt-8 leading-relaxed max-w-[calc(var(--fs)*2.3)] max-lg:portrait:max-w-[calc(var(--fs)*2.5)] max-lg:landscape:max-w-[calc(var(--fs)*2.9)] lg:max-w-[200px] font-medium uppercase tracking-[0.12em] lg:tracking-widest"
            >
              Open to all forms of collaboration, regardless of location and language.
            </motion.p>
          </div>
        </div>

        {/* Separator Section */}
        <div className="mx-auto max-w-[105rem] w-full px-8 md:px-20 mt-6 max-lg:landscape:mt-2 lg:mt-24">
          <div className="flex items-center gap-6">
            <Separator className="flex-1 h-[1px] bg-foreground/10" />
            <div className="text-[10px] md:text-xs whitespace-nowrap font-bold tracking-[0.3em] text-muted-foreground uppercase">
              MUMBAI, IN — 2026
            </div>
            <Link
              href="/resume"
              className="group flex items-center"
            >
              <motion.div
                className="relative flex items-center bg-zinc-100 dark:bg-white h-12 w-12 group-hover:w-44 rounded-full transition-all duration-500 ease-[0.23,1,0.32,1] overflow-hidden shadow-xl"
              >
                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 group-hover:delay-150 text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-black pl-6 pr-12">
                  View Resume
                </span>
                <div className="absolute right-0 flex items-center justify-center size-12 text-zinc-900 dark:text-black group-hover:rotate-45 transition-transform duration-500">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
              </motion.div>
            </Link>
          </div>
        </div>
      </main>

      {/* Award/Badge Vertical - MOVED TO LEFT */}
      <div
        className="absolute left-0 top-1/2 z-50 flex items-center transform -translate-y-1/2 group/container"
        onMouseEnter={() => { if (!isPhone()) setShowProfile(true); }}
        onMouseLeave={() => setShowProfile(false)}
        onClick={() => { if (isPhone()) setShowProfileMobile(true); }}
      >
        {/* The Badge Trigger */}
        <div className="relative z-50">
          <motion.div
            whileHover={{ x: 10 }}
            className="flex justify-center w-7 lg:w-auto bg-white text-black py-6 px-2 text-[9px] tracking-[0.3em] rounded-r-2xl lg:py-10 lg:px-4 lg:text-[10px] lg:tracking-[0.5em] lg:rounded-r-3xl font-black uppercase shadow-2xl border-r border-y border-zinc-200 cursor-pointer"
          >
            <span className="block rotate-0 [writing-mode:vertical-rl]">
              AVAILABLE FOR OPPORTUNITY
            </span>
          </motion.div>
        </div>

        {/* Profile Card Sidebar/Drawer Effect - Connected to avoid gap */}
        <AnimatePresence>
          {showProfile && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="pl-4 pointer-events-auto"
              style={{ width: 'max-content' }}
            >
              <ProfileCard
                name={personal.name}
                title="Software Development Engineer"
                description={`${personal.name} is a Software Development Engineer building real-time, high-scale backend and distributed systems, from fraud detection for India's digital payments at NPCI to Java and Spring Boot microservices for fund administration.`}
                imageUrl={personal.avatar}
                githubUrl={personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                linkedinUrl={personal.socialLinks.find(s => s.platform === 'LinkedIn')?.url}
                instagramUrl={personal.socialLinks.find(s => s.platform === 'Instagram')?.url}
                className="!max-w-4xl scale-[0.8] origin-left"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {showProfileMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setShowProfileMobile(false)}
            >
              <button
                onClick={() => setShowProfileMobile(false)}
                aria-label="Close profile"
                className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-[210] p-2.5 rounded-full bg-white text-black shadow-xl"
              >
                <X className="w-5 h-5" />
              </button>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="w-full max-w-sm max-h-[92svh] overflow-y-auto rounded-[2.5rem]"
                onClick={(e) => e.stopPropagation()}
              >
                <ProfileCard
                  name={personal.name}
                  title="Software Development Engineer"
                  description={`${personal.name} is a Software Development Engineer building real-time, high-scale backend and distributed systems, from fraud detection for India's digital payments at NPCI to Java and Spring Boot microservices for fund administration.`}
                  imageUrl={personal.avatar}
                  githubUrl={personal.socialLinks.find(s => s.platform === 'GitHub')?.url}
                  linkedinUrl={personal.socialLinks.find(s => s.platform === 'LinkedIn')?.url}
                  instagramUrl={personal.socialLinks.find(s => s.platform === 'Instagram')?.url}
                  forceMobile
                  className="px-0"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
