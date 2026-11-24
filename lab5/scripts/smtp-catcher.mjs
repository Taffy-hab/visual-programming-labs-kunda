// Локальный SMTP-сервер: ловит письма с кодом входа TypeBot и пишет их в exports/mail-log.txt.
import { SMTPServer } from 'smtp-server';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile = path.resolve(__dirname, '../exports/mail-log.txt');

const server = new SMTPServer({
  authOptional: true,
  disabledCommands: ['AUTH', 'STARTTLS'],
  allowInsecureAuth: true,
  onData(stream, session, callback) {
    let raw = '';
    stream.on('data', (c) => (raw += c));
    stream.on('end', () => {
      const code =
        raw.match(/<code[^>]*>\s*(\d{6})\s*<\/code>/i)?.[1] ??
        raw.match(/(?:token|code)=(\d{6})/i)?.[1] ??
        raw.match(/\b\d{6}\b/)?.[0] ??
        null;
      fs.appendFileSync(
        logFile,
        JSON.stringify({ at: new Date().toISOString(), to: session.envelope.rcptTo?.[0]?.address, code, raw }) + '\n',
        'utf8',
      );
      console.log('[smtp] code for', session.envelope.rcptTo?.[0]?.address, '=', code);
      callback(null, 'Message queued');
    });
  },
});

server.listen(1025, '127.0.0.1', () => console.log('SMTP_READY 127.0.0.1:1025'));
