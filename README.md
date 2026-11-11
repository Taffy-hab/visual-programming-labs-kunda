# Лабораторные работы по визуальному программированию

**Студент:** Кунда Иван
**Группа:** УИР-241
**Email:** kunda_iv_24@mf.grsu.by

Репозиторий содержит лабораторные работы по курсу «Визуальное программирование».

## Состав

| Работа | Тема | Ссылка |
|--------|------|--------|
| Лабораторная №4 | Автоматизация бизнес-процессов в n8n: базовые узлы и Redis | [lab4/docs/report.md](lab4/docs/report.md) |

## Лабораторная работа №4

Цель — освоить построение сценариев автоматизации в n8n: триггеры, узлы
обработки данных, ветвление, HTTP-запросы, расписание, а также работу с
внешним хранилищем Redis (запись, чтение, удаление, проверка существования).

Что внутри `lab4`:

- [`lab4/docs/report.md`](lab4/docs/report.md) — отчёт по работе;
- [`lab4/docs/redis.md`](lab4/docs/redis.md) — описание сценариев с Redis;
- `lab4/flows/` — экспортированные workflow в формате JSON;
- `lab4/screenshots/` — скриншоты каждого этапа.

### Быстрый старт

Вариант 1 — Docker (как в методичке):

```bash
docker compose up -d
```

Вариант 2 — без Docker (использован при выполнении работы, см. отчёт).
Нужны **два отдельных окна** — в каждом работает свой сервер, окна закрывать нельзя.

Проще всего — двойным кликом по файлам:

- `scripts\start-redis.cmd`
- `scripts\start-n8n.cmd`

Либо из PowerShell (в Windows по умолчанию действует политика `Restricted`,
поэтому нужен флаг `-ExecutionPolicy Bypass`):

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-redis.ps1
powershell -ExecutionPolicy Bypass -File .\scripts\start-n8n.ps1
```

n8n будет доступен по адресу <http://localhost:5678>, Redis — на `127.0.0.1:6379`.
Остановка — `Ctrl+C` в окне сервера или закрытие окна.

Параметры скриптов (порты, каталог данных) можно переопределить, например:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-n8n.ps1 -Port 5679
```
