export const localPath = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
export const lessonPath = (slug: string) => localPath(`forteacher/${encodeURIComponent(slug)}/`);
export const legacyLessonPath = (path: string) => {
  const url = new URL(path, 'https://shinronavi.com');
  const slug = url.searchParams.get('slug');
  if (url.pathname === '/forteacher/lesson' && slug) return lessonPath(slug);
  return localPath(url.pathname);
};
