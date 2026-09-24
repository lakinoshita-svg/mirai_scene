/** Local paths are always relative to the configured Astro base. */
export const sitePath = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
export const careerPath = (slug: string) => sitePath(`careers/${slug}/`);
