import fs from 'node:fs';
import path from 'node:path';

const assetPattern = /^assets\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|svg)$/;
const assertAssetPath = src => {
  if (typeof src !== 'string' || !assetPattern.test(src)) throw new Error(`下書きの画像パスが不正です: ${src}`);
};

// 原稿一覧は drafts/<batch>/ に置く。ZIPでもpublicとの相対位置を保つ。
export function draftAssetHref(src) {
  assertAssetPath(src);
  return `../../public/${src}`;
}

export function collectDraftAssets(batch, root) {
  const sources = new Set(batch.manuscripts.flatMap(manuscript => [
    manuscript.image?.src,
    ...manuscript.scenes.flatMap(scene => [scene.image?.src, ...(scene.comparison || []).map(image => image.src)]),
  ]).filter(src => src !== undefined));
  return [...sources].sort().map(src => {
    assertAssetPath(src);
    const sourcePath = path.join(root, 'public', src);
    const relative = path.relative(fs.realpathSync(path.join(root, 'public')), fs.realpathSync(sourcePath));
    if (path.isAbsolute(relative) || relative.startsWith('..' + path.sep)) throw new Error(`public外の画像は使えません: ${src}`);
    if (!fs.statSync(sourcePath).isFile()) throw new Error(`画像ファイルがありません: ${src}`);
    return { path: `public/${src}`, sourcePath };
  });
}
