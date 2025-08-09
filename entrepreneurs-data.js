// Entrepreneurs Database - Sample data for 1000+ entrepreneurs
// This file can be expanded to include thousands of entrepreneurs

const entrepreneursData = {
    mentoren: [
        {
            name: "Sarah Johnson",
            profession: "Business Coach & Strategist",
            location: "Amsterdam",
            city: "Amsterdam",
            province: "Noord-Holland",
            distance: 0,
            specialty: "Strategy",
            website: "https://sarahjohnson.nl",
            email: "sarah@sarahjohnson.nl",
            phone: "+31 6 12345678",
            experience: "15+ years",
            languages: ["Nederlands", "Engels"],
            rating: 4.8,
            clients: 150
        },
        {
            name: "Michael Chen",
            profession: "Life Coach & Motivational Speaker",
            location: "Rotterdam",
            city: "Rotterdam",
            province: "Zuid-Holland",
            distance: 50,
            specialty: "Motivation",
            website: "https://michaelchen.nl",
            email: "michael@michaelchen.nl",
            phone: "+31 6 23456789",
            experience: "12+ years",
            languages: ["Nederlands", "Engels", "Mandarijn"],
            rating: 4.9,
            clients: 200
        },
        // Add 100+ more coaches here...
    ],
    
    pioneers: [
        {
            name: "Dr. Lisa van der Berg",
            profession: "Psycholoog & Trauma Specialist",
            location: "Amsterdam",
            city: "Amsterdam",
            province: "Noord-Holland",
            distance: 0,
            specialty: "Trauma",
            website: "https://lisavanderberg.nl",
            email: "lisa@lisavanderberg.nl",
            phone: "+31 6 34567890",
            experience: "20+ years",
            languages: ["Nederlands", "Engels"],
            rating: 4.7,
            clients: 300
        },
        {
            name: "Mark de Vries",
            profession: "Maatschappelijk Werker",
            location: "Rotterdam",
            city: "Rotterdam",
            province: "Zuid-Holland",
            distance: 50,
            specialty: "Social Work",
            website: "https://markdevries.nl",
            email: "mark@markdevries.nl",
            phone: "+31 6 45678901",
            experience: "18+ years",
            languages: ["Nederlands"],
            rating: 4.6,
            clients: 250
        },
        // Add 100+ more pioneers here...
    ],
    
    motivators: [
        {
            name: "Dr. Peter Jansen",
            profession: "Fysiotherapeut & Sport Specialist",
            location: "Amsterdam",
            city: "Amsterdam",
            province: "Noord-Holland",
            distance: 0,
            specialty: "Sports",
            website: "https://peterjansen.nl",
            email: "peter@peterjansen.nl",
            phone: "+31 6 56789012",
            experience: "25+ years",
            languages: ["Nederlands", "Engels"],
            rating: 4.8,
            clients: 400
        },
        {
            name: "Maria Santos",
            profession: "Ergotherapeut",
            location: "Rotterdam",
            city: "Rotterdam",
            province: "Zuid-Holland",
            distance: 50,
            specialty: "Occupational",
            website: "https://mariasantos.nl",
            email: "maria@mariasantos.nl",
            phone: "+31 6 67890123",
            experience: "16+ years",
            languages: ["Nederlands", "Portugees"],
            rating: 4.7,
            clients: 180
        },
        // Add 100+ more motivators here...
    ]
};

// Function to generate random entrepreneurs for testing
function generateRandomEntrepreneurs(category, count = 100) {
    const names = [
        "Emma", "Lucas", "Sophie", "Daan", "Lisa", "Thomas", "Anna", "Bram", "Julia", "Sem",
        "Lotte", "Finn", "Eva", "Noah", "Sara", "Liam", "Nora", "Milan", "Liv", "Jesse",
        "Fleur", "Luuk", "Tess", "Mees", "Zoë", "Sam", "Lynn", "Tijn", "Fenna", "Dex",
        "Yara", "Kai", "Nova", "Boris", "Luna", "Gijs", "Elin", "Thijs", "Mila", "Jens"
    ];
    
    const surnames = [
        "de Vries", "van der Berg", "Bakker", "Jansen", "Visser", "Smit", "Meijer", "de Boer",
        "Mulder", "de Groot", "Bos", "Vos", "Peters", "Hendriks", "van Leeuwen", "Dekker",
        "Brouwer", "de Wit", "Dijkstra", "Smits", "de Graaf", "van der Meer", "Kok", "Jacobs",
        "van den Berg", "de Haan", "Vermeulen", "van den Heuvel", "van der Veen", "van der Wal"
    ];
    
    const locations = [
        "Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere",
        "Breda", "Nijmegen", "Enschede", "Haarlem", "Arnhem", "Zaanstad", "Amersfoort", "Apeldoorn",
        "Hoorn", "Maastricht", "Leiden", "Dordrecht", "Zoetermeer", "Zwolle", "Deventer", "Delft"
    ];
    
    const entrepreneurs = [];
    
    for (let i = 0; i < count; i++) {
        const firstName = names[Math.floor(Math.random() * names.length)];
        const lastName = surnames[Math.floor(Math.random() * surnames.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        
        let profession, specialty;
        
        switch(category) {
            case 'coaches':
                const coachProfessions = [
                    "Business Coach", "Life Coach", "Career Coach", "Executive Coach", "Mindset Coach",
                    "Strategy Coach", "Leadership Coach", "Performance Coach", "Wellness Coach", "Success Coach"
                ];
                profession = coachProfessions[Math.floor(Math.random() * coachProfessions.length)];
                specialty = ["Strategy", "Motivation", "Leadership", "Mindset", "Performance"][Math.floor(Math.random() * 5)];
                break;
            case 'pioneers':
                const pioneerProfessions = [
                    "Psycholoog", "Maatschappelijk Werker", "Gezinstherapeut", "Klinisch Psycholoog",
                    "Sociaal Werker", "Psychotherapeut", "Trauma Specialist", "Counselor", "Therapeut"
                ];
                profession = pioneerProfessions[Math.floor(Math.random() * pioneerProfessions.length)];
                specialty = ["Trauma", "Social Work", "Family Therapy", "Clinical", "Psychotherapy"][Math.floor(Math.random() * 5)];
                break;
            case 'motivators':
                const motivatorProfessions = [
                    "Fysiotherapeut", "Ergotherapeut", "Logopedist", "Orthopedisch Fysiotherapeut",
                    "Sportpsycholoog", "Revalidatie Specialist", "Sport Specialist", "Therapeut"
                ];
                profession = motivatorProfessions[Math.floor(Math.random() * motivatorProfessions.length)];
                specialty = ["Sports", "Occupational", "Speech", "Orthopedic", "Rehabilitation"][Math.floor(Math.random() * 5)];
                break;
        }
        
        // Generate province and city data
        const provinces = ["Noord-Holland", "Zuid-Holland", "Utrecht", "Gelderland", "Noord-Brabant", "Limburg", "Overijssel", "Drenthe", "Groningen", "Friesland", "Flevoland", "Zeeland"];
        const cities = ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen", "Enschede", "Haarlem", "Arnhem", "Amersfoort", "Apeldoorn", "Leiden", "Maastricht", "Zwolle", "Ede", "Zoetermeer"];
        
        const province = provinces[Math.floor(Math.random() * provinces.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const distance = Math.floor(Math.random() * 200); // Random distance 0-200km
        
        entrepreneurs.push({
            name: `${firstName} ${lastName}`,
            profession: profession,
            location: location,
            city: city,
            province: province,
            distance: distance,
            specialty: specialty,
            website: `https://${firstName.toLowerCase()}${lastName.toLowerCase().replace(' ', '')}.nl`,
            email: `${firstName.toLowerCase()}@${firstName.toLowerCase()}${lastName.toLowerCase().replace(' ', '')}.nl`,
            phone: `+31 6 ${Math.floor(Math.random() * 90000000) + 10000000}`,
            experience: `${Math.floor(Math.random() * 20) + 5}+ years`,
            languages: ["Nederlands", "Engels"],
            rating: (4 + Math.random() * 0.9).toFixed(1),
            clients: Math.floor(Math.random() * 500) + 50
        });
    }
    
    return entrepreneurs;
}

// Function to dynamically load entrepreneurs into the accordion
function loadEntrepreneursIntoAccordion() {
    // Generate 1000+ entrepreneurs (100 per category for demo)
    const allEntrepreneurs = {
        coaches: generateRandomEntrepreneurs('coaches', 100),
        pioneers: generateRandomEntrepreneurs('pioneers', 100),
        motivators: generateRandomEntrepreneurs('motivators', 100)
    };
    
    // Load into DOM
    Object.keys(allEntrepreneurs).forEach(category => {
        const grid = document.querySelector(`[data-category="${category}"]`);
        if (!grid) return;
        
        // Clear existing items (keep the first 6 as examples)
        const existingItems = grid.querySelectorAll('.entrepreneur-item');
        for (let i = 6; i < existingItems.length; i++) {
            existingItems[i].remove();
        }
        
        // Add new entrepreneurs
        allEntrepreneurs[category].forEach((entrepreneur, index) => {
            if (index < 6) return; // Skip first 6 as they're already in HTML
            
            const entrepreneurCard = createEntrepreneurCard(entrepreneur, category);
            grid.appendChild(entrepreneurCard);
        });
    });
}

// Function to create entrepreneur card HTML
function createEntrepreneurCard(entrepreneur, category) {
    const card = document.createElement('div');
    card.className = 'partner-card p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow entrepreneur-item';
    card.setAttribute('data-name', entrepreneur.name);
    card.setAttribute('data-profession', entrepreneur.profession);
    card.setAttribute('data-location', entrepreneur.location);
    card.setAttribute('data-specialty', entrepreneur.specialty);
    card.setAttribute('data-province', entrepreneur.province);
    card.setAttribute('data-city', entrepreneur.city);
    card.setAttribute('data-distance', entrepreneur.distance);
    
    const colorClass = category === 'coaches' ? 'text-blue-600 hover:text-blue-800' : 
                      category === 'pioneers' ? 'text-green-600 hover:text-green-800' : 
                      'text-purple-600 hover:text-purple-800';
    
    card.innerHTML = `
        <h4 class="font-medium text-gray-800 mb-2">${entrepreneur.name}</h4>
        <p class="text-sm text-gray-600 mb-3">${entrepreneur.profession}</p>
        <p class="text-xs text-gray-500 mb-2">📍 ${entrepreneur.city}, ${entrepreneur.province}</p>
        <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-gray-400">⭐ ${entrepreneur.rating}</span>
            <span class="text-xs text-gray-400">${entrepreneur.experience}</span>
        </div>
        <a href="${entrepreneur.website}" class="${colorClass} text-sm font-medium">Bezoek website →</a>
    `;
    
    return card;
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { entrepreneursData, generateRandomEntrepreneurs, loadEntrepreneursIntoAccordion };
} 