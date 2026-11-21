// "2026-11-08" -> "8 Nov 2026". Formatted by hand because Intl month names differ between Node and
// Safari ("Sept" vs "Sep"), which breaks hydration of server-rendered dates.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatPostDate(date: string): string {
    const [y, m, d] = date.split('-').map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
}
