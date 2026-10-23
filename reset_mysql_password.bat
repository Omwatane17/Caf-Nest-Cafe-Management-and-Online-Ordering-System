@echo off
echo ============================================
echo  CafeNest MySQL Password Reset Tool
echo ============================================
echo.
echo Step 1: Stopping MySQL80 service...
net stop MySQL80
if %ERRORLEVEL% NEQ 0 (
    echo Failed to stop MySQL. Make sure you are running as Administrator.
    pause
    exit /b 1
)

echo.
echo Step 2: Starting MySQL without authentication...
start "" /B "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --skip-grant-tables --skip-networking --console

echo Waiting for MySQL to start (5 seconds)...
timeout /t 5 /nobreak > nul

echo.
echo Step 3: Setting new root password...
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root --connect-expired-password -e "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'CafeNest@2024'; FLUSH PRIVILEGES;"

echo.
echo Step 4: Stopping temporary MySQL instance...
taskkill /F /IM mysqld.exe /T > nul 2>&1

echo Waiting 3 seconds...
timeout /t 3 /nobreak > nul

echo.
echo Step 5: Starting MySQL80 service normally...
net start MySQL80

echo.
echo ============================================
echo  Done! MySQL root password is: CafeNest@2024
echo ============================================
pause
