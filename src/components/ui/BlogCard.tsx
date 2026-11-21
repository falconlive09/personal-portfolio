import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { formatPostDate } from '@/lib/date';

interface BlogCardProps {
    post: BlogPost;
    index: number;
    isHovered?: boolean;
    isLowPowerMode?: boolean;
}

export function BlogCard({ post, index, isHovered, isLowPowerMode }: BlogCardProps) {
    const t = useTranslations('blog');

    return (
        <Link
            href={`/blog/${post.slug}`}
            className="block h-full cursor-none outline-none"
            data-blog-id={post.id}
        >
            <motion.div
                initial={isLowPowerMode ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: isLowPowerMode ? 0 : index * 0.1 }}
                className={cn(
                    "relative aspect-[16/9] max-sm:aspect-[4/3] w-full bg-background rounded-none overflow-hidden border border-foreground/10 dark:border-white/5 transition-[border-color,box-shadow] duration-500 shadow-xl",
                    isHovered ? "border-primary/40 shadow-2xl scale-[1.01]" : "border-foreground/10"
                )}
            >
                {/* Immersive Background Image */}
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className={cn(
                        "object-cover transition-transform duration-1000",
                        isHovered ? "scale-105" : "scale-100"
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    // The first row can be the largest thing on screen: don't lazy-load it
                    loading={index < 3 ? 'eager' : 'lazy'}
                />

                {/* Permanent Gradient Overlay for Legibility */}
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-700",
                    isHovered ? "opacity-95" : "opacity-70"
                )} />

                {/* Integrated Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 md:p-8">
                    {/* Title (Always visible, clean, first in order) */}
                    <h3 className={cn(
                        "text-xl sm:text-2xl lg:text-3xl font-black text-white transition-all leading-[1.1] tracking-tighter drop-shadow-lg",
                        isHovered ? "translate-y-0" : "translate-y-2 max-lg:translate-y-0"
                    )}>
                        {post.title}
                    </h3>

                    {/* The Reveal Section (Appears BELOW the title) */}
                    <div className={cn(
                        "transition-all duration-700 ease-in-out overflow-hidden space-y-4",
                        isHovered ? "max-h-[200px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0 max-lg:max-h-[200px] max-lg:opacity-100 max-lg:mt-3"
                    )}>
                        <p className="text-xs text-white/80 line-clamp-3 max-lg:line-clamp-2 max-lg:landscape:hidden leading-relaxed font-medium">
                            {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 lg:pt-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white bg-white/10 backdrop-blur-md px-3 py-1 rounded-none border border-white/10">
                                {t(`categories.${post.category}`)}
                            </span>
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                                {formatPostDate(post.date)}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

