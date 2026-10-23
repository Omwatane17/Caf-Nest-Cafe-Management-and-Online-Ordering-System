# CafeNest - MySQL Root Password Reset Script
# Run as Administrator!
Write-Host "CafeNest MySQL Password Reset" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$newPassword = "CafeNest@2024"
$mysqlService = "MySQL80"

# Stop MySQL service
Write-Host "Stopping MySQL service..." -ForegroundColor Yellow
Stop-Service -Name $mysqlService -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Find mysqld.exe
$mysqlPath = (Get-ItemProperty "HKLM:\SOFTWARE\MySQL AB\*" -ErrorAction SilentlyContinue).'Location'
if (-not $mysqlPath) {
    $mysqlPath = (Get-ChildItem "C:\Program Files\MySQL" -Filter "mysqld.exe" -Recurse -ErrorAction SilentlyContinue).DirectoryName | Select-Object -First 1
}
if (-not $mysqlPath) { $mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin" }

Write-Host "Starting MySQL in skip-grant-tables mode..." -ForegroundColor Yellow
$proc = Start-Process -FilePath "$mysqlPath\mysqld.exe" -ArgumentList "--skip-grant-tables --skip-networking" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5

Write-Host "Resetting root password to: $newPassword" -ForegroundColor Yellow
$sql = "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED BY '$newPassword';"
& "$mysqlPath\mysql.exe" -u root -e $sql 2>$null

Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Start-Service -Name $mysqlService -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Test connection
$test = & "$mysqlPath\mysql.exe" -u root -p"$newPassword" -e "SELECT 1" 2>&1
if ($test -match "1") {
    Write-Host "SUCCESS! MySQL root password is now: $newPassword" -ForegroundColor Green
    Write-Host "Update your .env file: DB_PASSWORD=CafeNest@2024" -ForegroundColor Green
} else {
    Write-Host "If the above failed, try opening MySQL Workbench and running:" -ForegroundColor Yellow
    Write-Host "  ALTER USER 'root'@'localhost' IDENTIFIED BY 'CafeNest@2024';" -ForegroundColor White
}
Pause
