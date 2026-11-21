import type { Metadata } from 'next';
import { blogPosts } from '@/data/blogs';

// The post page is a client component, so the static params and per-post metadata live here.
// Every post is pre-rendered at build time; unknown slugs fall through to the page's "not found" view.
export function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: 'Blog' };

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.excerpt,
            publishedTime: post.date,
            images: [post.image],
        },
    };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
    return children;
}
