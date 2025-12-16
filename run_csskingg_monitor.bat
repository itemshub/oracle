@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ================== 配置 ==================
set "NODE_EXE=node.exe"
set "NODE_SCRIPT=monitor\csgo_skin_gg_monitor.js"

set TIMEOUT_SECONDS=3600
set SLEEP_SECONDS=3600

set "CHROME_PROFILE=chrome_profile"
REM ==========================================

:MAIN_LOOP
echo.
echo [%date% %time%] ===== New cycle =====

REM ---------- 1. 先杀 chrome ----------
echo [%date% %time%] Killing chrome.exe ...
taskkill /IM chrome.exe /F >nul 2>&1

REM ---------- 2. 清理 chrome_profile ----------
if exist "%CHROME_PROFILE%" (
    echo [%date% %time%] Removing %CHROME_PROFILE% ...
    rmdir /s /q "%CHROME_PROFILE%" >nul 2>&1
)

REM ---------- 3. 等待 10 秒 ----------
echo [%date% %time%] Waiting 10 seconds after cleanup...
timeout /t 10

REM ---------- 4. 启动 node ----------
echo [%date% %time%] Starting node process...
start "" /B "%NODE_EXE%" "%NODE_SCRIPT%"

REM ---------- 5. 计时监听 ----------
set /a ELAPSED=0

:WATCH_LOOP
REM 检查 node + 脚本 是否仍在运行
tasklist /V | findstr /I "%NODE_EXE%" | findstr /I "%NODE_SCRIPT%" >nul
if errorlevel 1 (
    echo [%date% %time%] Node process exited normally.
    goto SLEEP
)

REM 超时 → kill node
if !ELAPSED! GEQ %TIMEOUT_SECONDS% (
    echo [%date% %time%] Timeout reached, killing node process...
    taskkill /IM "%NODE_EXE%" /F >nul 2>&1
    goto SLEEP
)

timeout /t 1
set /a ELAPSED+=1
goto WATCH_LOOP


:SLEEP
echo [%date% %time%] Sleeping %SLEEP_SECONDS% seconds...
timeout /t %SLEEP_SECONDS%
goto MAIN_LOOP
