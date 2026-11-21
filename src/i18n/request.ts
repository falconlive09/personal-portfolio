import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, Locale } from './settings';

export default getRequestConfig(async () => {
    // Language switcher removed: always English. (Restore cookie / accept-language detection to re-enable.)
    const locale: Locale = defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        timeZone: 'Asia/Kolkata'
    };
});
