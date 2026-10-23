# CafeNest - MySQL Root Password Reset
# Must run as Administrator!
param([string]$NewPassword = "CafeNest@2024")

$mysql80 = "C:\Program Files\MySQL\MySQL Server 8.0\bin"
$mysql83 = "C:\Program Files\MySQL\MySQL Server 8.3\bin"
$mysqlBin = if (Test-Path "$mysql80\mysqld.exe") { $mysql80 } else { $mysql83 }
$mysqld = "$mysqlBin\mysqld.exe"
$mysql = "$mysqlBin\mysql.exe"

Write-Host "MySQL bin: $mysqlBin" -ForegroundColor Cyan
Write-Host "New password will be: $NewPassword" -ForegroundColor Yellow
Write-Host ""

# Step 1: Stop MySQL service
Write-Host "[1/5] Stopping MySQL80 service..." -ForegroundColor Yellow
Stop-Service MySQL80 -Force -ErrorAction SilentlyContinue
Start-Sleep 3

# Step 2: Start mysqld in safe mode (skip-grant-tables)
Write-Host "[2/5] Starting mysqld --skip-grant-tables..." -ForegroundColor Yellow
$job = Start-Process -FilePath $mysqld -ArgumentList "--skip-grant-tables", "--skip-networking", "--console" -PassThru -WindowStyle Hidden
Start-Sleep 5

# Step 3: Reset password
Write-Host "[3/5] Resetting root password..." -ForegroundColor Yellow
$sql = "FLUSH PRIVILEGES; ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$NewPassword'; FLUSH PRIVILEGES;"
$result = echo $sql | & $mysql -u root 2>&1
Write-Host "Result: $result"

# Step 4: Kill safe mysqld
Write-Host "[4/5] Stopping safe mysqld..." -ForegroundColor Yellow
if ($job) { Stop-Process -Id $job.Id -Force -ErrorAction SilentlyContinue }
Start-Sleep 3

# Step 5: Start normal MySQL service
Write-Host "[5/5] Starting MySQL80 normally..." -ForegroundColor Yellow
Start-Service MySQL80 -ErrorAction SilentlyContinue
Start-Sleep 4

# Test the new password
Write-Host ""
Write-Host "Testing new password..." -ForegroundColor Cyan
$test = & $mysql -u root "-p$NewPassword" -e "SELECT 'Connection OK' AS status" 2>&1
if ($test -match "Connection OK") {
    Write-Host "SUCCESS! Password reset to: $NewPassword" -ForegroundColor Green
    # Auto-update .env
    $envFile = "c:\Users\HP\Desktop\DBMS_Project\.env"
    if (Test-Path $envFile) {
        $env = Get-Content $envFile
        $env = $env -replace "^DB_PASSWORD=.*", "DB_PASSWORD=$NewPassword"
        Set-Content $envFile $env
        Write-Host ".env updated!" -ForegroundColor Green
    }
} else {
    Write-Host "Reset may not have worked. Try this SQL in MySQL Workbench:" -ForegroundColor Yellow
    Write-Host "ALTER USER 'root'@'localhost' IDENTIFIED BY '$NewPassword';" -ForegroundColor White
    Write-Host "FLUSH PRIVILEGES;" -ForegroundColor White
}
Write-Host ""
Write-Host "Now run: python app.py" -ForegroundColor Cyan
Pause
