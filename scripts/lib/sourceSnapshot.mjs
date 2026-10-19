import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const digest = data => crypto.createHash('sha256').update(data).digest('hex');
// 生成物やGit状態は含めず、ビルド入力と実行環境だけを照合する。
export function sourceSnapshot(root) {
  const files = {};
  const visit = relative => {
    const full = path.join(root, relative);
    if (!fs.existsSync(full)) return;
    if (fs.statSync(full).isDirectory()) {
      for (const name of fs.readdirSync(full).sort()) visit(`${relative}/${name}`);
    } else files[relative] = digest(fs.readFileSync(full));
  };
  for (const relative of ['src', 'public', 'scripts', 'tests', 'docs', 'config', 'integrations/shinronavi/templates', 'integrations/shinronavi/README.md', 'integrations/shinronavi/VALIDATION.md', 'package.json', 'package-lock.json', 'pnpm-lock.yaml', 'astro.config.mjs', 'tsconfig.json']) visit(relative);
  for (const name of fs.readdirSync(root).filter(name => /^\.env(?:\.|$)/.test(name)).sort()) visit(name);
  const environment = Object.fromEntries(['ASTRO_SITE', 'ASTRO_BASE', 'INQUIRY_BASE_URL', 'PUBLIC_REGION_API_URL'].map(key => [key, process.env[key] || '']));
  return {sha256: digest(JSON.stringify({files, environment, node: process.version})), files};
}

// 原稿とシーン画像以外の実装・設定が違う場合は一式で導入する。
export function runtimeHash(snapshot) {
  const entries=Object.entries(snapshot.files).filter(([file])=>
    (file.startsWith('src/')&&!file.startsWith('src/content/careers/')) ||
    (file.startsWith('public/')&&!file.startsWith('public/assets/scenes/')) ||
    file.startsWith('integrations/shinronavi/templates/') ||
    file.startsWith('scripts/') ||
    ['astro.config.mjs','package.json','pnpm-lock.yaml','package-lock.json'].includes(file) || file.startsWith('.env'));
  return digest(JSON.stringify({entries,regionApi:process.env.PUBLIC_REGION_API_URL||'',node:process.version}));
}

export function approvalErrors(root, approvals) {
  const directory = path.join(root, 'src/content/careers');
  const errors = [];
  const ids = new Set();
  for (const file of fs.readdirSync(directory).filter(file => file.endsWith('.json'))) {
    const raw = fs.readFileSync(path.join(directory, file));
    const {slug} = JSON.parse(raw);
    ids.add(slug);
    const approval = approvals[slug];
    if (!approval || approval.sha256 !== digest(raw) || !approval.approvedBy?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(approval.approvedAt || '') || !approval.scope?.trim()) errors.push(`${slug}: 対象原稿に一致する公開承認が必要です`);
  }
  for (const id of Object.keys(approvals)) if (!ids.has(id)) errors.push(`${id}: 公開元にない承認IDです`);
  return errors;
}
