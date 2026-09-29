import type { APIRoute } from 'astro';
import { getIntegrationLinks } from '../../lib/integration-links';
export const GET: APIRoute = ({ site }) => {
  return new Response(JSON.stringify(getIntegrationLinks(site), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
