@echo on
chcp 65001 >nul
setlocal
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0"

echo ==============================================
echo choose the fashion - PUBLIC DEBUG MODE
echo ==============================================
echo 현재 경로: %CD%
echo.

where node
where npm
where npx
echo.

echo [1] 로컬 서버 실행 확인(별도 창)
start "choose the fashion dev" cmd /k "%~dp0scripts\start-stylemate.bat"
timeout /t 6 >nul

echo.
echo [2] Cloudflare Tunnel 시도
echo 주소가 뜨는지 확인하세요.
npx --yes cloudflared tunnel --url http://localhost:3001 --no-autoupdate

if errorlevel 1 (
  echo.
  echo [3] Cloudflare 실패 -> localtunnel 시도
  npx --yes localtunnel --port 3001
)

echo.
echo 종료 코드: %errorlevel%
echo 이 창이 유지된 상태에서 에러를 확인하세요.
pause
