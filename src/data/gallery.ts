// Photos shown on /gallery (and in the /blog gallery folder), in display order. Each `file` is in public/gallery;
// to add a photo, drop the .webp there and add an entry here.
export interface GalleryPhoto {
    file: string;
    title: string;
    category: string;
    date: string;
    description: string;
}

export const galleryPhotos: GalleryPhoto[] = [
    {
        file: 'gff26-npci.webp',
        title: 'At the NPCI pavilion',
        category: 'Global Fintech Fest 2026',
        date: 'Sep 2026',
        description: 'At the NPCI pavilion during Global Fintech Fest 2026.',
    },
    {
        file: 'gff26-cashfree.webp',
        title: 'The main hall',
        category: 'Global Fintech Fest 2026',
        date: 'Sep 2026',
        description: 'Crowds around the Cashfree booth on the main show floor.',
    },
    {
        file: 'gff26-sarvam.webp',
        title: 'Built with Sarvam',
        category: 'Global Fintech Fest 2026',
        date: 'Sep 2026',
        description: "Sarvam AI's booth, showing India-built AI models.",
    },
    {
        file: 'gff26-showcase.webp',
        title: 'On display',
        category: 'Global Fintech Fest 2026',
        date: 'Sep 2026',
        description: 'A Mercedes-Maybach on show at the venue.',
    },
    {
        file: 'mnit-convocation-award.webp',
        title: 'Receiving my degree',
        category: 'MNIT Jaipur',
        date: 'Sep 2024',
        description: 'On stage at the 18th Convocation of MNIT Jaipur.',
    },
    {
        file: 'mnit-convocation.webp',
        title: '18th Convocation',
        category: 'MNIT Jaipur',
        date: 'Sep 2024',
        description: 'Graduation day at Malaviya National Institute of Technology, Jaipur.',
    },
    {
        file: 'mnit-friends.webp',
        title: 'The batch',
        category: 'MNIT Jaipur',
        date: 'May 2024',
        description: 'With friends from MNIT Jaipur.',
    },
    {
        file: 'above-the-clouds.webp',
        title: 'Above the clouds',
        category: 'Travel',
        date: 'Feb 2025',
        description: 'Dusk from a window seat.',
    },
];
