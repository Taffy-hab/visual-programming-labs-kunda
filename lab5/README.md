# Лабораторная работа №5 — Чат-боты (TypeBot, self-hosted)

**Студент:** Кunda (Кунда)  
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

Builder: <http://localhost:8080>, viewer: <http://localhost:8081>.
