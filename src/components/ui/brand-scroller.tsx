"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { portfolioData } from "@/data/portfolio";
import { cn } from "@/lib/utils";

// Full tech stack from portfolio data (Java, Spring, Kafka, Cassandra, YugabyteDB, ...)
const techStackItems = portfolioData.techStack;

const toolItems = portfolioData.tools.slice(0, 10);

// The original design scrolled 10 items per row in 30s. Scale the duration with the
// item count so every row keeps that same per-item speed, however many items it has.
const BASE_DURATION = 30;
const BASE_ITEM_COUNT = 10;
const getScrollDuration = (count: number) => BASE_DURATION * Math.max(count, 1) / BASE_ITEM_COUNT;

// Brands whose official logos are black / very dark (no colorful variant), plus MySQL's
// dark-navy dolphin. In dark mode they are inverted to a light tone; hue-rotate keeps the
// original hue (e.g. AWS's orange arrow stays orange, MySQL stays blue).
const DARK_MODE_INVERT = new Set(['Apache Kafka', 'AWS', 'Keycloak', 'GitHub', 'Cursor', 'GitHub Copilot', 'MySQL']);
const getIconClassName = (name: string) =>
    DARK_MODE_INVERT.has(name) ? "dark:invert dark:hue-rotate-180" : undefined;

const ScrollerItem = ({ name, icon }: { name: string; icon: string }) => (
    <div className="flex items-center gap-4 px-12 py-4 transition-all duration-300 group">
        <div className="relative w-10 h-10 flex-shrink-0 transition-all duration-500">
            <Image
                src={icon}
                alt={name}
                fill
                className={cn("object-contain", getIconClassName(name))}
                unoptimized
            />
        </div>
        <p className="text-xl font-bold text-zinc-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors duration-500 whitespace-nowrap">
            {name}
        </p>
    </div>
);

export const BrandScroller = () => {
    return (
        <div className="relative flex overflow-hidden py-2 w-full px-8 md:px-16 lg:px-24 [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
            <motion.div
                animate={{
                    x: ["-50%", "0%"],
                }}
                transition={{
                    duration: getScrollDuration(techStackItems.length),
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex whitespace-nowrap"
            >
                {/* Render twice for seamless loop */}
                <div className="flex shrink-0">
                    {techStackItems.map((item, idx) => (
                        <ScrollerItem key={`tech-1-${idx}`} name={item.name} icon={item.icon} />
                    ))}
                </div>
                <div className="flex shrink-0">
                    {techStackItems.map((item, idx) => (
                        <ScrollerItem key={`tech-2-${idx}`} name={item.name} icon={item.icon} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export const BrandScrollerReverse = () => {
    return (
        <div className="relative flex overflow-hidden py-2 w-full px-8 md:px-16 lg:px-24 [mask-image:linear-gradient(to_right,_rgba(0,_0,_0,_0),rgba(0,_0,_0,_1)_10%,rgba(0,_0,_0,_1)_90%,rgba(0,_0,_0,_0))]">
            <motion.div
                animate={{
                    x: ["0%", "-50%"],
                }}
                transition={{
                    duration: getScrollDuration(toolItems.length),
                    ease: "linear",
                    repeat: Infinity,
                }}
                className="flex whitespace-nowrap"
            >
                {/* Render twice for seamless loop */}
                <div className="flex shrink-0">
                    {toolItems.map((item, idx) => (
                        <ScrollerItem key={`tool-1-${idx}`} name={item.name} icon={item.icon} />
                    ))}
                </div>
                <div className="flex shrink-0">
                    {toolItems.map((item, idx) => (
                        <ScrollerItem key={`tool-2-${idx}`} name={item.name} icon={item.icon} />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
