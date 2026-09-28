import { defineConfig } from 'astro/config';

// GitHub Pages is the default; set ASTRO_BASE=/ for root-hosted deployments.
export default defineConfig({
  output: 'static',
  site: 'https://lakinoshita-svg.github.io',
  base: process.env.ASTRO_BASE || '/mirai_scene/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
