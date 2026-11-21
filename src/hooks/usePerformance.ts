'use client';
import { useState, useEffect } from 'react';

/**
 * Custom hook to detect performance-constrained environments.
 * - isMobile: < 768px (Phone)
 * - isTablet: 768px - 1024px
 * - isLowPowerMode: Mobile or Tablet or explicitly set.
 */
export function usePerformance() {
    const [hasMounted, setHasMounted] = useState(false);
    const [state, setState] = useState({
        isMobile: false,
        isTablet: false,
        isLowPowerMode: true, // Default to true (safe mode) initially
    });

    useEffect(() => {
        setHasMounted(true);
        const checkPerformance = () => {
            const width = window.innerWidth;
            const isMobile = width < 768;
            const isTablet = width >= 768 && width < 1024;

            const isLowPowerMode = isMobile || isTablet; // avoid heavy 3D/Shaders on mobile & tablet
            // iOS fires 'resize' whenever the address bar shows/hides during scroll. Only update when a
            // value actually changes, so the many components using this hook don't re-render mid-scroll.
            setState(prev =>
                prev.isMobile === isMobile && prev.isTablet === isTablet && prev.isLowPowerMode === isLowPowerMode
                    ? prev
                    : { isMobile, isTablet, isLowPowerMode }
            );
        };

        checkPerformance();
        window.addEventListener('resize', checkPerformance);
        return () => window.removeEventListener('resize', checkPerformance);
    }, []);

    // During SSR and until hydration is complete, return true (safe mode)
    // to prevent any accidental heavy component initialization on mobile.
    if (!hasMounted) {
        return {
            isMobile: false,
            isTablet: false,
            isLowPowerMode: true,
        };
    }


    return state;
}

