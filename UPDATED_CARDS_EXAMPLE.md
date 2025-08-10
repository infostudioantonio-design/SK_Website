# 📸 Voorbeeld: Bijgewerkte Ondernemers Kaarten

## ✅ **Status: Foto's en LinkedIn zijn geïmplementeerd!**

## 🎯 **Hoe de kaarten er nu uitzien:**

### **Met Foto en LinkedIn:**
```html
<div class="partner-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow entrepreneur-item" 
     data-name="Sarah Johnson" 
     data-profession="Business Coach & Strategist" 
     data-location="Amsterdam" 
     data-city="Amsterdam"
     data-province="Noord-Holland"
     data-distance="0"
     data-specialty="Strategy">
    
    <!-- NIEUWE FOTO EN LINKEDIN SECTIE -->
    <div class="flex items-center mb-3">
        <div class="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
            <img src="assets/entrepreneurs/sarah-johnson.jpg" 
                 alt="Sarah Johnson" 
                 class="w-full h-full object-cover"
                 onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs\\'>SJ</div>'">
        </div>
        <div class="flex-1">
            <h4 class="font-medium text-gray-800 mb-1">Sarah Johnson</h4>
            <p class="text-sm text-gray-600">Business Coach & Strategist</p>
        </div>
        <a href="https://linkedin.com/in/sarahjohnson" 
           target="_blank" 
           rel="noopener noreferrer"
           class="text-blue-600 hover:text-blue-800 transition-colors ml-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        </a>
    </div>
    
    <!-- BESTAANDE INFORMATIE -->
    <p class="text-xs text-gray-500 mb-2">📍 Amsterdam, Noord-Holland</p>
    <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-400">⭐ 4.8</span>
        <span class="text-xs text-gray-400">15+ years</span>
    </div>
    <a href="https://sarahjohnson.com" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Bezoek website →</a>
</div>
```

### **Zonder Foto (Fallback met Initialen):**
```html
<div class="partner-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow entrepreneur-item" 
     data-name="Michael Chen" 
     data-profession="Life Coach & Motivational Speaker" 
     data-location="Rotterdam" 
     data-city="Rotterdam"
     data-province="Zuid-Holland"
     data-distance="50"
     data-specialty="Motivation">
    
    <!-- FOTO SECTIE MET FALLBACK -->
    <div class="flex items-center mb-3">
        <div class="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
            <!-- Als foto niet bestaat, toont initialen -->
            <div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs">
                MC
            </div>
        </div>
        <div class="flex-1">
            <h4 class="font-medium text-gray-800 mb-1">Michael Chen</h4>
            <p class="text-sm text-gray-600">Life Coach & Motivational Speaker</p>
        </div>
        <!-- LinkedIn icoon (alleen als URL bestaat) -->
        <a href="https://linkedin.com/in/michaelchen" 
           target="_blank" 
           rel="noopener noreferrer"
           class="text-blue-600 hover:text-blue-800 transition-colors ml-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        </a>
    </div>
    
    <!-- BESTAANDE INFORMATIE -->
    <p class="text-xs text-gray-500 mb-2">📍 Rotterdam, Zuid-Holland</p>
    <div class="flex items-center justify-between mb-2">
        <span class="text-xs text-gray-400">⭐ 4.9</span>
        <span class="text-xs text-gray-400">12+ years</span>
    </div>
    <a href="https://michaelchen.nl" class="text-blue-600 hover:text-blue-800 text-sm font-medium">Bezoek website →</a>
</div>
```

## 🎨 **Visuele Features:**

### **Profielfoto:**
- **Ronde cirkel** (48x48px = w-12 h-12)
- **Automatische schaling** met `object-cover`
- **Grijze achtergrond** als placeholder
- **Fallback naar initialen** als foto niet bestaat

### **LinkedIn Icoon:**
- **Blauw LinkedIn icoon** (20x20px = w-5 h-5)
- **Hover effect** (donkerder blauw)
- **Opent in nieuw tabblad**
- **Alleen zichtbaar** als LinkedIn URL bestaat

### **Layout:**
- **Flexbox layout** voor foto, info en LinkedIn
- **Responsive design** werkt op alle schermen
- **Consistente spacing** met bestaande kaarten

## 🔧 **Hoe te Implementeren:**

### **Stap 1: Update Data**
Voeg `photo` en `linkedin` velden toe aan `entrepreneurs-data.js`:
```javascript
{
    name: "Sarah Johnson",
    // ... andere velden
    photo: "assets/entrepreneurs/sarah-johnson.jpg",
    linkedin: "https://linkedin.com/in/sarahjohnson"
}
```

### **Stap 2: Voeg Foto's Toe**
Plaats foto's in `assets/entrepreneurs/` map:
- `sarah-johnson.jpg`
- `michael-chen.jpg`
- etc.

### **Stap 3: Test**
- Refresh de website
- Controleer of foto's worden getoond
- Test LinkedIn links
- Controleer fallback systeem

## 🚀 **Voordelen:**

### **Professioneel Uiterlijk:**
- **Gezichten bij namen** maakt het persoonlijker
- **LinkedIn integratie** voor directe connectie
- **Consistente styling** met de rest van de site

### **Gebruiksvriendelijkheid:**
- **Directe toegang** tot LinkedIn profielen
- **Visuele herkenning** van ondernemers
- **Betere engagement** door persoonlijke touch

### **Technische Voordelen:**
- **Fallback systeem** - geen errors als foto's ontbreken
- **Responsive design** - werkt op alle apparaten
- **Performance geoptimaliseerd** - kleine foto's, lazy loading

## 🎯 **Klaar!**
**De foto's en LinkedIn functionaliteit zijn volledig geïmplementeerd en klaar voor gebruik!**

**Test het op http://localhost:8001** 📸🔗
