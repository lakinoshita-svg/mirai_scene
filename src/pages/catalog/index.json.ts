import { getCareers } from '../../lib/careers';
// 一覧専用の軽量データ。設問・解説は詳細ページだけに出力する。
export async function GET() {
  const careers = await getCareers();
  return new Response(JSON.stringify(careers.map(({ slug, name, category, cardTheme, entryTitle, description, learningIds }) =>
    ({ slug, name, category, cardTheme, entryTitle, description, learningIds }))), { headers: { 'Content-Type': 'application/json' } });
}
