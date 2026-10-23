@echo off
echo ==========================================
echo   CafeNest - MySQL Root Password Reset
echo   Run as Administrator!
echo ==========================================
echo.

set NEWPW=CafeNest@2024
set MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin
set INIT_SQL=c:\Users\HP\Desktop\DBMS_Project\mysql_reset.sql
set ENV_FILE=c:\Users\HP\Desktop\DBMS_Project\.env

echo Stopping MySQL service...
net stop MySQL80
timeout /t 3

echo Starting MySQL with init-file...
"%MYSQL_BIN%\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="%INIT_SQL%" --console &
timeout /t 10

echo Stopping temporary mysqld...
taskkill /F /IM mysqld.exe /T >nul 2>&1
timeout /t 3

echo Restarting MySQL service...
net start MySQL80
timeout /t 5

echo Testing connection...
"%MYSQL_BIN%\mysql.exe" -u root -pCafeNest@2024 -e "SELECT 'Password reset OK'" 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Password is now: CafeNest@2024
    echo Updating .env file...
    powershell -Command "(Get-Content '%ENV_FILE%') -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=CafeNest@2024' | Set-Content '%ENV_FILE%'"
    echo .env updated!
    echo.
    echo Now run: python app.py
) else (
    echo.
    echo If reset failed, open MySQL Workbench and run:
    echo   ALTER USER 'root'@'localhost' IDENTIFIED BY 'CafeNest@2024';
    echo   FLUSH PRIVILEGES;
)
echo.
pause
