import { defineConfig } from 'astro/config';

// e.g. ASTRO_BASE=/mirai-scene/ for a subdirectory on the parent website.
export default defineConfig({
  output: 'static',
  base: process.env.ASTRO_BASE || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
