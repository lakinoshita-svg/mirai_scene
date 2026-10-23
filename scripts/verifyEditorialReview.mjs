import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { verifyEditorialReview } from './lib/editorialReview.mjs';

// 既存の呼び出し元も同じ検証関数を参照する。
export { verifyEditorialReview };

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { counts } = verifyEditorialReview(process.argv[2]);
    console.log(`${counts.experiences}体験・${counts.scenes}シーン・${counts.options}回答：確認記録と原稿が一致しています。内容の正確さ・独立レビュー・公開承認を保証する検証ではありません。`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
