import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildContentInventory } from './lib/contentInventory.mjs';

export { buildContentInventory };

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const { inventory, output } = buildContentInventory();
    const { experiences, occupations, categories, published, drafts, preview } = inventory.summary;
    console.log(`${experiences}体験 / ${occupations}職種 / ${categories}分野（公開元${published}・下書き${drafts}・プレビュー設定${preview ?? '要確認'}）`);
    console.log(`運営一覧: ${output}`);
    for (const issue of inventory.issues) console.log(`要確認: ${issue.target}: ${issue.message}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
