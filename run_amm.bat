@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM ================== 配置 ==================
set "NODE_EXE=node"
set "NODE_SCRIPT=monitor\amm_monitor.js"

set TIMEOUT_SECONDS=3600
set SLEEP_SECONDS=3600

REM 唯一标识（用于识别进程，防 PID 复用）
set "RUN_TAG=AMM_MONITOR_WATCHDOG"
REM ==========================================

:MAIN_LOOP
echo.
echo [%date% %time%] ===== New cycle =====

REM 启动 node（关键：加唯一标识参数）
start "%RUN_TAG%" /B "%NODE_EXE%" "%NODE_SCRIPT%" --run-tag=%RUN_TAG%

REM 启动时间戳（秒）
set START_TS=%TIME%

set /a ELAPSED=0

:WATCH_LOOP
REM 查询是否存在该进程（基于窗口标题）
tasklist /V | findstr /I "%RUN_TAG%" >nul
if errorlevel 1 (
    echo [%date% %time%] Process exited normally.
    goto SLEEP
)

REM 超时判断
if !ELAPSED! GEQ %TIMEOUT_SECONDS% (
    echo [%date% %time%] Timeout reached, killing process

    REM 精确杀死该 watchdog 对应进程
    taskkill /FI "WINDOWTITLE eq %RUN_TAG%" /F >nul 2>&1
    goto SLEEP
)

timeout /t 1 >nul
set /a ELAPSED+=1
goto WATCH_LOOP


:SLEEP
echo [%date% %time%] Sleeping %SLEEP_SECONDS% seconds
timeout /t %SLEEP_SECONDS% >nul
goto MAIN_LOOP
