'use client';

import { useEffect } from 'react';

/**
 * Pauses every endlessly repeating animation (CSS marquees/spins/shimmer/pulse, and Framer Motion
 * loops that run as Web Animations) while its element is off-screen or the tab is hidden, and
 * resumes it from the same point when it comes back. Nothing changes visually: the paused
 * animations are ones nobody can see. On phones this removes most of the background work (and the
 * constant re-compositing every running animation causes) that made pages heat up and stutter.
 *
 * One-off animations (reveals, transitions) are never touched.
 */
export function OffscreenAnimationPauser() {
    useEffect(() => {
        if (
            typeof IntersectionObserver === 'undefined' ||
            typeof document.getAnimations !== 'function'
        ) {
            return;
        }

        const tracked = new Map<Element, Set<Animation>>();
        const onScreen = new Map<Element, boolean>();
        let pageVisible = document.visibilityState !== 'hidden';

        const apply = (el: Element) => {
            const run = pageVisible && onScreen.get(el) !== false;
            for (const anim of tracked.get(el) ?? []) {
                try {
                    if (run && anim.playState === 'paused') anim.play();
                    else if (!run && anim.playState === 'running') anim.pause();
                } catch {
                    // animation was cancelled in the meantime
                }
            }
        };

        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    onScreen.set(entry.target, entry.isIntersecting);
                    apply(entry.target);
                }
            },
            { rootMargin: '100px' }
        );

        const scan = () => {
            for (const anim of document.getAnimations()) {
                const effect = anim.effect as KeyframeEffect | null;
                if (!effect || effect.getTiming().iterations !== Infinity) continue;
                const el = effect.target;
                if (!el || !el.isConnected) continue;
                let set = tracked.get(el);
                if (!set) {
                    set = new Set();
                    tracked.set(el, set);
                    io.observe(el);
                }
                if (!set.has(anim)) {
                    set.add(anim);
                    apply(el);
                }
            }
            for (const [el, set] of tracked) {
                if (!el.isConnected) {
                    io.unobserve(el);
                    tracked.delete(el);
                    onScreen.delete(el);
                } else {
                    for (const anim of set) if (anim.playState === 'idle') set.delete(anim);
                }
            }
        };

        // New animated elements appear as sections mount and pages change: rescan shortly after DOM changes
        let timer: ReturnType<typeof setTimeout> | undefined;
        const scheduleScan = () => {
            clearTimeout(timer);
            timer = setTimeout(scan, 300);
        };
        const mo = new MutationObserver(scheduleScan);
        mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

        const onVisibility = () => {
            pageVisible = document.visibilityState !== 'hidden';
            for (const el of tracked.keys()) apply(el);
        };
        document.addEventListener('visibilitychange', onVisibility);

        scan();

        return () => {
            clearTimeout(timer);
            mo.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            for (const set of tracked.values()) {
                for (const anim of set) {
                    try {
                        if (anim.playState === 'paused') anim.play();
                    } catch {
                        // ignore
                    }
                }
            }
        };
    }, []);

    return null;
}
