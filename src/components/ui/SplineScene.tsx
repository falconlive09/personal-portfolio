'use client';

import { useRef, useState, useEffect, type FC } from "react";
import { usePerformance } from "@/hooks/usePerformance";
import { useShouldAnimate } from "@/hooks/useShouldAnimate";
import Spline from '@splinetool/react-spline';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';

interface SplineSceneProps {
    scene: string;
    className?: string;
    /** Still image of the scene: shown while the 3D scene loads on phones/tablets, and instead of it on low-power devices */
    poster?: string;
}

/** Median requestAnimationFrame interval (ms) over `duration` ms. iOS Low Power Mode and weak devices run at ~30fps (≈33ms). */
const medianFrameInterval = (duration: number) =>
    new Promise<number>((resolve) => {
        const deltas: number[] = [];
        let last = 0;
        const start = performance.now();
        const tick = (t: number) => {
            if (last) deltas.push(t - last);
            last = t;
            if (t - start < duration) requestAnimationFrame(tick);
            else {
                deltas.sort((a, b) => a - b);
                resolve(deltas.length ? deltas[Math.floor(deltas.length / 2)] : Infinity);
            }
        };
        requestAnimationFrame(tick);
    });

/**
 * Can this phone/tablet render the WebGL scene comfortably? Falls back to the still image when the
 * user asked for less motion or data, the battery is low, WebGL is missing, or the device is
 * throttled/slow (which is how iOS Low Power Mode shows up to a web page).
 */
async function canRun3DScene(): Promise<boolean> {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    const nav = navigator as Navigator & {
        connection?: { saveData?: boolean };
        deviceMemory?: number;
        getBattery?: () => Promise<{ charging: boolean; level: number }>;
    };
    if (nav.connection?.saveData) return false;
    if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 3) return false;
    if (nav.hardwareConcurrency && nav.hardwareConcurrency < 4) return false;
    try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
        if (!gl) return false;
        gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
        return false;
    }
    if (nav.getBattery) {
        try {
            const battery = await nav.getBattery();
            if (!battery.charging && battery.level < 0.2) return false;
        } catch { /* not available */ }
    }
    // Let the page settle first so page-load work doesn't skew the measurement
    if (document.readyState !== "complete") {
        await new Promise<void>((r) => window.addEventListener("load", () => r(), { once: true }));
    }
    await new Promise((r) => setTimeout(r, 300));
    return (await medianFrameInterval(600)) < 22; // ≥ ~45fps
}

export const SplineScene: FC<SplineSceneProps> = ({ scene, className, poster }) => {
    const isMounted = useRef(true);
    const { isLowPowerMode } = usePerformance(); // phones & tablets (and SSR, until mounted)
    const [canRun3D, setCanRun3D] = useState<boolean | null>(null);
    // Desktop always gets the 3D scene. Phones/tablets get it when capable; the still image otherwise.
    const showStatic = isLowPowerMode && canRun3D !== true;
    const [isSceneLoaded, setIsSceneLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const splineApp = useRef<any>(null);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        canRun3DScene()
            .then((ok) => { if (!cancelled) setCanRun3D(ok); })
            .catch(() => { if (!cancelled) setCanRun3D(false); });
        return () => { cancelled = true; };
    }, []);

    // Pause the WebGL engine while the scene is off-screen or the tab is hidden. Re-applied once the
    // scene loads, since it can finish loading after the user has already scrolled past it.
    const active = useShouldAnimate(containerRef);
    useEffect(() => {
        setIsVisible(active);
        const app = splineApp.current;
        if (!app) return;
        try {
            if (active) app.play();
            else app.stop();
        } catch {
            // older runtimes without play/stop
        }
    }, [active, isSceneLoaded]);

    // Fallback timer just in case onLoad fails
    useEffect(() => {
        if (showStatic) return;
        const timeoutId = setTimeout(() => {
            if (isMounted.current && !isSceneLoaded) {
                setIsSceneLoaded(true);
            }
        }, 8000);
        return () => clearTimeout(timeoutId);
    }, [showStatic, isSceneLoaded]);

    if (showStatic) {
        return (
            <div className={`relative w-full h-full bg-background overflow-hidden ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-primary/10 blur-[100px] rounded-full animate-pulse-slow" />
                </div>
                {poster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={poster}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 pt-20 w-full h-full object-contain object-center select-none pointer-events-none"
                        draggable={false}
                    />
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className || ''}`}>

            {/* Global style to hide the react-spline watermark (not in shadow DOM) */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .spline-watermark,
                div[style*="bottom: 16px"],
                div[style*="bottom: 10px"],
                a[href*="spline.design"] {
                    display: none !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                    visibility: hidden !important;
                }
            `}} />

            <div className="w-full h-full pt-20 relative">

                {/* Custom Cinematic Loading State */}
                {!isSceneLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-transparent">
                    </div>
                )}

                {/* Phones/tablets: keep the still image up until the 3D scene is ready */}
                {poster && isLowPowerMode && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={poster}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 pt-20 w-full h-full object-contain object-center select-none pointer-events-none transition-opacity duration-1000"
                        style={{ opacity: isSceneLoaded ? 0 : 1 }}
                        draggable={false}
                    />
                )}

                <div
                    className={
                        isLowPowerMode
                            // Phones/tablets: canvas ignores touches so swipes always scroll the page. In portrait the
                            // scene would size itself to the tall screen and crop the robot, so render it in a wide
                            // desktop-shaped (16:9) box centred on the screen instead — same framing as the still image.
                            ? "w-full h-full transition-opacity duration-1000 pointer-events-none max-lg:portrait:absolute max-lg:portrait:left-1/2 max-lg:portrait:top-[calc(50%+40px)] max-lg:portrait:w-[195vw] max-lg:portrait:h-[111vw] max-lg:portrait:-translate-x-1/2 max-lg:portrait:-translate-y-1/2"
                            : "w-full h-full transition-opacity duration-1000"
                    }
                    style={{
                        opacity: isSceneLoaded ? 1 : 0,
                        visibility: isVisible ? 'visible' : 'hidden'
                    }}
                >
                    <WebGLErrorBoundary fallback={poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={poster} alt="" aria-hidden="true" className="w-full h-full object-contain object-center select-none pointer-events-none" draggable={false} />
                    ) : null}>
                    <Spline
                        scene={scene}
                        onLoad={(app) => {
                            splineApp.current = app;
                            if (isMounted.current) setIsSceneLoaded(true);
                        }}
                        style={{
                            width: '100%',
                            height: '100%',
                            transform: 'scale(1.2)',
                            transformOrigin: 'center center'
                        }}
                    />
                    </WebGLErrorBoundary>
                </div>
            </div>
        </div>
    );
};
