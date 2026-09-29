export const localPath = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\/+/, '')}`;
export const lessonPath = (slug: string) => localPath(`forteacher/${encodeURIComponent(slug)}/`);
// 提供資料の本番URL lesson?slug=... を、この作業コピーの静的ルートへ変換する。
// 本番テンプレートへ移植するときは、この変換をそのまま持ち込まず本番ルートに合わせる。
export const legacyLessonPath = (path: string) => {
  const url = new URL(path, 'https://shinronavi.com');
  const slug = url.searchParams.get('slug');
  if (url.pathname === '/forteacher/lesson' && slug) return lessonPath(slug);
  return localPath(url.pathname);
};
