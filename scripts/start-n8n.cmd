@echo off
title n8n - lab4 (do not close this window)
echo Starting n8n on http://localhost:5678
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-n8n.ps1"
echo.
echo n8n stopped.
pause
