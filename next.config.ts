import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    transpilePackages: ['three'],
    turbopack: {
        resolveAlias: {
            // react-pdf imports the modern pdf.js build, which crashes on Safari/iOS before 18.4
            // ("Can't find variable: Iterator"). The legacy build ships the needed polyfills.
            'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf.mjs',
            'pdfjs-dist/web/pdf_viewer.mjs': 'pdfjs-dist/legacy/web/pdf_viewer.mjs',
        },
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
            { protocol: 'https', hostname: 'images.unsplash.com' }
        ],
        formats: ['image/avif', 'image/webp'],
    },
};

export default withNextIntl(nextConfig);
