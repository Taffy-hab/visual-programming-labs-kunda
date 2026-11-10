# Запуск n8n без Docker (через npm).
# Используется, т.к. Docker на машине недоступен (нет прав администратора / WSL2).
#
# Установка (один раз):
#   cd $env:LOCALAPPDATA\Temp\opencode\n8n-runtime
#   npm install n8n
#
# Данные n8n хранятся ВНЕ OneDrive: живая SQLite-база внутри синхронизируемой
# папки может быть повреждена синхронизацией OneDrive.

param(
    [int]$Port = 5678,
    [string]$RuntimeDir = "$env:LOCALAPPDATA\Temp\opencode\n8n-runtime",
    [string]$UserFolder = "$env:LOCALAPPDATA\Temp\opencode\n8n-data"
)

$bin = Join-Path $RuntimeDir "node_modules\n8n\bin\n8n"
if (-not (Test-Path $bin)) {
    throw "n8n не установлен в $RuntimeDir. Выполните: npm install n8n"
}

New-Item -ItemType Directory -Force -Path $UserFolder | Out-Null

$env:N8N_USER_FOLDER       = $UserFolder
$env:N8N_PORT              = $Port
$env:N8N_HOST              = "localhost"
$env:N8N_PROTOCOL          = "http"
$env:N8N_SECURE_COOKIE     = "false"
$env:N8N_DIAGNOSTICS_ENABLED = "false"
$env:GENERIC_TIMEZONE      = "Europe/Minsk"
$env:N8N_RUNNERS_ENABLED   = "false"

Write-Host "n8n data: $UserFolder"
Write-Host "Открывайте http://localhost:$Port"

node $bin start
