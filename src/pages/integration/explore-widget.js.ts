import type { APIRoute } from 'astro';
import { learningLinks } from '../../lib/learning-links';
import { sitePath } from '../../lib/paths';

// A classic script: no fetch/CORS dependency on the legacy lesson site.
export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Astro site is required for integration links');
  const links: Record<string, { label: string; url: string }[]> = {};
  for (const field of learningLinks) for (const lesson of field.lessons) {
    (links[lesson.slug] ??= []).push({ label: field.label, url: new URL(sitePath(`explore/${field.id}/`), site).href });
  }
  const script = `(() => {
    const script = document.currentScript;
    if (!script) return;
    const slug = script.dataset.lesson || new URLSearchParams(location.search).get('slug');
    const entries = ${JSON.stringify(links)}[slug];
    if (!entries) return;
    const section = document.createElement('section');
    section.className = 'mirai-scene-links';
    const heading = document.createElement('h2');
    heading.textContent = 'この学びにつながる仕事を体験しよう';
    section.append(heading);
    const list = document.createElement('ul');
    entries.forEach(entry => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.label + 'のミライシーンへ';
      item.append(link); list.append(item);
    });
    section.append(list);
    script.after(section);
  })();`;
  return new Response(script, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
};
