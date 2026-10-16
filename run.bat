@echo off
setlocal enabledelayedexpansion

:: ═══════════════════════════════════════════════════════
::  CaféNest – Project Launcher
::  Double-click this file to start the PHP dev server
::  and open the website in your browser automatically.
:: ═══════════════════════════════════════════════════════

set PHP=C:\php\php.exe
set PORT=8000
set URL=http://localhost:%PORT%
set ROUTER=%~dp0router.php
set PROJECT=%~dp0

:: ── Banner ──────────────────────────────────────────────
echo.
echo  ==========================================
echo   CafeNest - Cafe Management System
echo   DBMS Lab Project ^| PHP Session Backend
echo  ==========================================
echo.

:: ── Check PHP exists ────────────────────────────────────
if not exist "%PHP%" (
    echo  [ERROR] PHP not found at: %PHP%
    echo.
    echo  Please install PHP and update the PHP path in run.bat
    echo  Download: https://windows.php.net/download/
    echo.
    pause
    exit /b 1
)

echo  [OK] PHP found: %PHP%

:: ── Check PHP version ───────────────────────────────────
for /f "tokens=*" %%v in ('"%PHP%" -r "echo PHP_VERSION;" 2^>nul') do set PHPVER=%%v
echo  [OK] PHP Version: %PHPVER%

:: ── Check if port is already in use ─────────────────────
netstat -ano | findstr ":%PORT% " | findstr "LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo.
    echo  [WARN] Port %PORT% is already in use.
    echo         A server may already be running.
    echo.
    echo  Options:
    echo    1. Open the existing server in your browser
    echo    2. Kill the process first: netstat -ano ^| findstr :%PORT%
    echo.
    choice /c 12 /m "  Open browser anyway (1) or Exit (2)? "
    if errorlevel 2 (
        echo  Exiting.
        pause
        exit /b 0
    )
    echo  Opening browser...
    start "" "%URL%"
    goto :eof
)

:: ── Check router.php exists ─────────────────────────────
if not exist "%ROUTER%" (
    echo.
    echo  [ERROR] router.php not found at: %ROUTER%
    echo  Please make sure all project files are present.
    echo.
    pause
    exit /b 1
)

:: ── Start PHP built-in server ────────────────────────────
echo.
echo  [STARTING] PHP Built-in Server
echo  Directory : %PROJECT%
echo  Address   : %URL%
echo  Router    : router.php
echo.
echo  Press Ctrl+C to stop the server.
echo  ──────────────────────────────────────────
echo.

:: Open browser after 1.5 second delay (give server time to start)
start "" cmd /c "ping -n 2 127.0.0.1 >nul && start """" ""%URL%"""

:: Start PHP server (blocking - keeps window open)
"%PHP%" -S localhost:%PORT% -t "%PROJECT%" "%ROUTER%"

echo.
echo  [STOPPED] Server has been shut down.
pause
