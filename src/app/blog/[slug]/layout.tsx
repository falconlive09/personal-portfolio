import type { Metadata } from 'next';
import { blogPosts } from '@/data/blogs';

// The post page is a client component, so the static params and per-post metadata live here.
// Every post is pre-rendered at build time; unknown slugs fall through to the page's "not found" view.
export function generateStaticParams() {
    return blogPosts.map((post) => ({ slug: post.slug }));
}

/** Unsplash covers: ask for a 1200x630 JPEG crop. Other images are used as-is. */
function previewImage(src: string) {
    if (!src.includes('images.unsplash.com')) return src;
    const url = new URL(src);
    url.searchParams.set('w', '1200');
    url.searchParams.set('h', '630');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('fm', 'jpg');
    url.searchParams.set('q', '80');
    url.searchParams.delete('auto'); // auto=format would still serve WebP to clients that accept it
    return url.toString();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = blogPosts.find((p) => p.slug === slug);
    if (!post) return { title: 'Blog' };

    // Link previews (WhatsApp, LinkedIn, X…) want a ~1200x630 JPEG/PNG; WhatsApp doesn't reliably show WebP
    const image = previewImage(post.image);

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            type: 'article',
            url: `/blog/${post.slug}`,
            title: post.title,
            description: post.excerpt,
            publishedTime: post.date,
            images: [{ url: image, width: 1200, height: 630, alt: post.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [image],
        },
    };
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
    return children;
}
