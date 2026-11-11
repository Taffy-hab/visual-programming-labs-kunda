@echo off
title Redis - lab4 (do not close this window)
echo Starting Redis on port 6379
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-redis.ps1"
echo.
echo Redis stopped.
pause
