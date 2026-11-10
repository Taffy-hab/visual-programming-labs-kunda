# Запуск Redis без Docker (портативная сборка для Windows).
# Используется, т.к. Docker на машине недоступен.
#
# Скачивание (один раз):
#   https://github.com/tporadowski/redis/releases -> Redis-x64-5.0.14.1.zip
#   распаковать в $env:LOCALAPPDATA\Temp\opencode\redis-win

param(
    [int]$Port = 6379,
    [string]$RedisDir = "$env:LOCALAPPDATA\Temp\opencode\redis-win"
)

$exe = Join-Path $RedisDir "redis-server.exe"
if (-not (Test-Path $exe)) {
    throw "redis-server.exe не найден в $RedisDir. Скачайте сборку и распакуйте туда."
}

Write-Host "Запуск Redis на порту $Port ..."
& $exe --port $Port --save "" --appendonly no
