// ReactLenis removed - using global provider
import {
    motion,
    useMotionTemplate,
    useScroll,
    useTransform,
    useSpring,
    useMotionValue,
    MotionValue,
} from "framer-motion";
import { useEffect } from "react";
import Image from "next/image";
import { usePerformance } from "@/hooks/usePerformance";

export const SmoothScrollHero = () => {
    const { isLowPowerMode } = usePerformance();
    return (
        <div className="bg-background text-zinc-900 dark:text-zinc-50 relative z-0 overflow-x-clip">
            <Hero isLowPowerMode={isLowPowerMode} />
        </div>
    );
};

const SECTION_HEIGHT = 1500;

const Hero = ({ isLowPowerMode }: { isLowPowerMode: boolean }) => {
    const { scrollY } = useScroll();

    // Simplify physics for low power mode
    const smoothScrollY = useSpring(scrollY, isLowPowerMode ? {
        stiffness: 50,
        damping: 30
    } : {
        mass: 0.1,
        stiffness: 100,
        damping: 20
    });

    return (
        <div
            style={{ height: `calc(${SECTION_HEIGHT}px + 100vh)` }}
            className="relative w-full"
        >
            <CenterImage scrollY={smoothScrollY} />

            <ParallaxImages scrollY={smoothScrollY} />

            <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-b from-transparent to-background z-20 pointer-events-none" />

            <motion.div
                className="fixed bottom-6 left-1/2 -translate-x-[65%] z-50 hidden md:flex flex-col items-center gap-2 cursor-pointer pointer-events-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                onClick={() => {
                    document.getElementById("launch-schedule")?.scrollIntoView({
                        behavior: "smooth",
                    });
                }}
            >
            </motion.div>
        </div>
    );
};

const CenterImage = ({ scrollY }: { scrollY: MotionValue<number> }) => {
    // Animation: Scale from 50% to 100%. Portrait phones start bigger so the photo backs the
    // (taller) title panel and fills the screen like the desktop composition does.
    const startScale = useMotionValue(0.5);
    useEffect(() => {
        const mq = window.matchMedia("(max-width: 1023px) and (orientation: portrait)");
        const update = () => startScale.set(mq.matches ? 0.78 : 0.5);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [startScale]);
    const scale = useTransform([scrollY, startScale], ([y, s]: number[]) =>
        s + (1 - s) * Math.min(Math.max(y / SECTION_HEIGHT, 0), 1)
    );
    const borderRadius = useTransform(scrollY, [0, SECTION_HEIGHT], [24, 0]);
    // Fade out LATER, ensuring it stays as a backdrop for the Timeline entry
    const opacity = useTransform(
        scrollY,
        [SECTION_HEIGHT + 1000, SECTION_HEIGHT + 1600],
        [1, 0]
    );

    // Text specific animations
    const textOpacity = useTransform(scrollY, [0, 200], [1, 0]);
    const textScale = useTransform(scrollY, [0, 200], [1, 1.1]);
    const textY = useTransform(scrollY, [0, 200], [0, 50]);

    const subtitleOpacity = useTransform(scrollY, [0, 150], [1, 0]);
    const subtitleY = useTransform(scrollY, [0, 150], [0, 20]);

    return (
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-0">
            <motion.div
                style={{ scale, borderRadius, opacity }}
                className="w-full h-full shadow-2xl relative origin-center overflow-hidden"
            >
                {/* Portrait photo: framed on the face + NPCI sign for each screen shape */}
                <Image
                    src="/experience/npci.webp"
                    alt="Neal at the NPCI booth"
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 100vw"
                    className="object-cover object-[50%_38%] max-lg:portrait:object-[28%_50%] max-lg:landscape:object-[50%_32%]"
                />
                <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            {/* Title Overlay - 'READ DETAIL' Style Glassmorphism */}
            <div className="absolute inset-0 flex items-center justify-center z-10 px-4 max-lg:px-0">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    style={{
                        opacity: textOpacity,
                        scale: textScale,
                        y: textY,
                        maskImage: 'radial-gradient(ellipse 90% 85% at center, black 65%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 90% 85% at center, black 65%, transparent 100%)',
                    }}
                    className="relative group bg-white/50 dark:bg-black/40 backdrop-blur-[80px] px-[clamp(24px,8vw,128px)] py-[clamp(60px,15vh,240px)] rounded-[clamp(2rem,6vw,4rem)] flex flex-col items-center justify-center w-[92vw] max-w-[1600px] max-lg:w-full max-lg:h-full max-lg:rounded-none"
                >
                    {/* Phones/tablets: the glass panel covers the whole screen. iOS Safari doesn't fade a blurred
                        panel's edges like desktop browsers do, so a smaller panel showed up as a hard-edged box. */}
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-primary/2 rounded-[clamp(2rem,6vw,4rem)] pointer-events-none" />

                    <h1 className="text-[clamp(3.5rem,15vw,15rem)] font-black text-foreground dark:text-white tracking-[-0.06em] leading-[0.8] uppercase text-center mb-[clamp(24px,4vh,48px)] -ml-2">
                        EXPERIENCE
                    </h1>

                    <p className="w-full max-w-4xl text-center text-[clamp(10px,1.2vw,14px)] font-bold text-foreground/50 dark:text-white/50 tracking-[clamp(0.1em,0.4em,0.4em)] leading-relaxed md:leading-[2.2] uppercase">
                        Merging technical precision with creative vision.
                        <br className="hidden md:block" />
                        A curated timeline of my professional journey, from foundational code to distributed systems at scale.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

// Six photos around the centre image. Desktop keeps its two staggered rows; phones in portrait use
// wider, overlapping columns so each photo stays big enough to see.
const PARALLAX_PHOTOS = [
    { src: "/experience/convocation-award.webp", alt: "Receiving my degree at the MNIT Jaipur convocation", start: 800, end: -1500,
      slot: "row-start-1 col-start-2 col-span-3 max-lg:portrait:col-start-1 max-lg:portrait:col-span-7 max-lg:portrait:mb-[34svh]", img: "aspect-[4/3]" },
    { src: "/experience/convocation.webp", alt: "At the MNIT Jaipur 18th convocation", start: 1000, end: -1500,
      slot: "row-start-1 col-start-10 col-span-3 mb-32 max-lg:portrait:col-start-7 max-lg:portrait:col-span-6 max-lg:portrait:mb-[4svh]", img: "aspect-square object-[50%_30%]" },
    { src: "/experience/mnit-friends.webp", alt: "With friends at MNIT Jaipur", start: 900, end: -1800,
      slot: "row-start-1 col-start-5 col-span-4 mb-10 max-lg:portrait:col-start-2 max-lg:portrait:col-span-10 max-lg:portrait:mb-[64svh]", img: "aspect-video" },
    { src: "/experience/event-sarvam.webp", alt: "Sarvam AI booth at a fintech event", start: 1200, end: -2000,
      slot: "row-start-2 col-start-1 col-span-3 mb-64 max-lg:portrait:col-start-1 max-lg:portrait:col-span-6 max-lg:portrait:mb-[30svh]", img: "aspect-[3/4]" },
    { src: "/experience/event-cashfree.webp", alt: "Cashfree booth at a fintech event", start: 1100, end: -2000,
      slot: "row-start-2 col-start-8 col-span-4 mb-40 max-lg:portrait:col-start-6 max-lg:portrait:col-span-7 max-lg:portrait:mb-[6svh]", img: "aspect-video" },
    { src: "/experience/event-showcase.webp", alt: "Showcase at the event venue", start: 1300, end: -2200,
      slot: "row-start-2 col-start-5 col-span-2 mb-[26rem] max-lg:portrait:col-start-7 max-lg:portrait:col-span-6 max-lg:portrait:mb-[58svh]", img: "aspect-[3/4]" },
];

const ParallaxImages = ({ scrollY }: { scrollY: MotionValue<number> }) => {
    return (
        <div className="mx-auto max-w-7xl px-4 absolute inset-0 z-20 pointer-events-none grid grid-cols-12 gap-4 max-lg:portrait:gap-3 h-full items-end pb-[10vh]">
            {/*
               start={positive} -> Starts BELOW current view.
               end={negative} -> Moves UP past the view.
            */}
            {PARALLAX_PHOTOS.map((photo) => (
                <div key={photo.src} className={photo.slot}>
                    <ParallaxImg
                        scrollY={scrollY}
                        src={photo.src}
                        alt={photo.alt}
                        start={photo.start}
                        end={photo.end}
                        className={`w-full shadow-2xl rounded-2xl border border-white/10 object-cover ${photo.img}`}
                    />
                </div>
            ))}
        </div>
    );
};

const ParallaxImg = ({ className, alt, src, start, end, scrollY }: { className?: string, alt: string, src: string, start: number, end: number, scrollY: MotionValue<number> }) => {
    const opacity = useTransform(scrollY, [0, SECTION_HEIGHT * 1.2], [1, 0]);

    // Scale slightly as they rise
    const scale = useTransform(scrollY, [0, SECTION_HEIGHT], [1, 1.2]);

    // Map global scroll to strictly strictly UPWARD movement
    const y = useTransform(scrollY, [0, SECTION_HEIGHT], [start, end]);

    // Smooth transform
    const transform = useMotionTemplate`translateY(${y}px) scale(${scale})`;

    return (
        <motion.img
            src={src}
            alt={alt}
            className={className}
            style={{ transform, opacity }}
        />
    );
};
