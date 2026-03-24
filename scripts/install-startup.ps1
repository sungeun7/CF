# choose the fashion을 Windows 시작 프로그램에 등록합니다 (로그온 시 개발 서버 실행).
$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$bat = Join-Path $PSScriptRoot "start-stylemate.bat"
if (-not (Test-Path $bat)) {
    throw "Not found: $bat"
}

$startup = [Environment]::GetFolderPath("Startup")
$lnkPath = Join-Path $startup "choose the fashion.lnk"

$shell = New-Object -ComObject WScript.Shell
$sc = $shell.CreateShortcut($lnkPath)
$sc.TargetPath = $bat
$sc.WorkingDirectory = $projectRoot
$sc.Description = "choose the fashion Next.js dev server (npm run dev)"
$sc.WindowStyle = 1
$sc.Save()

Write-Host "등록 완료: $lnkPath"
