// ЭТАП 4: сборка flow (Condition, Variable, HTTP Request, Buttons, Fallback, Theme)
// и экспорт JSON через REST API TypeBot.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const exportsDir = path.join(root, 'exports');
const meta = JSON.parse(fs.readFileSync(path.join(exportsDir, 'meta.json'), 'utf8'));
const BUILDER = meta.builderUrl || 'http://localhost:8080';
const GROUP = 'СДП-УИР-241';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:7788/typebot-event';
const PUBLIC_ID = process.env.LAB_PUBLIC_ID || 'kunda-lab5-sdp-uir-241';
const VIEWER_URL = process.env.VIEWER_URL || 'http://127.0.0.1:8081';

const id = () => randomUUID();
const text = (html) => ({
  id: id(),
  type: 'text',
  content: { html, plainText: html, richText: [{ type: 'p', children: [{ text: html }] }] },
});
const input = (variableId, placeholder) => ({
  id: id(),
  type: 'text input',
  options: {
    variableId,
    labels: { placeholder, button: 'Отправить' },
  },
});
const choice = (items) => ({
  id: id(),
  type: 'choice input',
  items: items.map((label) => ({ id: id(), content: label })),
  options: { buttonLabel: 'Выберите действие' },
});

const vName = id();
const vGroup = id();
const startEventId = id();
const replyEventId = id();

const blocks = {
  welcome: text(`Здравствуйте! Я бот лабораторной работы №5, фамилия Кунда, группа ${GROUP}`),
  askName: text('Как вас зовут?'),
  nameInput: input(vName, 'Введите имя'),
  askGroup: text('Ваша группа'),
  groupInput: input(vGroup, 'Например, СДП-УИР-241'),
  ownText: text(`Свой! Привет, {{user_name}}, ты из группы ${GROUP}. Отправляю событие в локальный webhook.`),
  foreignText: text(`Привет, {{user_name}}! Ты из группы {{user_group}} — это не ${GROUP}, поэтому ветка «чужой».`),
  question: text('Напишите ваш вопрос — я передам его преподавателю.'),
  admin: text('Связаться с админом: lab5-kunda@local.test'),
  fallback: text('Извините, я не понял ввод. Пожалуйста, начните диалог заново и укажите имя и группу.'),
};

const conditionBlock = {
  id: id(),
  type: 'Condition',
  items: [
    {
      id: id(),
      content: {
        logicalOperator: 'AND',
        comparisons: [{ id: id(), variableId: vGroup, comparisonOperator: 'Equal to', value: GROUP }],
      },
    },
    {
      id: id(),
      content: {
        logicalOperator: 'AND',
        comparisons: [{ id: id(), variableId: vGroup, comparisonOperator: 'Not equal', value: GROUP }],
      },
    },
  ],
};

const httpBlock = {
  id: id(),
  type: 'Webhook',
  options: {
    variablesForTest: [],
    responseVariableMapping: [],
    isAdvancedConfig: true,
    isCustomBody: true,
    isExecutedOnClient: false,
    timeout: 30,
    webhook: {
      method: 'POST',
      url: WEBHOOK_URL,
      body: `{\n  "name": "{{user_name}}",\n  "group": "{{user_group}}",\n  "branch": "свой"\n}`,
      queryParams: [],
      headers: [{ id: id(), key: 'Content-Type', value: 'application/json' }],
    },
  },
};

const ownButtons = choice(['Задать вопрос', 'Связаться с админом']);
const foreignButtons = choice(['Задать вопрос', 'Связаться с админом']);

const groups = [
  { id: id(), title: 'Приветствие', graphCoordinates: { x: 0, y: 0 }, blocks: [blocks.welcome] },
  { id: id(), title: 'Сбор имени', graphCoordinates: { x: 320, y: 0 }, blocks: [blocks.askName, blocks.nameInput] },
  { id: id(), title: 'Сбор группы', graphCoordinates: { x: 680, y: 0 }, blocks: [blocks.askGroup, blocks.groupInput] },
  { id: id(), title: 'Условие группы', graphCoordinates: { x: 1040, y: 0 }, blocks: [conditionBlock] },
  { id: id(), title: 'Ветка «свой»', graphCoordinates: { x: 1400, y: -240 }, blocks: [blocks.ownText, httpBlock, ownButtons] },
  { id: id(), title: 'Ветка «чужой»', graphCoordinates: { x: 1400, y: 300 }, blocks: [blocks.foreignText, foreignButtons] },
  { id: id(), title: 'Вопрос', graphCoordinates: { x: 1780, y: -340 }, blocks: [blocks.question] },
  { id: id(), title: 'Админ', graphCoordinates: { x: 1780, y: -100 }, blocks: [blocks.admin] },
  { id: id(), title: 'Fallback', graphCoordinates: { x: 1040, y: 620 }, blocks: [blocks.fallback] },
];
const [gWelcome, gName, gGroup, gCondition, gOwn, gForeign, gQuestion, gAdmin, gFallback] = groups.map((g) => g.id);

const edges = [];
const edge = (from, groupId, blockId) => {
  const e = { id: id(), from, to: { groupId } };
  if (blockId) e.to.blockId = blockId;
  edges.push(e);
  return e.id;
};
const link = (block, fromGroup, toGroup, toBlock) => {
  block.outgoingEdgeId = edge({ blockId: block.id }, toGroup, toBlock?.id);
};

link(blocks.welcome, gWelcome, gName, blocks.askName);
link(blocks.askName, gName, gName, blocks.nameInput);
link(blocks.nameInput, gName, gGroup, blocks.askGroup);
link(blocks.askGroup, gGroup, gGroup, blocks.groupInput);
link(blocks.groupInput, gGroup, gCondition, conditionBlock);
link(blocks.ownText, gOwn, gOwn, httpBlock);
link(httpBlock, gOwn, gOwn, ownButtons);
link(blocks.foreignText, gForeign, gForeign, foreignButtons);
conditionBlock.items[0].outgoingEdgeId = edge({ blockId: conditionBlock.id, itemId: conditionBlock.items[0].id }, gOwn, blocks.ownText.id);
conditionBlock.items[1].outgoingEdgeId = edge({ blockId: conditionBlock.id, itemId: conditionBlock.items[1].id }, gForeign, blocks.foreignText.id);
conditionBlock.outgoingEdgeId = edge({ blockId: conditionBlock.id }, gForeign, blocks.foreignText.id);
ownButtons.items[0].outgoingEdgeId = edge({ blockId: ownButtons.id, itemId: ownButtons.items[0].id }, gQuestion, blocks.question.id);
ownButtons.items[1].outgoingEdgeId = edge({ blockId: ownButtons.id, itemId: ownButtons.items[1].id }, gAdmin, blocks.admin.id);
foreignButtons.items[0].outgoingEdgeId = edge({ blockId: foreignButtons.id, itemId: foreignButtons.items[0].id }, gQuestion, blocks.question.id);
foreignButtons.items[1].outgoingEdgeId = edge({ blockId: foreignButtons.id, itemId: foreignButtons.items[1].id }, gAdmin, blocks.admin.id);

const flow = {
  version: '6.1',
  id: meta.typebotId,
  name: meta.typebotName,
  publicId: PUBLIC_ID,
  workspaceId: meta.workspaceId,
  icon: null,
  folderId: null,
  events: [
    { id: startEventId, outgoingEdgeId: edge({ eventId: startEventId }, gWelcome, blocks.welcome.id), graphCoordinates: { x: 0, y: 0 }, type: 'start' },
    { id: replyEventId, outgoingEdgeId: edge({ eventId: replyEventId }, gFallback, blocks.fallback.id), graphCoordinates: { x: 1040, y: 620 }, type: 'reply' },
  ],
  groups,
  edges,
  variables: [
    { id: vName, name: 'user_name', isSessionVariable: true },
    { id: vGroup, name: 'user_group', isSessionVariable: true },
  ],
  theme: {
    general: {
      font: { type: 'Google', family: 'Open Sans' },
      background: { type: 'Color', content: '#EEF2FF' },
      progressBar: { isEnabled: true, color: '#5B4BDB', backgroundColor: '#DDE3FF', placement: 'Top', thickness: 4, position: 'absolute' },
    },
    chat: {
      container: { maxWidth: '800px', maxHeight: '100%', backgroundColor: 'transparent', color: '#27272A', blur: 0, opacity: 1, shadow: 'md' },
      hostAvatar: { isEnabled: true, url: 'http://localhost:7788/logo.svg' },
      guestAvatar: { isEnabled: false },
      hostBubbles: { backgroundColor: '#5B4BDB', color: '#FFFFFF', blur: 0, opacity: 1, shadow: 'md', border: { thickness: 1, color: '#4637C4', roundeness: 'large', opacity: 1 } },
      guestBubbles: { backgroundColor: '#FFFFFF', color: '#27272A', blur: 0, opacity: 1, shadow: 'sm', border: { thickness: 1, color: '#C7D2FE', roundeness: 'large', opacity: 1 } },
      buttons: { backgroundColor: '#5B4BDB', color: '#FFFFFF', blur: 0, opacity: 1, shadow: 'sm', border: { thickness: 1, color: '#4637C4', roundeness: 'large', opacity: 1 } },
      inputs: { backgroundColor: '#FFFFFF', color: '#27272A', placeholderColor: '#9095A0', blur: 0, opacity: 1, shadow: 'sm', border: { thickness: 1, color: '#C7D2FE', roundeness: 'large', opacity: 1 } },
      roundness: 'medium',
      buttonsInput: { layout: 'wrap' },
    },
    customCss: '',
  },
  settings: {
    general: {
      isBrandingEnabled: false,
      isTypingEmulationEnabled: false,
      isInputPrefillEnabled: true,
      isHideQueryParamsEnabled: false,
      isNewResultOnRefreshEnabled: true,
      systemMessages: {
        invalidMessage: 'Извините, я не понял ввод. Напишите, пожалуйста, имя и группу ещё раз.',
        botClosed: 'Бот завершил диалог.',
        networkErrorTitle: 'Ошибка сети',
        networkErrorMessage: 'Не удалось связаться с сервером.',
      },
    },
    typingEmulation: { enabled: false, speed: 200, maxDelay: 1200, delayBetweenBubbles: 0.3, isDisabledOnFirstMessage: true },
    metadata: { title: 'Лабораторная №5 — Кунда', description: 'Чат-бот TypeBot: Кунда, СДП-УИР-241' },
    publicShare: { isEnabled: true },
    security: { allowedOrigins: [] },
  },
  resultsTablePreferences: null,
  selectedThemeTemplateId: null,
};

const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${meta.apiToken}` };
const patch = await fetch(`${BUILDER}/api/v1/typebots/${meta.typebotId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ typebot: flow, overwrite: true }),
});
const patchText = await patch.text();
fs.writeFileSync(path.join(exportsDir, 'flow-draft.json'), JSON.stringify(flow, null, 2), 'utf8');
if (!patch.ok) throw new Error(`PATCH failed ${patch.status}: ${patchText.slice(0, 1500)}`);

const publish = await fetch(`${BUILDER}/api/v1/typebots/${meta.typebotId}/publish`, { method: 'POST', headers });
const publishText = await publish.text();
if (!publish.ok) throw new Error(`publish failed ${publish.status}: ${publishText.slice(0, 800)}`);

const getRes = await fetch(`${BUILDER}/api/v1/typebots/${meta.typebotId}`, { headers });
const getText = await getRes.text();
if (!getRes.ok) throw new Error(`GET failed ${getRes.status}: ${getText.slice(0, 800)}`);
const saved = JSON.parse(getText).typebot || JSON.parse(getText);
fs.writeFileSync(path.join(exportsDir, 'flow-01-Kunda-typebot.json'), JSON.stringify(saved, null, 2), 'utf8');
meta.publicId = saved.publicId || PUBLIC_ID;
meta.viewerUrl = `${VIEWER_URL}/${meta.publicId}`;
fs.writeFileSync(path.join(exportsDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
console.log('✓ flow saved; publicId =', meta.publicId, '; viewer =', meta.viewerUrl);
