import type { APIRoute } from 'astro';
import { getIntegrationLinks } from '../../lib/integrationLinks';

// A classic script: no fetch/CORS dependency on the legacy lesson site.
export const GET: APIRoute = ({ site }) => {
  const links: Record<string, { label: string; url: string }[]> = Object.create(null);
  for (const link of getIntegrationLinks(site)) {
    (links[link.lessonSlug] ??= []).push({ label: link.label, url: link.miraiUrl });
  }
  const script = `(() => {
    const script = document.currentScript;
    if (!script) return;
    const slug = script.dataset.lesson || new URLSearchParams(location.search).get('slug');
    const links = ${JSON.stringify(links)};
    if (!Object.prototype.hasOwnProperty.call(links, slug)) return;
    const entries = links[slug];
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
      link.textContent = entry.label;
      item.append(link); list.append(item);
    });
    section.append(list);
    script.after(section);
  })();`;
  return new Response(script, { headers: { 'Content-Type': 'application/javascript; charset=utf-8' } });
};
