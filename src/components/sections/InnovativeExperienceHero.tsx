'use client';

import { useState, useMemo, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/useIsMobile';

interface NodeData {
    label: string;
    description: string;
    imageUrl?: string;
    /** object-position for the card photo (portrait photos need the face kept in frame) */
    imagePosition?: string;
    orbitIndex: number; // 0 for inner, 1 for outer
    position: number; // 0 to 1 along the orbit
}

interface InnovativeExperienceHeroProps {
    type: 'education' | 'journey' | 'experience';
    title: string;
    highlight: string;
    description: string;
}

const NODES_DATA: Record<string, NodeData[]> = {
    education: [
        { label: 'MNIT Jaipur', description: 'Bachelor of Technology - Electronics & Communication Engineering (2020–2024).', orbitIndex: 0, position: 0.1, imageUrl: "/experience/convocation.webp", imagePosition: "object-[50%_25%]" },
        { label: 'ECE Engineering', description: 'Electronics & Communication Engineering core coursework.', orbitIndex: 1, position: 0.25, imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'DSA Practice', description: 'Data Structures & Algorithms practice on LeetCode.', orbitIndex: 0, position: 0.45, imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Applied AI', description: 'AI-model bypass logic for fraud scoring and Gemini-powered fitness recommendations.', orbitIndex: 1, position: 0.65, imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Core CS', description: 'OOP, DBMS, Operating Systems & Computer Networks.', orbitIndex: 0, position: 0.85, imageUrl: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Side Projects', description: 'Real-time chat, OCR browser extension & an 8-bit ALU.', orbitIndex: 1, position: 0.05, imageUrl: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?q=80&w=400&auto=format&fit=crop&fm=webp" },
    ],
    journey: [
        { label: 'NPCI', description: 'SDE I - Fraud detection for UPI, RuPay, IMPS & NETC.', orbitIndex: 0, position: 0.15, imageUrl: "/experience/npci.webp", imagePosition: "object-[50%_32%]" },
        { label: 'Formidium', description: 'SDE I - Microservices for a fund administration platform.', orbitIndex: 1, position: 0.35, imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'System Design', description: 'Distributed, event-driven systems: Kafka pipelines, Cassandra & YugabyteDB, 40K TPS fraud evaluation.', orbitIndex: 0, position: 0.55, imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'MNIT Jaipur', description: 'B.Tech in Electronics & Communication Engineering.', orbitIndex: 1, position: 0.75, imageUrl: "/experience/convocation-award.webp" },
        { label: 'Fitness Tracker', description: 'Spring Boot microservices with Gemini AI recommendations.', orbitIndex: 0, position: 0.9, imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Open Source', description: 'Personal projects on GitHub as falconlive09.', orbitIndex: 1, position: 0.02, imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop&fm=webp" },
    ],
    experience: [
        { label: 'Fraud Detection', description: 'NPCI - Real-time risk evaluation at sub-100ms latency.', orbitIndex: 0, position: 0.2, imageUrl: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: '2x Throughput', description: 'NPCI - Helped scale throughput from 20K to 40K TPS.', orbitIndex: 1, position: 0.45, imageUrl: "https://images.unsplash.com/photo-1454165833911-5421db635848?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Search Pipeline', description: 'NPCI - Kafka-driven Elasticsearch indexing of 100M+ txns.', orbitIndex: 0, position: 0.6, imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Email Search', description: 'Formidium - Vector + Lucene search across 20M+ emails.', orbitIndex: 1, position: 0.8, imageUrl: "https://images.unsplash.com/photo-1518433278988-c7bc488ce92d?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Doc Platform', description: 'Formidium - 10M+ documents, 40% faster retrieval.', orbitIndex: 0, position: 0.95, imageUrl: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=400&auto=format&fit=crop&fm=webp" },
        { label: 'Microservices', description: 'Formidium - 30% lower latency at 99.9% uptime.', orbitIndex: 1, position: 0.1, imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop&fm=webp" },
    ]
};

const OUTER_PATH = "M 100,300 a 400,180 -15 1,0 800,0 a 400,180 -15 1,0 -800,0";
const INNER_PATH = "M 250,300 a 250,110 -15 1,0 500,0 a 250,110 -15 1,0 -500,0";

export function InnovativeExperienceHero({ type, title, highlight, description }: InnovativeExperienceHeroProps) {
    const rawNodes = NODES_DATA[type] || NODES_DATA.experience;
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);

    return (
        <section className="relative w-full py-4 lg:py-6 overflow-visible bg-transparent transition-colors duration-500">

            <div className="w-full mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 items-center h-full overflow-visible">

                {/* Left Content Column - Strictly Following Image 1 */}
                <div className="relative z-20 space-y-8 lg:-ml-28 lg:pr-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <h2 className="text-[clamp(2.5rem,8vw,4rem)] font-bold text-black dark:text-white tracking-tight leading-[1.1]">
                            {title}<br />{highlight}
                        </h2>

                        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-4xl leading-relaxed">
                            {description}
                        </p>

                        <div className="pt-4">
                            <Link
                                href="/resume"
                                className="group flex items-center gap-2 w-fit px-6 py-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white font-bold text-sm transition-all hover:bg-neutral-200 dark:hover:bg-neutral-700"
                            >
                                View resume <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>
                </div>

                {/* Right Orbital Column - Strictly Following Image 1 (Wide Ellipse) */}
                <div className="relative max-lg:z-30 w-full h-[300px] md:h-[450px] lg:h-[600px] flex items-center justify-center overflow-visible">
                    {/* Responsive Container for Orbit */}
                    <div className="relative w-[1000px] h-[600px] [--s:0.32] min-[400px]:[--s:0.36] sm:[--s:0.4] md:[--s:0.5] lg:[--s:0.65] xl:[--s:0.75] [--n:calc(0.8/var(--s))] lg:[--n:1] scale-[var(--s)] transition-transform duration-500 origin-center shrink-0 overflow-visible">
                        {/* SVG Orbital Paths (Tilted Ellipses) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" viewBox="0 0 1000 600">
                            <path d={OUTER_PATH} className="stroke-neutral-400 dark:stroke-neutral-600 opacity-60 dark:opacity-40" fill="none" strokeWidth="1.5" strokeDasharray="6 8" />
                            <path d={INNER_PATH} className="stroke-neutral-400 dark:stroke-neutral-600 opacity-60 dark:opacity-40" fill="none" strokeWidth="1.5" strokeDasharray="6 8" />
                        </svg>

                        {/* Nodes - Positioned using offset-path to ensure they sit directly on the dashed lines */}
                        {rawNodes.map((node) => (
                            <OrbitalNode
                                key={node.label}
                                node={node}
                                isHovered={hoveredNode === node.label}
                                onHover={() => setHoveredNode(node.label)}
                                onLeave={() => setHoveredNode(null)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function OrbitalNode({ node, isHovered, onHover, onLeave }: {
    node: NodeData; isHovered: boolean; onHover: () => void; onLeave: () => void;
}) {
    const path = node.orbitIndex === 0 ? INNER_PATH : OUTER_PATH;
    const isLeftSide = node.position < 0.25 || node.position > 0.75;
    // Phones/tablets: open the card toward the middle of the screen so edge nodes don't push it off-screen
    const isMobile = useIsMobile(1024);
    const cardRef = useRef<HTMLDivElement>(null);
    const tailRef = useRef<HTMLDivElement>(null);
    // Nudge the card (and move its tail back over the node) so it stays on screen. The card mounts fresh each time it opens.
    useLayoutEffect(() => {
        const el = cardRef.current;
        if (!isHovered || !isMobile || !el) return;
        const r = el.getBoundingClientRect();
        const k = r.width / el.offsetWidth || 1; // on-screen scale of the card
        const vw = document.documentElement.clientWidth, margin = 12;
        const dx = (r.left < margin ? margin - r.left : r.right > vw - margin ? vw - margin - r.right : 0) / k;
        el.style.marginLeft = `${dx}px`;
        if (tailRef.current) tailRef.current.style.left = `calc(50% - ${dx}px)`;
    }, [isHovered, isMobile]);

    return (
        <div
            className="absolute"
            style={{
                offsetPath: `path('${path}')`,
                offsetDistance: `${node.position * 100}%`,
                offsetRotate: '0deg',
                zIndex: isHovered ? 50 : 20
            }}
        >
            <div className="relative origin-top-left scale-[var(--n)]" onMouseEnter={onHover} onMouseLeave={onLeave}>
                {/* 
                    The anchor point of this container is at (0,0). 
                    We place the button exactly at (0,0) by centering it with translate. 
                */}
                <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
                    <button
                        onMouseEnter={onHover}
                        onMouseLeave={onLeave}
                        onClick={onHover}
                        aria-label={node.label}
                        className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 pointer-events-auto",
                            "bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white border border-neutral-200 dark:border-neutral-700 shadow-sm",
                            isHovered && "scale-110 shadow-lg border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700"
                        )}
                    >
                        <Plus className={cn("w-4 h-4 transition-transform duration-500", isHovered && "rotate-45")} />
                    </button>

                    {/* Detail Card (Image 4 Style) - Anchored strictly to the center of the icon */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
                                exit={{ opacity: 0, y: 10, scale: 0.95, x: "-50%" }}
                                ref={cardRef}
                                className="absolute bottom-[calc(100%+12px)] left-1/2 z-50 pointer-events-none"
                            >
                                <div className="relative w-[320px] bg-neutral-950/95 dark:bg-neutral-50/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl pt-2 px-4 pb-4 md:pt-3 md:px-5 md:pb-5 space-y-3 border border-white/10 dark:border-black/5">
                                    {/* Tail to node */}
                                    <div ref={tailRef} className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 w-4 h-4 bg-neutral-950/95 dark:bg-neutral-50/95 border-r border-b border-white/10 dark:border-black/5 rotate-45 -z-10" />
                                    <div className="space-y-1">
                                        <h4 className="text-neutral-100 dark:text-neutral-900 font-bold text-lg leading-tight">{node.label}</h4>
                                        <p className="text-neutral-400 dark:text-neutral-500 text-sm leading-relaxed">
                                            {node.description}
                                        </p>
                                    </div>

                                    {/* Image Visualization Area */}
                                    <div className="aspect-video relative rounded-xl bg-neutral-900/50 dark:bg-neutral-200/50 overflow-hidden border border-white/5 dark:border-black/5">
                                        {node.imageUrl ? (
                                            <Image src={node.imageUrl} alt={node.label} fill sizes="320px" className={cn("object-cover", node.imagePosition)} />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-widest text-white/20 dark:text-black/20 font-mono">
                                                Visualization Area
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/60 dark:from-neutral-50/60 to-transparent" />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* The Label - Positioned relative to the anchor point (stays out of center logic) */}
                <div className={cn(
                    "absolute top-0 whitespace-nowrap transition-all duration-300 pointer-events-none",
                    isLeftSide ? "right-6 pr-4 text-right" : "left-6 pl-4 text-left",
                    "-translate-y-1/2",
                    // Phones/tablets: label centred under its button so edge labels stay on screen
                    "max-lg:left-0 max-lg:right-auto max-lg:p-0 max-lg:top-5 max-lg:-translate-x-1/2 max-lg:translate-y-0 max-lg:text-center"
                )}>
                    <span className={cn(
                        "text-sm font-bold text-black dark:text-white transition-all duration-300",
                        isHovered ? "opacity-100" : "opacity-70"
                    )}>
                        {node.label}
                    </span>
                </div>
            </div>
        </div>
    );
}

