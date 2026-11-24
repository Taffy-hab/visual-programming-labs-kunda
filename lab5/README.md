# Лабораторная работа №5 — Чат-боты (TypeBot, self-hosted)

**Студент:** Кунда  
**Группа:** СДП-УИР-241  
**Трек:** C — TypeBot, self-hosted версия

## Содержимое

| Путь | Назначение |
|------|------------|
| `docs/report.md` | Отчёт по лабораторной работе |
| `docs/ENVIRONMENT.md` | Версии окружения, порты, доказательство развёртывания |
| `selfhosted/docker-compose.yml` | Официальный compose-файл развёртывания TypeBot |
| `scripts/` | Скрипты Playwright для создания бота и прогона диалога |
| `exports/flow-01-Kunda-typebot.json` | Экспортированный JSON flow |
| `exports/webhook-log.txt` | Лог локального echo-сервера (HTTP Request) |
| `screenshots/` | Реальные скриншоты работающего инстанса |

## Быстрый старт

```bash
# Docker (официальный способ)
docker compose -f lab5/selfhosted/docker-compose.yml up -d

# Альтернативный запуск без Docker описан в docs/ENVIRONMENT.md
```

Builder: <http://localhost:8080>, viewer: <http://127.0.0.1:8081/kunda-lab5-sdp-uir-241>.

> Для узла HTTP Request к локальному webhook-серверу viewer запущен с `NODE_ENV=development`
> (иначе встроенная SSRF-защита TypeBot блокирует `localhost`).

### Воспроизведение сценария

```bash
node lab5/scripts/smtp-catcher.mjs      # OTP-почта, порт 1025
node lab5/scripts/webhook-server.mjs   # HTTP Request, порт 7788
node lab5/scripts/setup-bot.mjs        # регистрация, workspace, бот
node lab5/scripts/build-flow.mjs       # сборка и экспорт flow
node lab5/scripts/run-dialog.mjs       # диалог и скриншоты
node lab5/scripts/capture-builder.mjs  # скриншоты настроек и админки
```
