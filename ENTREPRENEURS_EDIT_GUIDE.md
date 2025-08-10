# 📝 Gids: Ondernemers Namen Bewerken

## 🎯 Waar vind je de data:
**Bestand**: `entrepreneurs-data.js`

## 📊 Data Structuur:

### **Categorieën:**
- `mentoren` - Business coaches en strategen
- `pioneers` - Psychologen en maatschappelijk werkers  
- `motivators` - Fysiotherapeuten en sport specialisten

### **Per Ondernemer:**
```javascript
{
    name: "Sarah Johnson",           // ← NAAM HIER AANPASSEN
    profession: "Business Coach & Strategist",
    location: "Amsterdam",
    city: "Amsterdam",
    province: "Noord-Holland",
    distance: 0,
    specialty: "Strategy",
    website: "https://sarahjohnson.com",
    email: "sarah@sarahjohnson.com",
    phone: "+31 6 12345678",
    experience: "15+ years",
    languages: ["Nederlands", "Engels"],
    rating: 4.8,
    clients: 150
}
```

## 🔧 Hoe aanpassen:

### **Stap 1: Open het bestand**
- Open `entrepreneurs-data.js` in je editor

### **Stap 2: Zoek de ondernemer**
- Zoek naar de naam die je wilt aanpassen
- Bijvoorbeeld: `"Sarah Johnson"`

### **Stap 3: Pas de naam aan**
```javascript
// VAN:
name: "Sarah Johnson",

// NAAR:
name: "Jouw Nieuwe Naam",
```

### **Stap 4: Sla op en test**
- Sla het bestand op
- Refresh de website (http://localhost:8001)
- Test de zoekfunctie met de nieuwe naam

## 📝 Voorbeelden van Aanpassingen:

### **Voorbeeld 1: Enkele naam wijzigen**
```javascript
// In mentoren categorie:
{
    name: "Abdul Antonio",           // ← Nieuwe naam
    profession: "Business Coach & Strategist",
    // ... rest van de data
}
```

### **Voorbeeld 2: Meerdere namen wijzigen**
```javascript
// In pioneers categorie:
{
    name: "Lisa van Amsterdam",      // ← Nieuwe naam
    profession: "Psycholoog & Trauma Specialist",
    // ... rest van de data
},
{
    name: "Mark van Rotterdam",      // ← Nieuwe naam  
    profession: "Maatschappelijk Werker",
    // ... rest van de data
}
```

### **Voorbeeld 3: Volledige ondernemer toevoegen**
```javascript
// Voeg toe aan mentoren array:
{
    name: "Nieuwe Coach",
    profession: "Life Coach",
    location: "Utrecht",
    city: "Utrecht",
    province: "Utrecht",
    distance: 25,
    specialty: "Personal Development",
    website: "https://nieuwecoach.nl",
    email: "info@nieuwecoach.nl",
    phone: "+31 6 99999999",
    experience: "10+ years",
    languages: ["Nederlands", "Engels"],
    rating: 4.9,
    clients: 100
}
```

## 🎯 Tips:

### **Zoeken in het bestand:**
- **Ctrl+F** → Zoek naar specifieke naam
- **Ctrl+H** → Vervang alle voorkomens

### **Backup maken:**
- Maak een backup van `entrepreneurs-data.js` voordat je wijzigingen maakt
- Of gebruik de restore points die we hebben gemaakt

### **Testen:**
- Na elke wijziging: refresh de website
- Test de zoekfunctie met de nieuwe naam
- Controleer of alle data correct wordt getoond

## 🚀 Klaar!
**Nu kun je alle ondernemers namen aanpassen naar echte namen uit je netwerk!**

**Wil je dat ik je help met specifieke aanpassingen?** 🎯
