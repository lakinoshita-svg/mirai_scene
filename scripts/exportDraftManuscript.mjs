import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { exportDraftDocuments } from './lib/draftReviewDocuments.mjs';

export { exportDraftDocuments };

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = exportDraftDocuments(process.argv[2]);
    console.log(result.documents.map(file => path.join(result.directory, file)).join('\n'));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
