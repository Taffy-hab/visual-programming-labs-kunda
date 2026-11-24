// ЭТАП 5: скриншоты настроек переменных, условия, HTTP Request и админки.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'exports/meta.json'), 'utf8'));
const BUILDER = meta.builderUrl || 'http://localhost:8080';
const shots = path.join(root, 'screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) { await sleep(1200); await page.screenshot({ path: path.join(shots, name), fullPage: true }); console.log('shot', name); }
async function clickAny(page, selectors) {
  for (const s of selectors) {
    const loc = page.locator(s).first();
    if (await loc.count() && await loc.isVisible().catch(() => false)) { await loc.click(); return s; }
  }
  return null;
}

(async () => {
  const opts = { viewport: { width: 1600, height: 1000 } };
  if (meta.authState && fs.existsSync(meta.authState)) opts.storageState = meta.authState;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext(opts);
  const page = await context.newPage();
  const editor = `${BUILDER}/typebots/${meta.typebotId}/edit`;

  await page.goto(editor, { waitUntil: 'networkidle' });
  await sleep(3000);
  console.log('editor title:', await page.title());

  const v = await clickAny(page, [
    'button:has-text("Variables")', '[aria-label*="Variables" i]', 'text=Переменные',
    'button:has-text("Переменные")',
  ]);
  console.log('variables selector:', v);
  await shot(page, '09-variables.png');

  const c = await clickAny(page, [
    '[data-testid*="condition" i]', 'text=Condition', '[aria-label*="Condition" i]',
  ]);
  console.log('condition selector:', c);
  await shot(page, '10-condition-config.png');

  const h = await clickAny(page, [
    '[data-testid*="webhook" i]', 'text=HTTP Request', 'text=Webhook', '[aria-label*="webhook" i]',
  ]);
  console.log('http selector:', h);
  await shot(page, '11-http-request.png');

  await page.goto(`${BUILDER}/typebots/${meta.typebotId}/results/analytics`, { waitUntil: 'networkidle' });
  await sleep(2000);
  await shot(page, '12-admin.png');

  console.log('✓ builder screenshots done');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
