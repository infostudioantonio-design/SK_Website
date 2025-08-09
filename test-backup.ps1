#Requires -Version 5.1

<#
.SYNOPSIS
    Test script om één backup uit te voeren
.DESCRIPTION
    Voert één backup uit om te testen of alles werkt voordat je de automatische service installeert
#>

Write-Host "=== SuperKonnected Backup Test ===" -ForegroundColor Green
Write-Host "Dit script voert één backup uit om te testen of alles goed werkt.`n" -ForegroundColor Yellow

try {
    # Test of configuratie bestaat
    $configPath = Join-Path $PSScriptRoot "backup-config.json"
    
    if (-not (Test-Path $configPath)) {
        Write-Error "Configuratiebestand niet gevonden: $configPath"
        Write-Host "Zorg ervoor dat backup-config.json in dezelfde map staat." -ForegroundColor Red
        exit 1
    }
    
    # Lees configuratie
    $config = Get-Content $configPath | ConvertFrom-Json
    $settings = $config.backupSettings
    
    Write-Host "Configuratie:" -ForegroundColor Cyan
    Write-Host "  Bron: $($settings.sourcePath)" -ForegroundColor White
    Write-Host "  Backup locatie: $($settings.backupBasePath)" -ForegroundColor White
    Write-Host "  Max backups: $($settings.maxBackups)`n" -ForegroundColor White
    
    # Controleer of bron bestaat
    if (-not (Test-Path $settings.sourcePath)) {
        Write-Warning "Bron map bestaat niet: $($settings.sourcePath)"
        $continue = Read-Host "Wil je toch doorgaan om de backup structuur te testen? (y/n)"
        if ($continue -ne 'y') {
            exit 0
        }
    }
    
    Write-Host "Uitvoeren van test backup..." -ForegroundColor Yellow
    
    # Voer backup uit met RunOnce parameter
    $backupScript = Join-Path $PSScriptRoot "backup-with-config.ps1"
    & $backupScript -RunOnce
    
    Write-Host "`nTest voltooid!" -ForegroundColor Green
    Write-Host "Controleer de backup map om te zien of alles goed is gegaan." -ForegroundColor Cyan
    Write-Host "Backup locatie: $($settings.backupBasePath)" -ForegroundColor White
    
    # Toon backup directories
    if (Test-Path $settings.backupBasePath) {
        $backups = Get-ChildItem $settings.backupBasePath -Directory | Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$' }
        if ($backups) {
            Write-Host "`nGevonden backups:" -ForegroundColor Cyan
            foreach ($backup in $backups | Sort-Object Name -Descending) {
                $size = (Get-ChildItem $backup.FullName -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
                Write-Host "  $($backup.Name) - $([math]::Round($size, 2)) MB" -ForegroundColor White
            }
        }
    }
    
} catch {
    Write-Error "Fout tijdens test: $($_.Exception.Message)"
    exit 1
}