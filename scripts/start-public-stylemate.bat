@echo off
chcp 65001 >nul
setlocal
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0.."
title choose the fashion — public (HTTPS)

echo ==============================================
echo   choose the fashion  PUBLIC MODE (HTTPS)
echo ==============================================
echo.
echo 1) 새 창에서 로컬 서버를 실행합니다. (http://localhost:3001)
echo 2) 현재 창에서 HTTPS 공개 주소를 생성합니다.
echo.
echo [중요] 앱 설치(PWA)는 HTTPS 주소에서만 가능합니다.
echo.

start "choose the fashion dev" cmd /k "%~dp0start-stylemate.bat"
timeout /t 6 >nul

where npx >nul 2>nul
if errorlevel 1 (
  echo [오류] npx를 찾지 못했습니다. Node.js 설치를 확인해 주세요.
  pause
  exit /b 1
)

echo.
echo [1차] Cloudflare Tunnel 실행...
echo 주소가 뜨면 그 HTTPS 주소를 사용하세요. (예: https://xxxx.trycloudflare.com)
echo 종료하려면 Ctrl+C 를 누르세요.
echo.
npx --yes cloudflared tunnel --url http://localhost:3001 --no-autoupdate

if errorlevel 1 (
  echo.
  echo [안내] Cloudflare Tunnel 실패. localtunnel로 재시도합니다.
  echo [2차] localtunnel 실행...
  echo 주소가 뜨면 그 HTTPS 주소를 사용하세요. (예: https://xxxx.loca.lt)
  echo.
  npx --yes localtunnel --port 3001
)

if errorlevel 1 (
  echo.
  echo 터널 생성에 실패했습니다.
  echo 1) 방화벽/VPN을 잠시 끄고 다시 시도
  echo 2) 다른 네트워크에서 재시도
  echo 3) powershell에서 직접 실행:
  echo    npx --yes cloudflared tunnel --url http://localhost:3001 --no-autoupdate
  pause
)
