@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ========= 配置部分 =========
set "NODE_CMD=node ./monitor/amm_monitor.js"
set "TIMEOUT_SECONDS=3600"
set "SLEEP_SECONDS=3600"
REM ============================

:LOOP
echo [%date% %time%] Starting new cycle...

REM 启动 node main.js
REM —— 使用 wmic 创建进程并获取 PID ——

set "pid="

for /f "tokens=2 delims==; " %%i in ('
  wmic process call create "%NODE_CMD%" ^| find "ProcessId"
') do (
  set "pid=%%i"
)

if not defined pid (
  echo Failed to start node process.
  goto NEXT_CYCLE
)

echo Started process (PID=%pid%)

REM ------ 等待进程，最多等 TIMEOUT_SECONDS 秒 ------
set /a waited=0

:WAIT_LOOP
REM 检查进程是否还在运行
tasklist /FI "PID eq %pid%" 2>nul | find "%pid%" >nul
if errorlevel 1 (
    echo Process ended normally.
    goto NEXT_CYCLE
)

REM 如果超过最大等待时间 → 强杀
if !waited! GEQ %TIMEOUT_SECONDS% (
    echo Timeout reached! Killing process (PID=%pid%)...
    taskkill /PID %pid% /F >nul 2>&1
    goto NEXT_CYCLE
)

REM 每秒检测一次
timeout /t 1 >nul
set /a waited+=1
goto WAIT_LOOP


:NEXT_CYCLE
echo [%date% %time%] Waiting %SLEEP_SECONDS% seconds before next round...
timeout /t %SLEEP_SECONDS% >nul
goto LOOP
