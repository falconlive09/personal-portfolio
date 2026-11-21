import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Playfair_Display, Alex_Brush } from 'next/font/google';
import { getMessages, getLocale } from 'next-intl/server';
import { ThemeProvider, I18nProvider, SmoothScrollProvider } from '@/providers';

import '@/styles/globals.css';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-jetbrains',
    display: 'swap',
});

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    display: 'swap',
});

const signature = Alex_Brush({
    weight: '400',
    subsets: ['latin'],
    variable: '--font-signature',
    display: 'swap',
});

export const metadata: Metadata = {
    title: {
        default: 'Neal Gautam | Software Development Engineer',
        template: '%s | Neal Gautam',
    },
    description: 'Software Development Engineer building real-time, high-scale backend and distributed systems. Explore my projects, skills, and professional journey.',
    keywords: ['Neal Gautam', 'software engineer', 'backend', 'java', 'spring boot', 'microservices', 'kafka', 'distributed systems', 'portfolio'],
    authors: [{ name: 'Neal Gautam' }],
    creator: 'Neal Gautam',
    metadataBase: new URL('https://your-domain.com'),
    openGraph: {
        type: 'website',
        locale: 'en_US',
        url: 'https://your-domain.com',
        title: 'Neal Gautam | Software Development Engineer',
        description: 'Software Development Engineer building real-time, high-scale backend and distributed systems.',
        siteName: 'Neal Gautam',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Neal Gautam | Software Development Engineer',
        description: 'Software Development Engineer building real-time, high-scale backend and distributed systems.',
        creator: '@bizzyneal',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    // Tab icon follows the browser's light/dark setting; favicon.ico is the fallback for browsers that ignore `media`
    icons: {
        icon: [
            { url: '/icons/light/favicon-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: light)' },
            { url: '/icons/light/favicon-16x16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: light)' },
            { url: '/icons/dark/favicon-32x32.png', sizes: '32x32', type: 'image/png', media: '(prefers-color-scheme: dark)' },
            { url: '/icons/dark/favicon-16x16.png', sizes: '16x16', type: 'image/png', media: '(prefers-color-scheme: dark)' },
        ],
        shortcut: '/favicon.ico',
        apple: { url: '/icons/dark/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
    ],
    width: 'device-width',
    initialScale: 1,
    minimumScale: 1,
};

import { ThemeAwareClickSpark } from '@/components/ui/ThemeAwareClickSpark';
import { ConditionalNavigation } from '@/components/layout/ConditionalNavigation';
import { ArcPreloaderWrapper } from '@/components/layout/ArcPreloaderWrapper';
import { ChatBot } from '@/components/layout/ChatBot';

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={`${inter.variable} ${jetbrainsMono.variable} ${playfair.variable} ${signature.variable} font-sans relative`}>
                <ThemeProvider>
                    <I18nProvider locale={locale} messages={messages}>
                        <SmoothScrollProvider>
                            <ThemeAwareClickSpark>
                                <ArcPreloaderWrapper>
                                    <ConditionalNavigation>
                                        {children}
                                    </ConditionalNavigation>
                                </ArcPreloaderWrapper>
                                <ChatBot headless />
                            </ThemeAwareClickSpark>
                        </SmoothScrollProvider>
                    </I18nProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
