'use client';

import { Component, type ReactNode } from 'react';

/**
 * Keeps a failing WebGL scene (Spline or react-three-fiber) from taking down the whole page. If the 3D scene throws
 * (no WebGL, too many WebGL contexts on iOS, network failure loading the scene, ...), only this
 * part is replaced by `fallback`; the rest of the page keeps working.
 */
export class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        console.warn('[3D scene unavailable, showing fallback]', error instanceof Error ? error.message : error);
    }

    render() {
        return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
    }
}
