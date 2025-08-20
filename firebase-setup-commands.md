# 🔥 Firebase Subdomain Setup Commands

## Stap 1: Firebase CLI Installeren
```bash
npm install -g firebase-tools
```

## Stap 2: Login bij Firebase
```bash
firebase login
```

## Stap 3: Project Initialiseren (als nog niet gedaan)
```bash
firebase init hosting
```

## Stap 4: Community Site Toevoegen
```bash
firebase target:apply hosting community community.superkonnected.nl
```

## Stap 5: Firebase.json Aanpassen
De firebase.json is al aangepast voor de community target.

## Stap 6: Build en Deploy
```bash
# Build de React app
npm run build

# Deploy naar Firebase
firebase deploy --only hosting:community
```

## Stap 7: DNS Configuratie
Voeg deze DNS records toe bij je domain provider:

### Voor community.superkonnected.nl:
```
Type: CNAME
Name: community
Value: superkonnected-app.web.app
TTL: 3600
```

### Voor hoofdsite (GitHub Pages):
```
Type: CNAME
Name: @
Value: [jouw-github-username].github.io
TTL: 3600
```

## Stap 8: Firebase Console
1. Ga naar [Firebase Console](https://console.firebase.google.com/)
2. Selecteer je project
3. Ga naar "Hosting"
4. Klik "Add custom domain"
5. Voeg `community.superkonnected.nl` toe
6. Volg de DNS verificatie stappen

## Stap 9: Test de Setup
```bash
# Test lokaal
npm start

# Test deployment
curl https://community.superkonnected.nl
```

## Troubleshooting
- Als DNS niet werkt: wacht 24-48 uur voor propagatie
- Als build faalt: check voor TypeScript errors
- Als Firebase faalt: controleer of je bent ingelogd
