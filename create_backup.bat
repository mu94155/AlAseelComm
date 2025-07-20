@echo off
echo ========================================
echo   Al Aseel Commercial Complex Backup
echo ========================================
echo.

:: Get current date and time
for /f "tokens=1-4 delims=/ " %%i in ("%date%") do (
    set dd=%%i
    set mm=%%j
    set yyyy=%%k
)

for /f "tokens=1-2 delims=: " %%i in ("%time%") do (
    set hh=%%i
    set min=%%j
)

:: Remove spaces from time
set hh=%hh: =0%

:: Set backup filename
set backupname=AlAseelComm_Backup_%yyyy%-%mm%-%dd%_%hh%-%min%

echo Creating backup: %backupname%.zip
echo.

:: Create backup using PowerShell
powershell "Compress-Archive -Path 'AlAseelComm' -DestinationPath '%backupname%.zip' -Force"

if exist "%backupname%.zip" (
    echo ✅ Backup created successfully!
    echo 📁 File: %backupname%.zip
    echo 📍 Location: %cd%
    echo.
    echo 💡 You can now upload this file to Google Drive
) else (
    echo ❌ Backup creation failed!
)

echo.
echo Press any key to exit...
pause > nul
