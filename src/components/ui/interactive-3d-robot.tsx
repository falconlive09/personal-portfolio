'use client';

import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { Application } from '@splinetool/runtime';
import { WebGLErrorBoundary } from './WebGLErrorBoundary';
import { useShouldAnimate } from '@/hooks/useShouldAnimate';
const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

const Spinner = ({ className }: { className?: string }) => (
  <div className={`w-full h-full flex items-center justify-center bg-transparent text-foreground ${className}`}>
    <svg className="animate-spin h-5 w-5 text-current mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
    </svg>
  </div>
);

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  // Pause rendering while off-screen or the tab is hidden
  const active = useShouldAnimate(wrapRef);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const app = appRef.current;
    if (!app) return;
    try {
      if (active) app.play();
      else app.stop();
    } catch {
      // older runtimes without play/stop
    }
  }, [active, loaded]);

  return (
    <div ref={wrapRef} className="w-full h-full">
      {/* Loads with the page (as before): deferring it until the user scrolled near made it load at the
          point of highest memory use, and on a 4 GB iPhone it then failed to appear. */}
      <WebGLErrorBoundary>
          <Suspense fallback={<Spinner className={className} />}>
            <Spline
              scene={scene}
              className={className}
              onLoad={(app) => {
                appRef.current = app;
                setLoaded(true);
              }}
            />
          </Suspense>
      </WebGLErrorBoundary>
    </div>
  );
}
