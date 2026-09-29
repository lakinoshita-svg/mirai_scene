import { defineConfig } from 'astro/config';

// 公開先の設定。GitHub Pagesでは /mirai_scene/ が必要。ルート公開時だけ ASTRO_BASE=/ を指定する。
// baseは画像・内部リンク、siteは探究側へ渡す絶対URLに影響する。変更後は両サイトを再ビルドする。
export default defineConfig({
  output: 'static',
  site: 'https://lakinoshita-svg.github.io',
  base: process.env.ASTRO_BASE || '/mirai_scene/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
