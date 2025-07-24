@echo off
REM Launch Al-Aseel Commercial Complex Project
REM This batch file opens the main homepage in the default browser

echo Starting Al-Aseel Commercial Complex Website...
echo Opening main homepage...

REM Open the main homepage
start "" "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\Aseel-home-01.html"

REM Optional: Open admin login page as well (uncomment if needed)
REM timeout /t 2 /nobreak >nul
REM start "" "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\admin-login.html"

echo Project launched successfully!
echo You can close this window now.

REM Keep window open for 3 seconds to show the message
timeout /t 3 /nobreak >nul
