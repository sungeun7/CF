@echo off
chcp 65001 >nul
setlocal
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0.."
title choose the fashion — npm run dev
echo ========================================
echo   choose the fashion  http://localhost:3000
echo ========================================
echo.
echo [정상 동작] "Ready" 또는 "Ready in ..." 가 보이면 서버 준비가 끝난 것입니다.
echo            그 다음에도 새 줄이 안 나오는 것이 맞습니다. 서버는 요청을 기다리며
echo            이 창을 닫기 전까지 계속 실행됩니다.
echo.
echo            브라우저에서 위 주소로 접속하세요. 10초 뒤 자동으로 열립니다.
echo            서버를 끄려면 이 창에서 Ctrl+C 를 누르세요.
echo.
start /B powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 10; Start-Process 'http://localhost:3000'"
npm run dev -- -p 3000
if errorlevel 1 pause
