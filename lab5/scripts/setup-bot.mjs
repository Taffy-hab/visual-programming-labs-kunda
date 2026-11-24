// ЭТАП 3: автоматическая регистрация, workspace и бот через Playwright.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const shots = path.join(root, 'screenshots');
const exportsDir = path.join(root, 'exports');
fs.mkdirSync(shots, { recursive: true });
fs.mkdirSync(exportsDir, { recursive: true });

const BUILDER = process.env.BUILDER_URL || 'http://localhost:8080';
const EMAIL = process.env.LAB_EMAIL || 'lab5-kunda@local.test';
const WORKSPACE = process.env.LAB_WORKSPACE || 'lab5-Kunda-СДП-УИР-241';
const BOT = process.env.LAB_BOT || 'lab5-Kunda-bot';
const MAIL_LOG = path.join(exportsDir, 'mail-log.txt');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForCode(since) {
  const sinceMs = new Date(since).getTime();
  for (let i = 0; i < 120; i++) {
    if (fs.existsSync(MAIL_LOG)) {
      const lines = fs.readFileSync(MAIL_LOG, 'utf8').trim().split('\n').filter(Boolean);
      for (const line of lines.reverse()) {
        try {
          const entry = JSON.parse(line);
          const atMs = new Date(entry.at).getTime();
          if (entry.to?.includes(EMAIL) && entry.code && atMs >= sinceMs) return entry.code;
        } catch {}
      }
    }
    await sleep(500);
  }
  throw new Error('Новый код подтверждения не найден в mail-log.txt');
}

async function api(context, method, url, token, body) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await context.request.fetch(new URL(url, BUILDER).toString(), {
    method,
    headers,
    data: body,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok()) throw new Error(`${method} ${url}: ${res.status()} ${text.slice(0, 500)}`);
  return json;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('[browser]', m.text().slice(0, 200)); });

  console.log('→ регистрация', EMAIL);
  const startedAt = new Date(Date.now() - 2000).toISOString();
  await page.goto(`${BUILDER}/register`, { waitUntil: 'domcontentloaded' });
  await page.locator('input[name="email"]').fill(EMAIL);
  await page.getByRole('button', { name: /submit|continue|send|email|отправить|продолжить/i }).first().click();

  const code = await waitForCode(startedAt);
  console.log('→ код из письма:', code);
  await page.waitForSelector('input[data-input-otp], input[maxlength="6"], input[maxlength="1"]', { state: 'visible', timeout: 30000 });
  const otpSingle = page.locator('input[data-input-otp], input[maxlength="6"]');
  if (await otpSingle.count()) {
    await otpSingle.first().waitFor({ timeout: 30000 });
    await otpSingle.first().fill(code);
  } else {
    const otp = page.locator('input[maxlength="1"]');
    await otp.first().waitFor({ timeout: 30000 });
    const slots = Math.min(await otp.count(), 6);
    for (let i = 0; i < slots; i++) await otp.nth(i).fill(code[i]);
  }
  await page.waitForURL(/\/typebots/, { timeout: 60000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(shots, '01-registration.png'), fullPage: true });

  console.log('→ создание API-токена');
  const tokenResp = await api(context, 'POST', '/api/v1/users/me/api-tokens', null, { name: 'lab5-playwright' });
  const token = tokenResp.apiToken?.token || tokenResp.token;
  if (!token) throw new Error('Не получен API-токен: ' + JSON.stringify(tokenResp));

  console.log('→ workspace');
  const workspacesResp = await api(context, 'GET', '/api/v1/workspaces', token);
  const workspaces = workspacesResp.workspaces || workspacesResp;
  let workspace = workspaces.find((w) => w.name === WORKSPACE);
  if (!workspace && workspaces.length) {
    const renamed = await api(context, 'PATCH', `/api/v1/workspaces/${workspaces[0].id}`, token, { name: WORKSPACE });
    workspace = { ...workspaces[0], ...(renamed.workspace || renamed) };
  }
  if (!workspace) {
    const created = await api(context, 'POST', '/api/v1/workspaces', token, { name: WORKSPACE });
    workspace = created.workspace || created;
  }
  await page.goto(`${BUILDER}/w/${workspace.id}/typebots`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(shots, '02-workspace.png'), fullPage: true });

  console.log('→ бот');
  const botsResp = await api(context, 'GET', `/api/v1/typebots?workspaceId=${encodeURIComponent(workspace.id)}`, token);
  let bot = (botsResp.typebots || []).find((b) => b.name === BOT);
  if (!bot) {
    const created = await api(context, 'POST', '/api/v1/typebots', token, {
      workspaceId: workspace.id,
      typebot: { name: BOT },
    });
    bot = created.typebot || created;
  }
  const editorUrl = `${BUILDER}/typebots/${bot.id}/edit`;
  await page.goto(editorUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(6000);
  await page.screenshot({ path: path.join(shots, '03-bot-created.png'), fullPage: true });

  const statePath = path.join(process.env.TEMP || process.env.TMPDIR || exportsDir, 'typebot-auth-state.json');
  await context.storageState({ path: statePath });
  const meta = { email: EMAIL, workspaceId: workspace.id, workspaceName: workspace.name, typebotId: bot.id, typebotName: bot.name, builderUrl: BUILDER, editorUrl, apiToken: token, authState: statePath };
  fs.writeFileSync(path.join(exportsDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
  console.log('✓ setup done', JSON.stringify({ workspaceId: workspace.id, typebotId: bot.id }));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
