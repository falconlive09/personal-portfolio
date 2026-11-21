'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePerformance } from '@/hooks/usePerformance';
import dynamic from 'next/dynamic';

// pdf.js relies on browser-only APIs (e.g. DOMMatrix), so render the viewer on the client only.
const PdfViewer = dynamic(
    () => import('@/components/ui/pdf-viewer').then((m) => m.PdfViewer),
    { ssr: false }
);

export default function ResumePage() {
    const { isLowPowerMode } = usePerformance();
    // Google Drive file ID of the resume ("Open in New Tab" points here).
    // The in-page viewer renders the local copy at public/resume.pdf — keep it in sync with Drive.
    const fileId = "1ZZxhgvI6z7xSFxWew2bY4h0Bz47uqjGU";
    const resumeUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    return (
        <div className="h-screen h-[100dvh] bg-background relative flex flex-col pt-24 max-lg:landscape:pt-16 pb-4 max-lg:pb-2 overflow-hidden">

            {/* Header / Controls */}
            <motion.div
                initial={isLowPowerMode ? { opacity: 0 } : { opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="container-creative px-4 sm:px-6 mb-3 sm:mb-4 flex-none flex flex-row justify-between items-center gap-3 sm:gap-4"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm sm:text-base">Back<span className="hidden sm:inline"> to Portfolio</span></span>
                </Link>

                <div className="flex items-center gap-4">
                    <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all active:scale-95 shadow-sm"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open in New Tab</span>
                    </a>
                </div>
            </motion.div>

            {/* Resume Viewer */}
            <motion.div
                initial={isLowPowerMode ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex-1 w-full max-w-[1400px] mx-auto px-2 sm:px-4 md:px-6 min-h-0 pb-2 sm:pb-4 relative"
            >
                <div className="w-full h-full bg-muted/30 rounded-2xl border border-border/50 overflow-hidden relative group">
                    <PdfViewer url="/resume.pdf" />
                </div>
            </motion.div>
        </div>
    );
}
