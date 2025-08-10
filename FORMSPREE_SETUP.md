# 📧 Formspree Setup voor SuperKonnected

## 🎯 Doel
Alle formulieren (Doe mee als gast, Sponsoring, 1-pager aanvraag) worden verstuurd naar **info@superkonnected.nl**

## 📋 Stappen om Formspree te activeren:

### 1. Maak Formspree Account
- Ga naar: https://formspree.io/
- Klik op "Get Started for Free"
- Maak een gratis account aan

### 2. Maak Nieuw Formulier
- Klik op "New Form"
- Geef het formulier een naam: "SuperKonnected Requests"
- Voeg **info@superkonnected.nl** toe als ontvanger
- Klik "Create Form"

### 3. Kopieer Form ID
- Je krijgt een URL zoals: `https://formspree.io/f/xaybzwkd`
- Het Form ID is: `xaybzwkd`

### 4. Activeer in Code
Open `script.js` en zoek naar deze regel:
```javascript
fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
```

Vervang `YOUR_FORMSPREE_ID` met je echte Form ID (bijvoorbeeld `xaybzwkd`)

### 5. Uncomment de Code
Verwijder de `/*` en `*/` rondom de fetch code om het te activeren.

## 📊 Wat er gebeurt:

### ✅ Success
- Formulier wordt verstuurd naar info@superkonnected.nl
- Bezoeker krijgt success message (48 uur response tijd)
- Je ontvangt e-mail met alle formulier data

### ❌ Error
- Als verzending mislukt, krijgt bezoeker error message
- Suggestie om direct te mailen naar info@superkonnected.nl

## 🔧 Testen
1. Vul een test formulier in
2. Controleer of je e-mail ontvangt op info@superkonnected.nl
3. Controleer browser console voor eventuele errors

## 📈 Gratis Limiet
- **50 submissions per maand** (gratis plan)
- Voor meer: upgrade naar betaald plan

## 🎨 E-mail Template
Formspree stuurt automatisch een nette e-mail met:
- Naam van bezoeker
- E-mail adres
- Bedrijfsnaam
- Bericht/verhaal
- Type aanvraag (Doe mee als gast, Basis Sponsoring, etc.)
- Timestamp

## 🚀 Klaar!
Na deze setup worden alle formulieren automatisch naar info@superkonnected.nl verstuurd!
