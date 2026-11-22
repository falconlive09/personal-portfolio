'use client';

import { RefObject, useEffect, useRef, useState } from 'react';

/**
 * Calls `onChange(active)` whenever `el` comes within `rootMargin` of the screen or leaves it, or the
 * tab is hidden/shown. "Active" = near the viewport AND the tab is visible. For render loops that
 * aren't React components (classes, raw requestAnimationFrame). Returns a cleanup function.
 */
export function watchActive(el: Element, onChange: (active: boolean) => void, rootMargin = '200px') {
    let inView: boolean | null = null; // unknown until the observer's first report
    let visible = typeof document === 'undefined' ? true : document.visibilityState !== 'hidden';
    let last: boolean | null = null;
    const emit = () => {
        if (inView === null) return;
        const active = inView && visible;
        if (active !== last) {
            last = active;
            onChange(active);
        }
    };
    const io = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        emit();
    }, { rootMargin });
    io.observe(el);
    const onVisibility = () => {
        visible = document.visibilityState !== 'hidden';
        emit();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
        io.disconnect();
        document.removeEventListener('visibilitychange', onVisibility);
    };
}

/**
 * True while the element is on (or within `rootMargin` of) the screen and the tab is visible.
 * Use it to pause animation/render loops nobody can see. `initial` is returned until the first
 * measurement (default `true`, so a loop renders its first frame); pass `false` to gate loading.
 */
export function useShouldAnimate(ref: RefObject<Element | null>, rootMargin = '200px', initial = true) {
    const [active, setActive] = useState(initial);
    const watched = useRef<Element | null>(null);
    const stop = useRef<(() => void) | null>(null);
    // Re-checked after every render (a cheap comparison) because the element can mount later,
    // e.g. in a branch that only renders once a feature is enabled.
    useEffect(() => {
        const el = ref.current;
        if (el === watched.current) return;
        stop.current?.();
        watched.current = el;
        stop.current = el ? watchActive(el, setActive, rootMargin) : null;
    });
    // Reset fully on unmount: React's development Strict Mode unmounts and remounts every component
    // once, and the remount must attach a fresh observer (otherwise `active` stays stuck at `initial`).
    useEffect(() => () => {
        stop.current?.();
        stop.current = null;
        watched.current = null;
    }, []);
    return active;
}
