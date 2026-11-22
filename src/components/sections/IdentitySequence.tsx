"use client";

import React, { useRef } from "react";
import { motion, useTransform, useSpring, easeOut, easeInOut, circOut, useMotionValueEvent, useInView } from "framer-motion";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { portfolioData } from "@/data/portfolio";
import { InfiniteMarquee } from "@/components/ui/InfiniteMarquee";
import { BrandScroller, BrandScrollerReverse } from "@/components/ui/brand-scroller";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import MagneticEffect from "@/components/ui/MagneticEffect";

const BlurInUpText = ({ text, animate }: { text: string; animate: boolean }) => {
    const words = text.split(" ");
    return (
        <motion.span
            initial="hidden"
            animate={animate ? "visible" : "hidden"}
            transition={{ staggerChildren: 0.01 }}
            aria-label={text}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block whitespace-pre">
                    {word.split("").map((char, charIndex) => (
                        <motion.span
                            key={charIndex}
                            variants={{
                                hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
                                visible: { 
                                    opacity: 1, 
                                    y: 0, 
                                    filter: "blur(0px)", 
                                    transition: { type: "spring", bounce: 0, duration: 0.5 } 
                                }
                            }}
                            // No will-change here: it kept every letter as its own GPU layer (~300 on the
                            // home page) long after the reveal finished. Framer promotes them while animating.
                            className="inline-block"
                        >
                            {char}
                        </motion.span>
                    ))}
                    {wordIndex < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                </span>
            ))}
        </motion.span>
    );
};

interface IdentitySequenceProps {
    scrollYProgress: any; // Parent scroll progress [0, 1]
    isVisible: boolean;
    /**
     * Phones & tablets: no pinned scroll story. The card sits in normal flow in its final state
     * (marquee, portrait, text, tech stack one after another) and reveals play when scrolled into view.
     */
    compact?: boolean;
}

export const IdentitySequence = ({ scrollYProgress, isVisible, compact = false }: IdentitySequenceProps) => {
    const t = useTranslations("about");
    const [isHovered, setIsHovered] = React.useState(false);
    const [isTextAnimated, setIsTextAnimated] = React.useState(false);
    // Compact mode: the narrative text animates in when it reaches the screen instead of at a scroll point
    const textRef = React.useRef<HTMLDivElement>(null);
    const textInView = useInView(textRef, { once: true, margin: "0px 0px -15% 0px" });
    const textAnimated = compact ? textInView : isTextAnimated;

    // Map the parent's scroll progress (0.4 to 0.85) to local progress (0 to 1).
    // This leaves 0.85 to 1.0 (approx 90vh) as a "pause" where the user can just read the Tech Stack before it scrolls away.
    const localProgress = useTransform(scrollYProgress, [0.4, 0.85], [0, 1]);

    // 1. Card Transformation (Entrance & Scaling)
    const cardScale = useTransform(localProgress, [0, 0.4], [0.8, 1], { ease: easeInOut });
    const cardY = useTransform(localProgress, [0, 0.4], ["60vh", "0vh"], { ease: easeInOut });
    const cardBorderRadius = useTransform(localProgress, [0.1, 0.4], ["60px", "0px"], { ease: easeInOut });

    // 2. Internal Content Scroll
    const contentY = useTransform(localProgress, [0.35, 1], ["0%", "-70%"], { ease: easeInOut });
    const imageParallaxY = useTransform(localProgress, [0.35, 1], ["-10%", "10%"], { ease: easeInOut });

    // 3. Elements specific animations
    const phase0Opacity = useTransform(localProgress, [0, 0.15], [1, 0]);
    const cardContentOpacity = useTransform(localProgress, [0.1, 0.3], [0, 1]);
    const photoScale = useTransform(localProgress, [0.3, 0.8], [1.15, 1], { ease: easeInOut });
    const textOpacity = useTransform(localProgress, [0.85, 1], [0, 1]);

    useMotionValueEvent(localProgress, "change", (latest) => {
        if (latest > 0.85 && !isTextAnimated) {
            setIsTextAnimated(true);
        }
    });

    // 4. Background Color Transition (Smoothing the exit)
    const cardBg = useTransform(
        localProgress,
        [0.8, 1],
        ["#EBEBEB", "#FFFFFF"]
    );
    const cardBgDark = useTransform(
        localProgress,
        [0.8, 1],
        ["#18181b", "#000000"]
    );

    const { resolvedTheme } = useTheme();
    const cardBgValue = resolvedTheme === 'dark' ? cardBgDark : cardBg;

    // Dynamic vault frame gradients that always match the card's transitioning background
    const vaultGradientDown = useTransform(cardBgValue, (color: string) => {
        const hex = color.replace('#', '');
        return `linear-gradient(to bottom, #${hex}, #${hex}00)`;
    });
    const vaultGradientUp = useTransform(cardBgValue, (color: string) => {
        const hex = color.replace('#', '');
        return `linear-gradient(to top, #${hex}, #${hex}00)`;
    });

    const marqueeItems = [
        <span key="1" className="text-[10rem] md:text-[16rem] font-black uppercase tracking-tighter mx-12 text-black dark:text-white leading-none">
            {portfolioData.personal.title}
        </span>,
        <div key="icon" className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-[#D1FF4D] flex items-center justify-center mx-12">
            <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-32 md:h-32 fill-black dark:fill-zinc-900">
                <path d="M50 0 C60 30 100 40 100 50 C100 60 60 70 50 100 C40 70 0 60 0 50 C0 40 40 30 50 0" />
            </svg>
        </div>
    ];

    return (
        <div className={compact
            ? "relative w-full flex flex-col items-center overflow-hidden bg-background dark:bg-black"
            : "relative w-screen h-full flex flex-col items-center justify-center overflow-hidden bg-background dark:bg-black"}>
            {/* Phase 0: The Lead-in UI (Visible before card scales) */}
            {!compact && (<motion.div
                style={{ opacity: phase0Opacity }}
                className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none -translate-y-12"
            >
                {/* Center Unified Action - Magnetic Group */}
                <div className="mb-16 pointer-events-auto">
                    <MagneticEffect>
                        <div className="group flex items-center gap-2 cursor-pointer">
                            <div className="relative px-10 py-5 rounded-full bg-black dark:bg-white group-hover:bg-[#c1e44a] dark:group-hover:bg-[#c1e44a] overflow-hidden transition-all duration-500 shadow-lg group-hover:shadow-[0_0_30px_rgba(193,228,74,0.3)]">
                                <div className="relative z-10 h-7 overflow-hidden">
                                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1/2">
                                        <span className="text-white dark:text-black group-hover:text-black font-bold text-xl leading-7 transition-colors duration-500">
                                            {t("leadIn.aboutMe")}
                                        </span>
                                        <span className="text-black font-bold text-xl leading-7 transition-colors duration-500">
                                            {t("leadIn.aboutMe")}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative w-16 h-16 rounded-full bg-black dark:bg-white group-hover:bg-[#c1e44a] dark:group-hover:bg-[#c1e44a] overflow-hidden flex items-center justify-center transition-all duration-500 shadow-lg">
                                <div className="relative z-10 h-8 overflow-hidden">
                                    <div className="flex flex-col transition-transform duration-500 ease-out group-hover:-translate-y-1/2">
                                        <ArrowUpRight className="w-8 h-8 text-white dark:text-black group-hover:text-black transition-colors duration-500" />
                                        <ArrowUpRight className="w-8 h-8 text-black transition-colors duration-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </MagneticEffect>
                </div>

                {/* Unified Bottom Labels Layer */}
                <div className="w-full max-w-[1200px] flex items-center justify-between px-12">
                    <div className="flex items-center gap-3 text-zinc-500 dark:text-white/60 text-sm font-medium tracking-tight">
                        <motion.span
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-4 h-4 flex items-center justify-center"
                        >
                            ↓
                        </motion.span>
                        <span>{t("leadIn.scroll")}</span>
                    </div>

                    <div className="text-zinc-500 dark:text-white/60 text-sm font-medium tracking-tight">
                        {t("leadIn.shortStory")}
                    </div>
                </div>
            </motion.div>)}

            {/* The Main Card Container */}
            <motion.div
                style={compact ? undefined : {
                    scale: cardScale,
                    y: cardY,
                    borderRadius: cardBorderRadius,
                    backgroundColor: cardBgValue,
                    willChange: "transform, background-color",
                }}
                className={compact
                    ? "relative w-full flex flex-col overflow-hidden z-10 bg-white dark:bg-black"
                    : "relative w-full h-full flex flex-col overflow-hidden origin-bottom z-10"}
            >
                {/* Unified Scrolling Content Wrapper */}
                <motion.div
                    style={compact ? undefined : { y: contentY }}
                    className="relative w-full flex flex-col items-center"
                >
                    {/* Phase 1: Marquee Header (Top of the long card) */}
                    <div className={cn("w-full flex items-center justify-center flex-shrink-0", compact ? "py-16" : "h-screen")}>
                        <motion.div style={compact ? undefined : { opacity: cardContentOpacity }} className="w-full">
                            <InfiniteMarquee
                                items={marqueeItems}
                                speed={18}
                                className="w-full"
                                itemClassName="py-12"
                            />
                        </motion.div>
                    </div>

                    {/* Phase 2: The Large Portrait (The "Explore" area) */}
                    <div className={cn("relative w-full flex flex-col items-center flex-shrink-0 px-4 md:px-10 lg:px-20", compact ? "h-[85svh] max-lg:landscape:h-[100svh]" : "h-[100vh]")}>
                        {/* Sizing wrapper - not clipped */}
                        <div
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            className="relative w-full h-full max-w-[1500px] group/photo cursor-pointer"
                        >
                            {/* Image area - THIS is what clips. Vault frame is OUTSIDE this. */}
                            <div className="absolute inset-0 overflow-hidden">
                                <motion.div
                                    style={compact ? undefined : {
                                        scale: photoScale,
                                    }}
                                    // Compact: the zoom-out plays once when the portrait scrolls into view
                                    initial={compact ? { scale: 1.15 } : undefined}
                                    whileInView={compact ? { scale: 1 } : undefined}
                                    viewport={{ once: true, amount: 0.3 }}
                                    animate={{
                                        filter: isHovered ? "grayscale(0%) contrast(1)" : "grayscale(100%) contrast(1.1)",
                                    }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="relative w-full h-full"
                                >
                                    <div className="absolute inset-0">
                                        {/* Parallax wrapper */}
                                        <div className="absolute w-[calc(100%+100px)] h-[130vh] -top-[15vh] -left-[50px]">
                                            <motion.div 
                                                className="relative h-full w-full" 
                                                style={compact ? undefined : { y: imageParallaxY }}
                                            >
                                                <Image
                                                    src={portfolioData.personal.avatarWide ?? portfolioData.personal.avatar}
                                                    alt="Profile"
                                                    fill
                                                    className="object-cover object-[25%_center] grayscale-0"
                                                    sizes="(max-width: 768px) 400vw, 100vw"
                                                    priority
                                                />
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Vault frame - OUTSIDE overflow-hidden, extends 1px beyond clip edge to cover it */}
                            <div className="absolute inset-0 pointer-events-none z-20">
                                {/* Top bar: -top-px + h-[52px] covers the clip edge by 1px */}
                                <motion.div style={compact ? undefined : { backgroundColor: cardBgValue }} className={cn("absolute -top-px left-0 w-full h-[52px]", compact && "bg-white dark:bg-black")} />
                                <motion.div style={compact ? undefined : { background: vaultGradientDown }} className={cn("absolute top-[50px] left-0 w-full h-32", compact && "bg-gradient-to-b from-white to-white/0 dark:from-black dark:to-black/0")} />
                                
                                {/* Bottom bar: -bottom-px + h-[52px] covers the clip edge by 1px */}
                                <motion.div style={compact ? undefined : { backgroundColor: cardBgValue }} className={cn("absolute -bottom-px left-0 w-full h-[52px]", compact && "bg-white dark:bg-black")} />
                                <motion.div style={compact ? undefined : { background: vaultGradientUp }} className={cn("absolute bottom-[50px] left-0 w-full h-32", compact && "bg-gradient-to-t from-white to-white/0 dark:from-black dark:to-black/0")} />
                            </div>
                        </div>
                    </div>

                    {/* Phase 3: Final Layout Text */}
                    <motion.div
                        ref={textRef}
                        style={compact ? undefined : { opacity: textOpacity }}
                        className="w-full max-w-[1700px] mx-auto px-8 md:px-16 lg:px-24 pt-24 pb-8 md:pt-32 md:pb-12 flex-shrink-0"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-start">
                            {/* Header Left */}
                            <div className="md:col-span-7">
                                <h3
                                    className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-snug text-black dark:text-white"
                                    dangerouslySetInnerHTML={{ __html: t.raw("profile.title") }}
                                />
                            </div>

                            {/* Paragraph Right */}
                            <div className="md:col-span-5 pt-1">
                                <p className="text-[13px] md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                                    <BlurInUpText 
                                        text={`${t("profile.narrative")} ${t("profile.narrative2")}`} 
                                        animate={textAnimated} 
                                    />
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Phase 4: Tech Stack & Tools Scrollers */}
                    <motion.div
                        style={compact ? undefined : { opacity: textOpacity }}
                        className="w-full max-w-[1700px] mx-auto py-20 flex flex-col gap-8 flex-shrink-0"
                    >
                        <div className="px-8 md:px-16 lg:px-24 mb-6">
                            <h4 className="text-lg md:text-xl uppercase tracking-[0.15em] font-bold text-zinc-500 dark:text-zinc-400">
                                Tech Stack & Ecosystem
                            </h4>
                        </div>
                        <BrandScroller />
                        <BrandScrollerReverse />
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};
