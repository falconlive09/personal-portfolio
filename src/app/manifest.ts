import type { MetadataRoute } from 'next';

// Served at /manifest.webmanifest (used when the site is added to a phone's home screen).
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Neal Gautam | Software Development Engineer',
        short_name: 'Neal Gautam',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a0a0f',
        theme_color: '#0a0a0f',
        icons: [
            { src: '/icons/dark/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/dark/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
    };
}
