# Окружение выполнения лабораторной №5

| Компонент | Версия / значение |
|-----------|-------------------|
| ОС | Windows 11 (x64) |
| Node.js | 24.22.1 |
| npm | 11.19.1 |
| bun | 1.4.5 |
| Python | 3.12.4 |
| Git | 2.52.0.windows.1 |
| Playwright | 1.65.1 / Chromium 159.0.8154.6 |
| TypeBot | 3.18.0 (ветка `latest`, self-hosted, Manual deployment) |
| PostgreSQL | 16.16.0 (embedded-postgres, `127.0.0.1:5432`, БД `typebot`) |
| Builder | `http://localhost:8080` |
| Viewer | `http://127.0.0.1:8081/kunda-lab5-sdp-uir-241` (`NODE_ENV=development` для локального HTTP Request) |
| HTTP Request echo | `http://localhost:7788/typebot-event` |
| SMTP-ловушка | `127.0.0.1:1025` |

## Доказательство развёртывания

- Официальный compose: [`../selfhosted/docker-compose.yml`](../selfhosted/docker-compose.yml)
- Переменные окружения: [`../selfhosted/.env.example`](../selfhosted/.env.example)
- Лог webhook-сервера: [`../exports/webhook-log.txt`](../exports/webhook-log.txt)
- Лог SMTP: [`../exports/mail-log.txt`](../exports/mail-log.txt)

## Примечание о Docker

На машине Docker Desktop/WSL2 недоступен без прав администратора. Поэтому использован
официальный сценарий Manual deployment из репозитория TypeBot: исходники `latest`,
`bun install`, `bunx nx db:migrate prisma`, сборка и запуск builder/viewer через
`bunx nx`, а затем через прямой `next start` (nx-демон требует прав администратора).
Viewer запущен с `NODE_ENV=development`: SSRF-защита TypeBot 3.18 разрешает обращение
к `localhost` только в development-режиме, что необходимо для узла HTTP Request.
Compose-файл сохранён как эталон конфигурации и для повторного запуска на машине с Docker.
