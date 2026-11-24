// ЭТАП 5: прогон диалога по веткам «свой»/«чужой» + скриншоты из работающего viewer.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const meta = JSON.parse(fs.readFileSync(path.join(root, 'exports/meta.json'), 'utf8'));
const VIEWER = process.env.VIEWER_URL || 'http://127.0.0.1:8081';
const shots = path.join(root, 'screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (page, name) => {
  await sleep(700);
  await page.screenshot({ path: path.join(shots, name), fullPage: true });
  console.log('shot', name);
};
const send = async (page, value) => {
  const box = page.getByRole('textbox').last();
  await box.fill(value);
  await box.press('Enter');
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const url = `${VIEWER}/${meta.publicId}`;

  // Ветка «свой»
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.getByText('Здравствуйте! Я бот лабораторной работы №5').waitFor({ timeout: 30000 });
  await shot(page, '04-dialog-step1.png');

  await page.getByText('Как вас зовут?').waitFor({ timeout: 30000 });
  await send(page, 'Иван');
  await page.getByText('Ваша группа').waitFor({ timeout: 30000 });
  await shot(page, '05-dialog-step2.png');

  await send(page, 'СДП-УИР-241');
  await page.getByText('Свой! Привет, Иван').waitFor({ timeout: 30000 });
  await shot(page, '06-condition-true.png');

  const ask = page.getByRole('button', { name: 'Задать вопрос' });
  await ask.waitFor({ timeout: 30000 });
  await ask.click();
  await page.getByText('Напишите ваш вопрос').waitFor({ timeout: 30000 });
  await shot(page, '08-final.png');

  // Ветка «чужой» — новая сессия
  const page2 = await context.newPage();
  await page2.goto(url, { waitUntil: 'networkidle' });
  await page2.getByText('Как вас зовут?').waitFor({ timeout: 30000 });
  await send(page2, 'Петр');
  await page2.getByText('Ваша группа').waitFor({ timeout: 30000 });
  await send(page2, 'ДРУГАЯ-ГРУППА');
  await page2.getByText('это не СДП-УИР-241').waitFor({ timeout: 30000 });
  await shot(page2, '07-condition-false.png');

  console.log('✓ dialog done');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
