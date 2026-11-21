import { Fragment, type ReactNode } from 'react';
import Image from 'next/image';
import type { BlogBlock } from '@/types';

// **bold** and `code` inside a text string.
function inline(text: string): ReactNode {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="text-foreground font-semibold">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return (
                <code key={i} className="px-1.5 py-0.5 rounded-md bg-foreground/[0.07] text-foreground text-[0.88em] font-mono break-words">
                    {part.slice(1, -1)}
                </code>
            );
        }
        return <Fragment key={i}>{part}</Fragment>;
    });
}

export function ArticleBody({ blocks, author }: { blocks: BlogBlock[]; author: { name: string; avatar: string } }) {
    return (
        <div className="text-base sm:text-lg leading-relaxed sm:leading-loose text-muted-foreground">
            {blocks.map((block, i) => {
                switch (block.type) {
                    case 'h2':
                        return (
                            <h2 key={i} id={block.id} className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mt-12 sm:mt-16 mb-4 sm:mb-6 scroll-mt-28 first:mt-0">
                                {block.text}
                            </h2>
                        );
                    case 'h3':
                        return <h3 key={i} className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-4">{block.text}</h3>;
                    case 'p':
                        return <p key={i} className="mb-6 sm:mb-8">{inline(block.text)}</p>;
                    case 'ul':
                    case 'ol': {
                        const List = block.type === 'ul' ? 'ul' : 'ol';
                        return (
                            <List key={i} className={`${block.type === 'ul' ? 'list-disc' : 'list-decimal'} pl-5 sm:pl-6 mb-6 sm:mb-8 space-y-2 marker:text-primary/70`}>
                                {block.items.map((item, j) => <li key={j} className="pl-1">{inline(item)}</li>)}
                            </List>
                        );
                    }
                    case 'code':
                        return (
                            <figure key={i} className="mb-6 sm:mb-8 -mx-4 sm:mx-0">
                                <div className="sm:rounded-2xl border-y sm:border border-border/40 bg-[#0d1117] overflow-hidden">
                                    <div className="px-4 py-2 border-b border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/40">{block.lang}</div>
                                    <pre className="p-4 overflow-x-auto text-[12.5px] sm:text-sm leading-relaxed text-[#e6edf3] font-mono" data-lenis-prevent>
                                        <code>{block.code}</code>
                                    </pre>
                                </div>
                                {block.caption && <figcaption className="mt-2 px-4 sm:px-0 text-sm text-muted-foreground/70">{block.caption}</figcaption>}
                            </figure>
                        );
                    case 'quote':
                        return (
                            <blockquote key={i} className="border-l-4 border-primary pl-4 sm:pl-6 my-10 sm:my-12 italic text-lg sm:text-xl font-medium text-foreground">
                                “{inline(block.text)}”
                                <footer className="mt-4 text-sm font-bold not-italic flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-secondary overflow-hidden relative">
                                        <Image src={author.avatar} alt={author.name} fill sizes="32px" loading="lazy" className="object-cover" />
                                    </span>
                                    <span className="text-foreground">{author.name}</span>
                                </footer>
                            </blockquote>
                        );
                    case 'callout':
                        return (
                            <aside key={i} className="mb-6 sm:mb-8 rounded-2xl border border-primary/20 bg-primary/[0.06] p-4 sm:p-6">
                                <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">{block.title}</div>
                                <p className="text-base leading-relaxed">{inline(block.text)}</p>
                            </aside>
                        );
                    case 'table':
                        return (
                            <div key={i} className="mb-6 sm:mb-8">
                                {/* Phones: tables with 3+ columns become one card per row */}
                                {block.head.length > 2 && (
                                    <div className="sm:hidden space-y-3">
                                        {block.rows.map((row, j) => (
                                            <div key={j} className="rounded-xl border border-border/40 bg-foreground/[0.02] p-4 text-sm">
                                                <div className="font-bold text-foreground mb-2">{inline(row[0])}</div>
                                                {row.slice(1).map((cell, k) => (
                                                    <div key={k} className="mt-1.5">
                                                        <span className="block text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{block.head[k + 1]}</span>
                                                        {inline(cell)}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <table className={`w-full text-sm sm:text-base border-collapse ${block.head.length > 2 ? 'hidden sm:table' : ''}`}>
                                    <thead>
                                        <tr>
                                            {block.head.map((h, j) => (
                                                <th key={j} className="text-left font-bold text-foreground border-b border-border/60 py-2 pr-4">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {block.rows.map((row, j) => (
                                            <tr key={j} className="border-b border-border/30 align-top">
                                                {row.map((cell, k) => (
                                                    <td key={k} className={`py-2.5 pr-4 ${k === 0 ? 'text-foreground font-medium' : ''}`}>{inline(cell)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    case 'image':
                        return (
                            <figure key={i} className="my-10">
                                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border/40 bg-secondary/5">
                                    <Image src={block.src} alt={block.alt} fill sizes="(max-width: 1023px) 100vw, 800px" loading="lazy" className="object-cover" />
                                </div>
                                {block.caption && <figcaption className="mt-2 text-sm text-muted-foreground/70">{block.caption}</figcaption>}
                            </figure>
                        );
                }
            })}
        </div>
    );
}
