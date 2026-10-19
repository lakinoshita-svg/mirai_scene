import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyContent} from './contentDelivery.mjs';
const [target,...options]=process.argv.slice(2);
if(!target||options.some(option=>option!=='--dry-run')) throw new Error('node installContent.mjs "進路ナビのルート" [--dry-run]');
console.log(JSON.stringify(applyContent(path.dirname(fileURLToPath(import.meta.url)),target,{dryRun:options.includes('--dry-run')}),null,2));
