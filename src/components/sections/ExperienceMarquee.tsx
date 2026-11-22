import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity,
    useAnimationFrame,
} from "framer-motion";
import { useShouldAnimate } from '@/hooks/useShouldAnimate';
import Image from "next/image";
import { portfolioData } from "@/data/portfolio";
import { Experience } from "@/types";
import { usePerformance } from "@/hooks/usePerformance";
import { cn } from "@/lib/utils";

interface ParallaxProps {
    children: React.ReactNode;
    baseVelocity: number;
    isLowPowerMode?: boolean;
}

function ParallaxText({ children, baseVelocity = 100, isLowPowerMode = false }: ParallaxProps) {
    const baseX = useMotionValue(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentWidth, setContentWidth] = useState(0);

    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400,
    });

    // Always positive acceleration factor — direction is handled separately
    const velocityFactor = useTransform(smoothVelocity, (latest) => {
        return (Math.abs(latest) / 1000) * 5;
    });

    // Measure actual pixel width of one content copy
    const measure = useCallback(() => {
        if (contentRef.current) {
            setContentWidth(contentRef.current.scrollWidth);
        }
    }, []);

    useEffect(() => {
        measure();
        window.addEventListener("resize", measure);
        // Re-measure after images may have loaded
        const t1 = setTimeout(measure, 300);
        const t2 = setTimeout(measure, 1000);
        return () => {
            window.removeEventListener("resize", measure);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [measure]);

    /**
     * Pixel-based transform with modulo wrapping.
     *
     * baseX accumulates upward continuously. The transform converts it
     * to a translateX value that cycles seamlessly over one content width.
     *
     * - baseVelocity > 0 (row1): logos move LEFT → RIGHT
     *   translateX cycles: -contentWidth → 0 → -contentWidth → 0 ...
     *
     * - baseVelocity < 0 (row2): logos move RIGHT → LEFT
     *   translateX cycles: 0 → -contentWidth → 0 → -contentWidth ...
     */
    const x = useTransform(baseX, (v) => {
        if (contentWidth <= 0) return "0px";
        const mod = ((v % contentWidth) + contentWidth) % contentWidth;

        if (baseVelocity > 0) {
            // Left-to-right: start at -contentWidth, move toward 0
            return `${-contentWidth + mod}px`;
        } else {
            // Right-to-left: start at 0, move toward -contentWidth
            return `${-mod}px`;
        }
    });

    const isHovered = useRef(false);
    // Skip the per-frame work while the marquee is off-screen or the tab is hidden
    const wrapRef = useRef<HTMLDivElement>(null);
    const active = useShouldAnimate(wrapRef);

    useAnimationFrame((_t, delta) => {
        if (isHovered.current || isLowPowerMode || !active) return;

        // Clamp delta to prevent large jumps when returning from background tab
        const clampedDelta = Math.min(delta, 50);

        let moveBy = Math.abs(baseVelocity) * (clampedDelta / 1000);

        const vf = velocityFactor.get();
        if (vf > 0) {
            moveBy += moveBy * vf;
        }

        // Always accumulate forward — direction is handled in the transform
        baseX.set(baseX.get() + moveBy);
    });

    if (isLowPowerMode) {
        return (
            <div className="overflow-hidden whitespace-nowrap w-full py-1">
                <div
                    className={cn(
                        "flex",
                        baseVelocity > 0
                            ? "animate-marquee-reverse"
                            : "animate-marquee"
                    )}
                >
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                    <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={wrapRef}
            className="overflow-hidden whitespace-nowrap w-full py-1"
            onMouseEnter={() => (isHovered.current = true)}
            onMouseLeave={() => (isHovered.current = false)}
        >
            <motion.div
                className="flex"
                style={{ x, willChange: "transform" }}
            >
                {/* First copy — ref attached for measuring pixel width */}
                <div ref={contentRef} className="flex gap-4 shrink-0 pr-4">
                    {children}
                </div>
                <div className="flex gap-4 shrink-0 pr-4">{children}</div>
                <div className="flex gap-4 shrink-0 pr-4">{children}</div>
            </motion.div>
        </div>
    );
}

interface Logo {
    src: string;
    /** Version shown in dark mode (white artwork) when the colour logo is too dark to read on black */
    darkSrc?: string;
    alt: string;
    /** width / height of the (trimmed) logo file */
    aspect: number;
    /** Extra classes, e.g. dark:invert for black-text logos that have no white version */
    className?: string;
}

// Every logo gets roughly the same visual area, so wide wordmarks and square emblems look balanced.
const LOGO_AREA = 9000; // px² on desktop; phones scale it down via --logo-u
const logoHeight = (aspect: number) => Math.min(80, Math.round(Math.sqrt(LOGO_AREA / aspect)));

const GalleryItem = ({ logo }: { logo: Logo }) => {
    const imgClass = "object-contain grayscale hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-300";
    return (
        <div className="relative shrink-0 w-[clamp(140px,30vw,200px)] h-[clamp(80px,15vw,120px)] md:w-[280px] md:h-[160px] [--logo-u:0.62px] md:[--logo-u:1px] flex items-center justify-center group cursor-pointer transition-all duration-300 hover:scale-105">
            <div className="relative" style={{ height: `calc(var(--logo-u) * ${logoHeight(logo.aspect)})`, aspectRatio: logo.aspect }}>
                <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    sizes="200px"
                    priority
                    unoptimized
                    className={cn(imgClass, logo.className, logo.darkSrc && "dark:hidden")}
                />
                {logo.darkSrc && (
                    <Image
                        src={logo.darkSrc}
                        alt=""
                        aria-hidden="true"
                        fill
                        sizes="200px"
                        priority
                        unoptimized
                        className={cn(imgClass, "hidden dark:block")}
                    />
                )}
            </div>
        </div>
    );
};

const LOGOS: Logo[] = [
    { src: "/assets/mnit-logo.webp", alt: "MNIT Jaipur", aspect: 1.01 },
    { src: "/assets/npci-logo.webp", darkSrc: "/assets/npci-logo-white.webp", alt: "NPCI", aspect: 3.26 },
    { src: "/assets/gff2026-logo.webp", darkSrc: "/assets/gff2026-logo-white.webp", alt: "Global Fintech Fest 2026", aspect: 1.85 },
    { src: "/assets/microsoft-logo.webp", alt: "Microsoft", aspect: 4.57 },
    { src: "/assets/google-logo.webp", darkSrc: "/assets/google-logo-white.webp", alt: "Google", aspect: 3.04 },
    { src: "/assets/ieee-logo.webp", darkSrc: "/assets/ieee-logo-white.webp", alt: "IEEE", aspect: 1.78 },
    { src: "/assets/mckinsey-logo.webp", alt: "McKinsey & Company", aspect: 3.23, className: "dark:invert" },
];

export default function ExperienceMarquee() {
    const { isLowPowerMode } = usePerformance();
    // Two rows with different starting logos, so the rows never line up
    const row1 = LOGOS;
    const row2 = [...LOGOS.slice(4), ...LOGOS.slice(0, 4)];

    const ensureLength = (items: Logo[]) => {
        let repeated = [...items];
        while (repeated.length < 12) {
            repeated = [...repeated, ...items];
        }
        return repeated;
    };

    return (
        <section className="py-2 md:py-8 bg-background relative z-10 overflow-hidden">
            {/* Fog/Blur Blending */}
            <div className="absolute top-0 left-0 w-full h-16 md:h-32 bg-gradient-to-b from-background via-background/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-full h-16 md:h-32 bg-gradient-to-t from-background via-background/80 to-transparent z-20 pointer-events-none" />

            <div className="flex flex-col gap-2">
                {/* Row 1: LEFT → RIGHT */}
                <ParallaxText baseVelocity={40} isLowPowerMode={isLowPowerMode}>
                    {ensureLength(row1).map((logo, idx) => (
                        <GalleryItem key={`r1-${idx}`} logo={logo} />
                    ))}
                </ParallaxText>

                {/* Row 2: RIGHT → LEFT */}
                <ParallaxText baseVelocity={-40} isLowPowerMode={isLowPowerMode}>
                    {ensureLength(row2).map((logo, idx) => (
                        <GalleryItem key={`r2-${idx}`} logo={logo} />
                    ))}
                </ParallaxText>
            </div>
        </section>
    );
}
