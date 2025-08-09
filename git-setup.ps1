# Git Setup Script for SuperKonnected Website
# Dit script helpt bij het koppelen van de lokale repository aan GitHub

Write-Host "SuperKonnected Git Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

# Check if git is installed
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is niet geïnstalleerd. Download Git van https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Initialize git repository if not already done
if (!(Test-Path .git)) {
    Write-Host "Initialiseren van Git repository..." -ForegroundColor Yellow
    git init
}

# Check current git status
Write-Host "`nHuidige Git status:" -ForegroundColor Green
git status

# Add remote origin if not exists
$remoteUrl = "https://github.com/infostudioantonio-design/SK_Website.git"
$existingRemote = git remote get-url origin 2>$null

if ($existingRemote) {
    Write-Host "`nRemote origin bestaat al: $existingRemote" -ForegroundColor Yellow
} else {
    Write-Host "`nToevoegen van remote origin..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
}

# Show remotes
Write-Host "`nGeconfigureerde remotes:" -ForegroundColor Green
git remote -v

# Suggest next steps
Write-Host "`nVolgende stappen:" -ForegroundColor Cyan
Write-Host "1. git add . (om alle bestanden toe te voegen)" -ForegroundColor White
Write-Host "2. git commit -m 'Initial commit: SuperKonnected website setup'" -ForegroundColor White
Write-Host "3. git branch -M main (om main branch in te stellen)" -ForegroundColor White
Write-Host "4. git push -u origin main (om naar GitHub te pushen)" -ForegroundColor White

Write-Host "`nOf gebruik dit script om automatisch alles uit te voeren:" -ForegroundColor Yellow
$autoSetup = Read-Host "Wil je automatische setup uitvoeren? (y/n)"

if ($autoSetup -eq "y" -or $autoSetup -eq "Y") {
    Write-Host "`nAutomatische setup wordt uitgevoerd..." -ForegroundColor Green
    
    # Add all files
    Write-Host "Toevoegen van bestanden..." -ForegroundColor Yellow
    git add .
    
    # Commit
    Write-Host "Maken van commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: SuperKonnected website setup met fouten opgelost"
    
    # Set main branch
    Write-Host "Instellen van main branch..." -ForegroundColor Yellow
    git branch -M main
    
    # Push to GitHub
    Write-Host "Pushen naar GitHub..." -ForegroundColor Yellow
    git push -u origin main
    
    Write-Host "`nSetup voltooid! Je website is nu gesynchroniseerd met GitHub." -ForegroundColor Green
} else {
    Write-Host "`nVoer de stappen handmatig uit wanneer je klaar bent." -ForegroundColor Yellow
}

Write-Host "`nGit setup script voltooid!" -ForegroundColor Cyan
