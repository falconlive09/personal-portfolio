"use client";

import { useEffect, useRef, useCallback, type FC, useMemo, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import Image from "next/image";
import { usePerformance } from "@/hooks/usePerformance";
import { ChevronDown } from "lucide-react";
import { portfolioData } from "@/data/portfolio";

interface ImageItem {
    id: string;
    src: string;
    alt: string;
    isPdf: boolean;
}

interface Position {
    top: number;
    left: number;
    width: number;
    height: number;
    borderRadius: number;
    zIndex?: number;
}

interface Positions {
    initial: Record<string, Position>;
    final: Record<string, Position>;
}

interface CertificateHeroScrollProps {
    onDownloadClick?: () => void;
    isLowPowerMode?: boolean;
}

// Certificate images come from the achievements in src/data/portfolio.ts (up to 6 are shown).
const MAX_CERTS = 6;
const CERT_ASPECT = 1.38; // certificates are landscape, roughly 1.3–1.4 : 1

// Scattered starting spots (fractions of the viewport). With 3 or fewer certificates the
// spread-out spots 0, 2 and 4 are used so they cover the screen evenly.
const SCATTER_LANDSCAPE = [
    { top: 0.15, left: 0.05, w: 0.22 }, { top: 0.12, left: 0.38, w: 0.2 }, { top: 0.18, left: 0.72, w: 0.22 },
    { top: 0.68, left: 0.08, w: 0.2 }, { top: 0.72, left: 0.42, w: 0.2 }, { top: 0.64, left: 0.75, w: 0.18 },
];
const SCATTER_PORTRAIT = [
    { top: 0.12, left: 0.04, w: 0.46 }, { top: 0.1, left: 0.52, w: 0.44 }, { top: 0.66, left: 0.06, w: 0.46 },
    { top: 0.7, left: 0.5, w: 0.46 }, { top: 0.72, left: 0.28, w: 0.44 }, { top: 0.14, left: 0.3, w: 0.42 },
];
const SPREAD_SPOTS = [0, 2, 4];

const CertificateHeroScroll: FC<CertificateHeroScrollProps> = ({ onDownloadClick, isLowPowerMode: isLowPowerModeProp }) => {
    const spacerRef = useRef<HTMLDivElement>(null);
    const fixedContainerRef = useRef<HTMLDivElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
    const { isLowPowerMode: performanceLowPower } = usePerformance();
    const isLowPowerMode = isLowPowerModeProp ?? performanceLowPower;

    const randomCertificates = useMemo<ImageItem[]>(() =>
        portfolioData.achievements
            .filter((a) => a.image)
            .slice(0, MAX_CERTS)
            .map((a) => ({ id: a.id, src: a.image as string, alt: a.title, isPdf: /\.pdf$/i.test(a.image as string) })),
    []);


    // Re-run the layout when the screen is rotated or resized (ignore iOS toolbar height changes)
    const [layoutKey, setLayoutKey] = useState(0);
    useEffect(() => {
        let lastW = window.innerWidth;
        const onResize = () => {
            if (window.innerWidth !== lastW) { lastW = window.innerWidth; setLayoutKey((k) => k + 1); }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const getPositions = useCallback((): Positions => {
        const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
        const vh = typeof window !== "undefined" ? window.innerHeight : 1080;
        const n = randomCertificates.length;
        const portrait = vh > vw; // phones held upright stack the certificates; everything else lays them out in a row
        const key = (i: number) => `cert${i + 1}`;

        // Start: certificates scattered around the title
        const scatter = portrait ? SCATTER_PORTRAIT : SCATTER_LANDSCAPE;
        const initial: Record<string, Position> = {};
        for (let i = 0; i < n; i++) {
            const spot = scatter[n <= 3 ? SPREAD_SPOTS[i] : i];
            const width = vw * spot.w;
            initial[key(i)] = { top: vh * spot.top, left: vw * spot.left, width, height: width / CERT_ASPECT, borderRadius: portrait ? 8 : 12, zIndex: 1 };
        }

        // End: a tidy grid sized to fit the screen below the navbar
        const cols = portrait ? (n <= 3 ? 1 : 2) : Math.min(n, 3);
        const rows = Math.ceil(n / cols);
        const gap = portrait ? 12 : 16;
        const top = portrait ? 80 : Math.max(70, vh * 0.12);
        const availW = Math.min(vw * (portrait ? 0.88 : 0.85), 1400);
        const availH = vh - top - (portrait ? 24 : vh * 0.08);
        const cellW = Math.min((availW - (cols - 1) * gap) / cols, ((availH - (rows - 1) * gap) / rows) * CERT_ASPECT);
        const cellH = cellW / CERT_ASPECT;
        const gridW = cols * cellW + (cols - 1) * gap;
        const gridH = rows * cellH + (rows - 1) * gap;
        const startX = (vw - gridW) / 2;
        const startY = top + (availH - gridH) / 2;
        const final: Record<string, Position> = {};
        for (let i = 0; i < n; i++) {
            const r = Math.floor(i / cols), c = i % cols;
            const inRow = Math.min(cols, n - r * cols); // centre a short last row
            const rowOffset = ((cols - inRow) * (cellW + gap)) / 2;
            final[key(i)] = { top: startY + r * (cellH + gap), left: startX + rowOffset + c * (cellW + gap), width: cellW, height: cellH, borderRadius: 8, zIndex: 10 };
        }

        return { initial, final };
    }, [randomCertificates.length]);

    useEffect(() => {
        if (typeof window === "undefined" || randomCertificates.length === 0) return;

        gsap.registerPlugin(ScrollTrigger);

        const { initial, final } = getPositions();
        const imageElements = imageRefs.current.filter((el): el is HTMLDivElement => el !== null);

        const ctx = gsap.context(() => {
            imageElements.forEach((img, index) => {
                const pos = initial[`cert${index + 1}`];
                if (pos) {
                    gsap.set(img, {
                        top: pos.top,
                        left: pos.left,
                        width: pos.width,
                        height: pos.height,
                        borderRadius: pos.borderRadius,
                        zIndex: pos.zIndex,
                        scale: 0.8,
                        rotate: index % 2 === 0 ? -5 : 5,
                        opacity: 0,
                    });
                }
            });

            gsap.to(imageElements, {
                opacity: 0.8,
                scale: 1,
                duration: isLowPowerMode ? 0.6 : 1.2,
                stagger: isLowPowerMode ? 0.05 : 0.1,
                ease: "power2.out",
            });

            const mainTL = gsap.timeline({
                scrollTrigger: {
                    trigger: spacerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: isLowPowerMode ? 0.2 : 0.5, // Faster responding scrub
                },
            });

            if (heroContentRef.current) {
                mainTL.to(heroContentRef.current, { autoAlpha: 0, scale: 0.9, duration: 0.2 }, 0);
            }

            imageElements.forEach((img, index) => {
                const finalPos = final[`cert${index + 1}`];
                const initialPos = initial[`cert${index + 1}`];

                if (finalPos && initialPos) {
                    mainTL.fromTo(
                        img,
                        {
                            top: initialPos.top,
                            left: initialPos.left,
                            width: initialPos.width,
                            height: initialPos.height,
                            borderRadius: initialPos.borderRadius,
                            rotate: index % 2 === 0 ? -5 : 5,
                            opacity: 0.8,
                            scale: 1,
                            zIndex: initialPos.zIndex,
                        },
                        {
                            top: finalPos.top,
                            left: finalPos.left,
                            width: finalPos.width,
                            height: finalPos.height,
                            borderRadius: finalPos.borderRadius,
                            opacity: 1,
                            rotate: 0,
                            scale: 1,
                            zIndex: finalPos.zIndex,
                            duration: 1,
                            ease: "power2.inOut",
                            immediateRender: false
                        },
                        0
                    );
                }
            });


            // Add a buffer/pause at the end of the timeline
            // This ensures the animation finishes BEFORE the user scrolls past the spacer,
            // allowing them to see the final grid layout for a moment.
            // Timeline Total Duration becomes ~2.0 (1.0 for animation + 1.0 buffer)
            // So the animation completes at 1/2.0 = 50% of the scroll distance.
            mainTL.to({}, { duration: 1.0 });

        }, spacerRef);

        // FADE OUT HERO when scrolling past the component
        ScrollTrigger.create({
            trigger: spacerRef.current,
            start: "bottom top", // when bottom of spacer hits top of viewport
            onEnter: () => {
                if (fixedContainerRef.current) gsap.to(fixedContainerRef.current, { autoAlpha: 0, duration: 0.5 });
            },
            onLeaveBack: () => {
                if (fixedContainerRef.current) gsap.to(fixedContainerRef.current, { autoAlpha: 1, duration: 0.5 });
            },
            toggleActions: "play none none reverse"
        });

        return () => ctx.revert();
    }, [getPositions, randomCertificates, isLowPowerMode, layoutKey]);

    return (
        <>
            {/* SPACER: Takes up space in the document flow to allow scrolling */}
            <div ref={spacerRef} className="h-[350vh] w-full relative z-10 pointer-events-none" />

            {/* FIXED HERO: Stays behind content. z-10 ensures it sits ABOVE particles (z-0), but transparent to see them. */}
            <div ref={fixedContainerRef} className="fixed inset-0 z-10 h-screen w-full overflow-hidden bg-transparent pointer-events-none">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-[600px] h-[600px] bg-primary/10 blur-[80px] rounded-full" />
                    <div className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-secondary/10 blur-[80px] rounded-full" />
                </div>

                {/* Content */}
                <div
                    ref={heroContentRef}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-50 pt-10 pb-32"
                >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/50 backdrop-blur-md border border-border/50 text-xs font-medium mb-6 animate-fade-in-up">
                        Professional Milestones
                    </div>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/50 animate-fade-in-up delay-100">
                        Certificates<br />& Awards
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in-up delay-200">
                        A visual journey through certifications and achievements.
                    </p>
                    <button
                        onClick={() => window.scrollTo({ top: window.innerHeight * 1.2, behavior: 'smooth' })}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all group animate-fade-in-up delay-300 pointer-events-auto"
                    >
                        <span>Scroll to Explore</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                    </button>
                </div>

                {/* Images */}
                {randomCertificates.map((cert, index) => (
                    <div
                        key={`${cert.id}-${index}`}
                        ref={(el) => {
                            imageRefs.current[index] = el;
                        }}
                        className="absolute w-[10px] h-[10px] opacity-0 overflow-hidden shadow-2xl border border-border/20 bg-card rounded-lg"
                        style={{
                            willChange: "transform, opacity", // Optimized will-change
                            zIndex: 1 // Base z-index
                        }}
                    >
                        {cert.isPdf ? (
                            <div className="relative w-full h-full bg-white">
                                <iframe
                                    src={`${cert.src}#toolbar=0&navpanes=0&scrollbar=0&view=Fit`}
                                    className="w-full h-full object-cover opacity-90 pointer-events-none"
                                    title={cert.alt}
                                    loading="lazy"
                                />
                                {/* Overlay to ensure no interaction */}
                                <div className="absolute inset-0 bg-transparent z-10" />
                            </div>
                        ) : (
                            <>
                                <Image
                                    src={cert.src}
                                    alt={cert.alt}
                                    fill
                                    priority={index < 2} // Priority loading for first few
                                    sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover opacity-90 hover:opacity-100 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />
                            </>
                        )}
                    </div>
                ))}
            </div>
        </>
    );
};

export default CertificateHeroScroll;
