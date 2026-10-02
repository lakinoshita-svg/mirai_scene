/**
 * @typedef {{ id: string, label: string, lessons: { slug: string }[] }} LearningField
 * @typedef {{ slug: string, name: string, entryTitle: string, learningIds: string[] }} LinkedCareer
 * @typedef {{ fields: { id: string, label: string }[], careers: { slug: string, name: string, title: string }[] }} LessonConnection
 */

/** Shared reverse mapping for the Astro endpoints and the standalone inquiry export.
 * @param {LearningField[]} fields
 * @param {LinkedCareer[]} careers
 * @returns {Record<string, LessonConnection>}
 */
export function createLessonConnections(fields, careers = []) {
  /** @type {Record<string, LessonConnection>} */
  const connections = Object.create(null);
  // 同じ教材が複数分野に対応する場合は統合する。表示順は元の配列順を維持する。
  // 職業はslugで重複排除し、同じ仕事のカードが複数回表示されるのを防ぐ。
  for (const field of fields) {
    const related = careers.filter(career => career.learningIds.includes(field.id));
    for (const { slug } of field.lessons) {
      const connection = connections[slug] ??= { fields: [], careers: [] };
      if (!connection.fields.some(item => item.id === field.id)) {
        connection.fields.push({ id: field.id, label: field.label });
      }
      for (const career of related) {
        if (!connection.careers.some(item => item.slug === career.slug)) {
          connection.careers.push({ slug: career.slug, name: career.name, title: career.entryTitle });
        }
      }
    }
  }
  return connections;
}
