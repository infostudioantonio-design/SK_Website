@echo off
echo ========================================
echo SuperKonnected Backup Service Installer
echo ========================================
echo.

echo Dit script installeert de automatische backup service.
echo Je kunt het backup interval en aantal backups aanpassen in backup-config.json
echo.

echo Stap 1: Test backup uitvoeren...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0test-backup.ps1"

echo.
echo Stap 2: Installeren in Windows Taakplanner...
echo (Dit vereist Administrator rechten)
echo.

pause

powershell.exe -ExecutionPolicy Bypass -Command "Start-Process PowerShell -ArgumentList '-ExecutionPolicy Bypass -File \"%~dp0install-backup-service.ps1\"' -Verb RunAs"

echo.
echo Installatie voltooid!
echo De backup service start automatisch bij de volgende herstart.
echo.
echo Om handmatig te starten:
echo powershell -Command "Start-ScheduledTask -TaskName 'SuperKonnected-Backup-Service'"
echo.

pause