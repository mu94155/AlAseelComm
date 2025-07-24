@echo off
REM Launch Al-Aseel Commercial Complex Project - Extended Version
REM This version opens multiple pages for comprehensive testing

echo Starting Al-Aseel Commercial Complex Website...
echo Opening multiple pages for testing...

REM Open the main homepage
start "" "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\Aseel-home-01.html"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Open admin login page
start "" "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\admin-login.html"

REM Wait 2 seconds
timeout /t 2 /nobreak >nul

REM Open project expenses page
start "" "c:\Users\ssssh\OneDrive\Documents\AlAseelComm\project-expenses.html"

echo All project pages launched successfully!
echo You can close this window now.

REM Keep window open for 3 seconds to show the message
timeout /t 3 /nobreak >nul
