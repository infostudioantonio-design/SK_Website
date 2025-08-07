#Requires -Version 5.1
#Requires -RunAsAdministrator

<#
.SYNOPSIS
    Installeert de backup service in Windows Taakplanner
.DESCRIPTION
    Maakt een Windows Taakplanner taak aan die de backup service automatisch start
#>

param(
    [string]$TaskName = "SuperKonnected-Backup-Service",
    [string]$TaskDescription = "Automatische backup service voor SuperKonnected website project"
)

try {
    Write-Host "Installing SuperKonnected Backup Service..." -ForegroundColor Green
    Write-Host "Task Name: $TaskName" -ForegroundColor Yellow
    
    # Pad naar het script
    $scriptPath = Join-Path $PSScriptRoot "backup-with-config.ps1"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Error "Backup script niet gevonden: $scriptPath"
        exit 1
    }
    
    # Controleer of taak al bestaat
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    
    if ($existingTask) {
        Write-Host "Bestaande taak gevonden. Verwijderen..." -ForegroundColor Yellow
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    }
    
    # Maak nieuwe taak actie
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    
    # Maak trigger voor opstarten
    $trigger = New-ScheduledTaskTrigger -AtStartup
    
    # Maak extra trigger voor handmatig testen (optioneel)
    # $triggerManual = New-ScheduledTaskTrigger -At (Get-Date).AddMinutes(1) -Once
    
    # Taak instellingen
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable:$false -DontStopOnIdleEnd
    
    # Gebruiker principal (run als huidige gebruiker)
    $principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType ServiceAccount
    
    # Registreer de taak
    $task = Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Description $TaskDescription
    
    Write-Host "`nTaak succesvol geïnstalleerd!" -ForegroundColor Green
    Write-Host "Task Name: $($task.TaskName)" -ForegroundColor White
    Write-Host "Status: $($task.State)" -ForegroundColor White
    Write-Host "`nDe backup service zal automatisch starten bij de volgende herstart." -ForegroundColor Cyan
    Write-Host "Om de service nu handmatig te starten, voer uit:" -ForegroundColor Cyan
    Write-Host "Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
    
    Write-Host "`nOm de taak te verwijderen, voer uit:" -ForegroundColor Yellow
    Write-Host "Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor White
    
    Write-Host "`nOm de status te controleren:" -ForegroundColor Yellow
    Write-Host "Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
    
} catch {
    Write-Error "Fout bij installeren van backup service: $($_.Exception.Message)"
    Write-Host "`nZorg ervoor dat je PowerShell als Administrator uitvoert!" -ForegroundColor Red
    exit 1
}