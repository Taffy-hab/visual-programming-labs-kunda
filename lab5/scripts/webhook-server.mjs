// Локальный echo-сервер для узла HTTP Request.
// Пишет каждый запрос в lab5/exports/webhook-log.txt и отвечает JSON.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.resolve(__dirname, '../exports/webhook-log.txt');
const logoFile = path.resolve(__dirname, '../exports/logo.svg');
const port = Number(process.env.WEBHOOK_PORT || 7788);

http
  .createServer((req, res) => {
    if (req.url === '/logo.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Access-Control-Allow-Origin': '*' });
      res.end(fs.readFileSync(logoFile));
      return;
    }
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const entry = {
        at: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: { 'content-type': req.headers['content-type'] || null },
        body: body ? (() => { try { return JSON.parse(body); } catch { return body; } })() : null,
      };
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n', 'utf8');
      console.log('[webhook]', JSON.stringify(entry));
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true, receivedAt: entry.at, echo: entry.body }));
    });
  })
  .listen(port, '0.0.0.0', () => console.log(`WEBHOOK_READY http://localhost:${port}`));
