import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { packageDraftContent } from './lib/contentReviewPackage.mjs';

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = packageDraftContent(process.argv[2]);
    console.log(result.zipPath);
    console.log(`${result.manifest.experienceCount}体験・${result.manifest.fileCount}ファイルを同梱し、ZIPの内容を照合しました。`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
