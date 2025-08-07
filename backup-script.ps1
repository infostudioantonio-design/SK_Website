#Requires -Version 5.1

<#
.SYNOPSIS
    Automatische backup script voor SuperKonnected Website project
.DESCRIPTION
    Maakt elke X minuten een backup van de project folder naar een backup locatie
    Houdt maximaal Y backups bij en verwijdert automatisch oudere backups
.AUTHOR
    SuperKonnected Project
#>

# ========================
# CONFIGURATIE PARAMETERS
# ========================
param(
    [int]$BackupIntervalMinutes = 10,
    [int]$MaxBackups = 20,
    [string]$SourcePath = "C:\Users\SKIKK\Desktop\SuperKonnected_Files\Super connected_website\SK_Website\05-08 Website SK",
    [string]$BackupBasePath = "C:\Users\SKIKK\Desktop\SuperKonnected_Files\Super connected_website\SK_Website\05-08 Website SK - Backup",
    [switch]$RunOnce = $false
)

# ========================
# LOGGING FUNCTIE
# ========================
function Write-BackupLog {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    Write-Host $logMessage
    
    # Log naar bestand
    $logFile = Join-Path $BackupBasePath "backup-log.txt"
    Add-Content -Path $logFile -Value $logMessage -ErrorAction SilentlyContinue
}

# ========================
# BACKUP FUNCTIE
# ========================
function Start-ProjectBackup {
    try {
        Write-BackupLog "Starting backup process..."
        
        # Controleer of source path bestaat
        if (-not (Test-Path $SourcePath)) {
            Write-BackupLog "Source path does not exist: $SourcePath" "ERROR"
            return $false
        }
        
        # Maak backup base directory aan als het niet bestaat
        if (-not (Test-Path $BackupBasePath)) {
            New-Item -ItemType Directory -Path $BackupBasePath -Force | Out-Null
            Write-BackupLog "Created backup base directory: $BackupBasePath"
        }
        
        # Genereer timestamp voor backup folder naam
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $backupPath = Join-Path $BackupBasePath $timestamp
        
        Write-BackupLog "Creating backup: $backupPath"
        
        # Kopieer alle bestanden en mappen (inclusief verborgen bestanden)
        $copyParams = @{
            Path = $SourcePath
            Destination = $backupPath
            Recurse = $true
            Force = $true
            ErrorAction = 'Stop'
        }
        
        Copy-Item @copyParams
        
        Write-BackupLog "Backup successfully created: $backupPath" "SUCCESS"
        return $true
        
    } catch {
        Write-BackupLog "Backup failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# ========================
# CLEANUP FUNCTIE
# ========================
function Remove-OldBackups {
    try {
        Write-BackupLog "Checking for old backups to remove..."
        
        # Haal alle backup directories op, gesorteerd op naam (oudste eerst)
        $backupDirs = Get-ChildItem -Path $BackupBasePath -Directory | 
                      Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$' } |
                      Sort-Object Name
        
        $currentCount = $backupDirs.Count
        Write-BackupLog "Found $currentCount backup directories"
        
        if ($currentCount -gt $MaxBackups) {
            $toRemove = $currentCount - $MaxBackups
            $dirsToRemove = $backupDirs | Select-Object -First $toRemove
            
            Write-BackupLog "Removing $toRemove old backup(s)..."
            
            foreach ($dir in $dirsToRemove) {
                Remove-Item -Path $dir.FullName -Recurse -Force
                Write-BackupLog "Removed old backup: $($dir.Name)" "SUCCESS"
            }
        } else {
            Write-BackupLog "No old backups to remove (current: $currentCount, max: $MaxBackups)"
        }
        
    } catch {
        Write-BackupLog "Error during cleanup: $($_.Exception.Message)" "ERROR"
    }
}

# ========================
# HOOFDFUNCTIE
# ========================
function Start-BackupService {
    Write-BackupLog "=== SuperKonnected Backup Service Started ===" "INFO"
    Write-BackupLog "Backup interval: $BackupIntervalMinutes minutes"
    Write-BackupLog "Max backups: $MaxBackups"
    Write-BackupLog "Source: $SourcePath"
    Write-BackupLog "Backup location: $BackupBasePath"
    
    if ($RunOnce) {
        Write-BackupLog "Running single backup (RunOnce mode)"
        if (Start-ProjectBackup) {
            Remove-OldBackups
        }
        return
    }
    
    # Continue loop voor periodieke backups
    while ($true) {
        try {
            if (Start-ProjectBackup) {
                Remove-OldBackups
            }
            
            Write-BackupLog "Next backup in $BackupIntervalMinutes minutes..."
            Start-Sleep -Seconds ($BackupIntervalMinutes * 60)
            
        } catch [System.Threading.ThreadAbortException] {
            Write-BackupLog "Backup service stopped by user" "INFO"
            break
        } catch {
            Write-BackupLog "Unexpected error in main loop: $($_.Exception.Message)" "ERROR"
            Write-BackupLog "Retrying in 1 minute..."
            Start-Sleep -Seconds 60
        }
    }
}

# ========================
# SCRIPT UITVOERING
# ========================
try {
    # Maak backup base directory aan als het niet bestaat
    if (-not (Test-Path $BackupBasePath)) {
        New-Item -ItemType Directory -Path $BackupBasePath -Force | Out-Null
    }
    
    # Start de backup service
    Start-BackupService
    
} catch {
    Write-BackupLog "Fatal error starting backup service: $($_.Exception.Message)" "ERROR"
    exit 1
}