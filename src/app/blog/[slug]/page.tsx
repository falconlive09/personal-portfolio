'use client';

import { use, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { portfolioData } from '@/data/portfolio';
import { Clock, Copy, Linkedin, Github, BookOpen, Link as LinkIcon, ArrowLeft, Check } from 'lucide-react';
import { notFound, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArticleBody } from '@/components/blog/ArticleBody';
import { formatPostDate } from '@/lib/date';

const formatDate = formatPostDate;

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const t = useTranslations('blog');
    const router = useRouter();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 2) {
            router.back();
        } else {
            router.push('/blog');
        }
    };

    const post = portfolioData.blogs.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    const isImplemented = !!post.body?.length;
    const publishedOn = formatDate(post.date);
    // Sidebar contents come from the article's h2 headings (optionally with a shorter `toc` label).
    const toc = (post.body ?? []).flatMap(b => (b.type === 'h2' ? [{ id: b.id, label: b.toc ?? b.text }] : []));
    const trendingTopics = Array.from(new Set(portfolioData.blogs.flatMap(b => b.tags))).slice(0, 12);

    return (
        <main className="min-h-screen bg-background pb-24 pt-28 lg:pt-32 max-lg:landscape:pt-20">
            {/* Header Section */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium hover:text-primary transition-colors">
                            <button onClick={handleBack} className="flex items-center gap-2 focus:outline-none">
                                <ArrowLeft className="w-4 h-4" />
                                <span>Back</span>
                            </button>
                        </div>
                    </div>

                    <div className="max-w-4xl">
                        <h1 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-7xl font-black tracking-tight text-foreground mb-4 sm:mb-6 leading-[1.1]">
                            {post.title}
                        </h1>

                        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl font-light">
                            {post.excerpt}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Hero Image */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 mb-8 sm:mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[2/1] max-lg:landscape:aspect-[21/9] rounded-2xl sm:rounded-3xl overflow-hidden border border-border/40 shadow-2xl"
                >
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        sizes="100vw"
                        className="object-cover"
                        preload
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
            </div>

            {/* Metadata Bar */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 mb-10 sm:mb-16">
                <div className="flex flex-col md:flex-row items-center justify-between border-y border-border/40 py-4 sm:py-6 gap-4 sm:gap-6">
                    <div className="flex items-center gap-6 sm:gap-12 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Written by</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{post.author.name}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Published on</span>
                            <span className="font-bold text-foreground">{publishedOn}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Read time</span>
                            <span className="font-bold text-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{post.readTime} min</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 transition-all text-xs font-bold uppercase tracking-wider rounded-lg",
                                copied
                                    ? "bg-primary text-background"
                                    : "bg-secondary/10 hover:bg-secondary/20 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4" /> <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" /> <span className="hidden sm:inline">Copy link</span>
                                </>
                            )}
                        </button>
                        <div className="w-px h-6 bg-border/40 hidden sm:block" />
                        <Link href="https://linkedin.com/in/nealgautam" target="_blank" className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/10 rounded-lg hover:bg-primary/10">
                            <Linkedin className="w-4 h-4" />
                        </Link>
                        <Link href="https://github.com/falconlive09" target="_blank" className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/10 rounded-lg hover:bg-primary/10">
                            <Github className="w-4 h-4" />
                        </Link>
                        <Link href="https://x.com/bizzyneal" target="_blank" className="p-2 text-muted-foreground hover:text-primary transition-colors bg-secondary/10 rounded-lg hover:bg-primary/10">
                            <BookOpen className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content & Sidebar Grid */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">

                    {/* Left Column: Article Content */}
                    <div className={isImplemented ? "lg:col-span-8" : "lg:col-span-12"}>
                        <div className="max-w-none">
                            {/* Phones/tablets: the sidebar sits below the article, so show the contents up here */}
                            {toc.length > 0 && (
                                <details className="lg:hidden mb-8 rounded-2xl border border-border/40 bg-foreground/[0.02] group/toc">
                                    <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none text-xs font-bold uppercase tracking-widest text-muted-foreground [&::-webkit-details-marker]:hidden">
                                        In this article
                                        <span className="text-base leading-none transition-transform group-open/toc:rotate-45">+</span>
                                    </summary>
                                    <ol className="px-4 pb-4 space-y-2.5 text-sm">
                                        {toc.map((item, index) => (
                                            <li key={item.id}>
                                                <a href={`#${item.id}`} className="flex gap-3 text-foreground/80 hover:text-primary">
                                                    <span className="font-mono text-xs text-muted-foreground/60 pt-0.5">{String(index + 1).padStart(2, '0')}</span>
                                                    {item.label}
                                                </a>
                                            </li>
                                        ))}
                                    </ol>
                                </details>
                            )}

                            {post.body && <ArticleBody blocks={post.body} author={post.author} />}

                            {!isImplemented && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="p-4 rounded-full bg-secondary/10 text-muted-foreground mb-4">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Content Coming Soon</h2>
                                    <p className="text-muted-foreground">This article is currently being written. Check back later!</p>
                                </div>
                            )}

                            {isImplemented && (
                                <div className="mt-12 pt-10 sm:pt-12 border-t border-border/40">
                                    <h3 className="text-lg font-bold mb-6">Related Topics</h3>
                                    <div className="flex flex-wrap gap-2 sm:gap-3">
                                        {post.tags.map(tag => (
                                            <Link key={tag} href={`/blog?q=${tag}`} className="px-4 py-2 bg-secondary/10 hover:bg-primary/10 text-muted-foreground hover:text-primary border border-transparent hover:border-primary/20 rounded-lg text-sm transition-all font-medium">
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    {isImplemented && (
                        <div className="lg:col-span-4 space-y-8">
                            <div className="lg:sticky lg:top-28 space-y-8">
                                {/* Table of Contents */}
                                <div className="hidden lg:block">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-4 border-b border-border/40">
                                        Table of Contents
                                    </h3>
                                    <div className="flex flex-col gap-4">
                                        {toc.map((item, index) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={cn(
                                                    "group flex items-center gap-3 text-sm font-medium transition-colors",
                                                    index === 0 ? "text-primary pl-0" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                <span className={cn("h-px w-4 transition-all", index === 0 ? "bg-primary" : "bg-transparent group-hover:bg-border")} />
                                                {item.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>

                                {/* Other Resources */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-4 border-b border-border/40">
                                        Related Resources
                                    </h3>
                                    <ul className="space-y-6">
                                        {(post.resources ?? []).map((resource, i) => (
                                            <li key={i} className="group">
                                                <Link href={resource.url} target="_blank" className="flex gap-4 items-start">
                                                    <div className="relative w-24 aspect-[3/2] rounded-lg overflow-hidden flex-shrink-0 bg-secondary/10 border border-border/40">
                                                        <Image
                                                            src={resource.image}
                                                            alt={resource.title}
                                                            fill
                                                            sizes="96px"
                                                            loading="lazy"
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                                                            <LinkIcon className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 pt-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                                {resource.category}
                                                            </span>
                                                        </div>
                                                        <h5 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                                            {resource.title}
                                                        </h5>
                                                        <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                                                            {resource.kind === 'Video' ? <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                                                            {resource.kind}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Tags / Topics (New addition to fill space) */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 pb-4 border-b border-border/40">
                                        Trending Topics
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {trendingTopics.map(tag => (
                                            <Link
                                                key={tag}
                                                href={`/blog?q=${tag}`}
                                                className="px-3 py-1.5 bg-secondary/5 hover:bg-primary/10 text-xs font-medium text-muted-foreground hover:text-primary border border-border/40 hover:border-primary/20 rounded-md transition-all"
                                            >
                                                {tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Latest From Blog Section */}
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 mt-16 border-t border-border/40 pt-12 sm:pt-16">
                <div className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">From the blog</h3>
                    <Link href="/blog" className="shrink-0 px-4 sm:px-6 py-2 rounded-lg bg-secondary/10 border border-border/40 text-sm font-bold hover:bg-secondary/20 transition-all">
                        View all posts
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                    {portfolioData.blogs.filter(b => b.slug !== slug).slice(0, 2).map((b) => (
                        <Link key={b.slug} href={`/blog/${b.slug}`} className="group block">
                            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden mb-6 bg-secondary/5 border border-border/40">
                                <Image src={b.image} alt={b.title} fill sizes="(max-width: 768px) 100vw, 600px" loading="lazy" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                                <div className="absolute bottom-4 left-4">
                                    <span className="px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                                        {t(`categories.${b.category}`)}
                                    </span>
                                </div>
                            </div>
                            <h4 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                                {b.title}
                            </h4>
                            <p className="text-muted-foreground line-clamp-2 mb-4">{b.excerpt}</p>
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <div className="w-6 h-6 rounded-full bg-secondary/20 relative overflow-hidden">
                                    <Image src={b.author.avatar} alt={b.author.name} loading="lazy" fill sizes="32px" className="object-cover" />
                                </div>
                                {b.author.name} · {formatDate(b.date)}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
