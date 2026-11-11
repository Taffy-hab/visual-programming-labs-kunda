# Запуск Redis без Docker (портативная сборка для Windows).
# Используется, т.к. Docker на машине недоступен.
#
# Скачивание (один раз):
#   https://github.com/tporadowski/redis/releases -> Redis-x64-5.0.14.1.zip
#   распаковать в $env:LOCALAPPDATA\Temp\opencode\redis-win
#
# Запуск (PowerShell блокирует .ps1 по умолчанию):
#   powershell -ExecutionPolicy Bypass -File .\scripts\start-redis.ps1
# или двойным кликом по scripts\start-redis.cmd

param(
    [int]$Port = 6379,
    [string]$RedisDir = "$env:LOCALAPPDATA\Temp\opencode\redis-win"
)

$exe = Join-Path $RedisDir "redis-server.exe"
if (-not (Test-Path $exe)) {
    throw "redis-server.exe не найден в $RedisDir. Скачайте сборку и распакуйте туда."
}

Write-Host "Redis запускается на порту $Port. Окно закрывать нельзя — это и есть сервер." -ForegroundColor Green
Write-Host "Остановить: Ctrl+C или закрыть окно." -ForegroundColor DarkGray
Write-Host ""

& $exe --port $Port --save 900 1
