import { buildOperationsManual } from './lib/operationsManual.mjs';

const manual = buildOperationsManual(process.cwd());
console.log(`運用マニュアル: ${manual.contentCount}体験・${manual.sceneCount}シーン`);
