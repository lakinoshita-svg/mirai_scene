import { learningLinks, lessonUrl } from './learningLinks';
import { sitePath } from './paths';
import { createLessonConnections } from './lessonConnections.mjs';

// 埋め込みJSと公開JSONはこの関数を共用する。片方だけURLの組み立てを変更しない。
// 外部の教材ページで使うため、相対パスではなくsiteとBASE_URLを含む絶対URLにする。
export function getIntegrationLinks(site: URL | undefined) {
  if (!site) throw new Error('Astro site is required for integration links');
  const connections = createLessonConnections(learningLinks);
  return Object.entries(connections).flatMap(([lessonSlug, connection]) =>
    connection.fields.map(field => ({
      lessonSlug,
      lessonUrl: lessonUrl(lessonSlug),
      label: `${field.label}のミライシーンへ`,
      miraiUrl: new URL(sitePath(`explore/${field.id}/`), site).href,
    })),
  );
}
