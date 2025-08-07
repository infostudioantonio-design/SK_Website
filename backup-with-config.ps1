#Requires -Version 5.1

<#
.SYNOPSIS
    Backup script met configuratie uit JSON bestand
.DESCRIPTION
    Leest configuratie uit backup-config.json en start backup service
#>

param(
    [string]$ConfigFile = "backup-config.json",
    [switch]$RunOnce = $false
)

try {
    # Lees configuratie
    $configPath = Join-Path $PSScriptRoot $ConfigFile
    
    if (-not (Test-Path $configPath)) {
        Write-Error "Configuratiebestand niet gevonden: $configPath"
        exit 1
    }
    
    $config = Get-Content $configPath | ConvertFrom-Json
    $settings = $config.backupSettings
    
    Write-Host "Configuratie geladen uit: $configPath"
    Write-Host "Backup interval: $($settings.intervalMinutes) minuten"
    Write-Host "Max backups: $($settings.maxBackups)"
    Write-Host "Bron: $($settings.sourcePath)"
    Write-Host "Backup locatie: $($settings.backupBasePath)"
    
    # Start backup script met configuratie parameters
    $backupScriptPath = Join-Path $PSScriptRoot "backup-script.ps1"
    
    if (-not (Test-Path $backupScriptPath)) {
        Write-Error "Backup script niet gevonden: $backupScriptPath"
        exit 1
    }
    
    $params = @{
        BackupIntervalMinutes = $settings.intervalMinutes
        MaxBackups = $settings.maxBackups
        SourcePath = $settings.sourcePath
        BackupBasePath = $settings.backupBasePath
    }
    
    if ($RunOnce) {
        $params.RunOnce = $true
    }
    
    & $backupScriptPath @params
    
} catch {
    Write-Error "Fout bij opstarten backup service: $($_.Exception.Message)"
    exit 1
}