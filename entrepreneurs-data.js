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
            website: "https://sarahjohnson.com",
            email: "sarah@sarahjohnson.com",
            phone: "+31 6 12345678",
            experience: "15+ years",
            languages: ["Nederlands", "Engels"],
            rating: 4.8,
            clients: 150,
            photo: "assets/entrepreneurs/sarah-johnson.jpg", // ← NIEUW: Foto pad
            linkedin: "https://linkedin.com/in/sarahjohnson" // ← NIEUW: LinkedIn URL
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
            clients: 200,
            photo: "assets/entrepreneurs/michael-chen.jpg",
            linkedin: "https://linkedin.com/in/michaelchen"
        },
        {
            name: "Emma Rodriguez",
            profession: "Career Coach & Leadership Expert",
            location: "Brussel",
            city: "Brussel",
            province: "Brussel",
            distance: 180,
            specialty: "Leadership",
            website: "https://emmarodriguez.be",
            email: "emma@emmarodriguez.be",
            phone: "+32 2 12345678",
            experience: "18+ years",
            languages: ["Nederlands", "Frans", "Engels", "Spaans"],
            rating: 4.8,
            clients: 180,
            photo: "assets/entrepreneurs/emma-rodriguez.jpg",
            linkedin: "https://linkedin.com/in/emmarodriguez"
        },
        {
            name: "David Wilson",
            profession: "Executive Coach",
            location: "Londen",
            city: "Londen",
            province: "Engeland",
            distance: 350,
            specialty: "Executive",
            website: "https://davidwilson.co.uk",
            email: "david@davidwilson.co.uk",
            phone: "+44 20 12345678",
            experience: "20+ years",
            languages: ["Engels", "Frans"],
            rating: 4.9,
            clients: 250,
            photo: "assets/entrepreneurs/david-wilson.jpg",
            linkedin: "https://linkedin.com/in/davidwilson"
        },
        {
            name: "Lisa van der Berg",
            profession: "Mindset Coach",
            location: "Frankfurt",
            city: "Frankfurt",
            province: "Hessen",
            distance: 400,
            specialty: "Mindset",
            website: "https://lisavanderberg.de",
            email: "lisa@lisavanderberg.de",
            phone: "+49 69 12345678",
            experience: "15+ years",
            languages: ["Duits", "Engels", "Nederlands"],
            rating: 4.7,
            clients: 160,
            photo: "assets/entrepreneurs/lisa-vanderberg.jpg",
            linkedin: "https://linkedin.com/in/lisavanderberg"
        },
        {
            name: "Tom Bakker",
            profession: "Business Strategy Coach",
            location: "Parijs",
            city: "Parijs",
            province: "Île-de-France",
            distance: 450,
            specialty: "Strategy",
            website: "https://tombakker.fr",
            email: "tom@tombakker.fr",
            phone: "+33 1 12345678",
            experience: "22+ years",
            languages: ["Frans", "Engels", "Nederlands"],
            rating: 4.8,
            clients: 220,
            photo: "assets/entrepreneurs/tom-bakker.jpg",
            linkedin: "https://linkedin.com/in/tombakker"
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
            clients: 300,
            photo: "assets/entrepreneurs/lisa-vanderberg.jpg",
            linkedin: "https://linkedin.com/in/lisavanderberg"
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
            clients: 250,
            photo: "assets/entrepreneurs/mark-devries.jpg",
            linkedin: "https://linkedin.com/in/markdevries"
        },
        {
            name: "Sophie Dubois",
            profession: "Psycholoog & Trauma Specialist",
            location: "Antwerpen",
            city: "Antwerpen",
            province: "Vlaanderen",
            distance: 120,
            specialty: "Trauma",
            website: "https://sophiedubois.be",
            email: "sophie@sophiedubois.be",
            phone: "+32 3 12345678",
            experience: "16+ years",
            languages: ["Nederlands", "Frans", "Engels"],
            rating: 4.7,
            clients: 280,
            photo: "assets/entrepreneurs/sophie-dubois.jpg",
            linkedin: "https://linkedin.com/in/sophiedubois"
        },
        {
            name: "Hans Mueller",
            profession: "Maatschappelijk Werker",
            location: "Berlijn",
            city: "Berlijn",
            province: "Berlijn",
            distance: 650,
            specialty: "Social Work",
            website: "https://hansmueller.de",
            email: "hans@hansmueller.de",
            phone: "+49 30 12345678",
            experience: "19+ years",
            languages: ["Duits", "Engels"],
            rating: 4.5,
            clients: 200,
            photo: "assets/entrepreneurs/hans-mueller.jpg",
            linkedin: "https://linkedin.com/in/hansmueller"
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
            clients: 400,
            photo: "assets/entrepreneurs/peter-jansen.jpg",
            linkedin: "https://linkedin.com/in/peterjansen"
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
            experience: "22+ years",
            languages: ["Nederlands", "Engels", "Spaans"],
            rating: 4.9,
            clients: 350,
            photo: "assets/entrepreneurs/maria-santos.jpg",
            linkedin: "https://linkedin.com/in/mariasantos"
        },
        {
            name: "Pierre Laurent",
            profession: "Fysiotherapeut & Sport Specialist",
            location: "Lyon",
            city: "Lyon",
            province: "Auvergne-Rhône-Alpes",
            distance: 750,
            specialty: "Sports",
            website: "https://pierrelaurent.fr",
            email: "pierre@pierrelaurent.fr",
            phone: "+33 4 12345678",
            experience: "24+ years",
            languages: ["Frans", "Engels", "Duits"],
            rating: 4.8,
            clients: 420,
            photo: "assets/entrepreneurs/pierre-laurent.jpg",
            linkedin: "https://linkedin.com/in/pierrelaurent"
        },
        {
            name: "Sarah Thompson",
            profession: "Ergotherapeut",
            location: "Manchester",
            city: "Manchester",
            province: "Engeland",
            distance: 550,
            specialty: "Occupational",
            website: "https://sarahthompson.co.uk",
            email: "sarah@sarahthompson.co.uk",
            phone: "+44 161 12345678",
            experience: "20+ years",
            languages: ["Engels", "Frans"],
            rating: 4.7,
            clients: 300,
            photo: "assets/entrepreneurs/sarah-thompson.jpg",
            linkedin: "https://linkedin.com/in/sarahthompson"
        }
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
        
        // Generate international location data
        const internationalLocations = [
            // Nederland
            { province: "Noord-Holland", cities: ["Amsterdam", "Haarlem", "Zaandam", "Alkmaar", "Hoorn", "Purmerend"] },
            { province: "Zuid-Holland", cities: ["Rotterdam", "Den Haag", "Leiden", "Delft", "Gouda", "Zoetermeer"] },
            { province: "Utrecht", cities: ["Utrecht", "Amersfoort", "Nieuwegein", "Veenendaal", "Woerden", "Houten"] },
            { province: "Gelderland", cities: ["Arnhem", "Nijmegen", "Apeldoorn", "Ede", "Tiel", "Culemborg"] },
            { province: "Noord-Brabant", cities: ["Eindhoven", "Tilburg", "Breda", "Den Bosch", "Helmond", "Oss"] },
            { province: "Limburg", cities: ["Maastricht", "Venlo", "Roermond", "Sittard", "Weert", "Valkenburg"] },
            { province: "Overijssel", cities: ["Zwolle", "Enschede", "Deventer", "Hengelo", "Kampen", "Steenwijk"] },
            { province: "Drenthe", cities: ["Assen", "Emmen", "Hoogeveen", "Coevorden", "Beilen", "Roden"] },
            { province: "Groningen", cities: ["Groningen", "Delfzijl", "Stadskanaal", "Winschoten", "Appingedam", "Leek"] },
            { province: "Friesland", cities: ["Leeuwarden", "Drachten", "Sneek", "Heerenveen", "Bolsward", "Franeker"] },
            { province: "Flevoland", cities: ["Almere", "Lelystad", "Emmeloord", "Swifterbant", "Marknesse", "Nagele"] },
            { province: "Zeeland", cities: ["Middelburg", "Vlissingen", "Terneuzen", "Goes", "Kapelle", "Tholen"] },
            
            // België
            { province: "Vlaanderen", cities: ["Antwerpen", "Gent", "Brugge", "Leuven", "Mechelen", "Aalst"] },
            { province: "Wallonië", cities: ["Luik", "Charleroi", "Namen", "Mons", "Verviers", "Tournai"] },
            { province: "Brussel", cities: ["Brussel", "Schaarbeek", "Anderlecht", "Molenbeek", "Etterbeek", "Ixelles"] },
            
            // Duitsland
            { province: "Noordrijn-Westfalen", cities: ["Keulen", "Düsseldorf", "Dortmund", "Essen", "Duisburg", "Bochum"] },
            { province: "Nedersaksen", cities: ["Hannover", "Braunschweig", "Oldenburg", "Osnabrück", "Wolfsburg", "Göttingen"] },
            { province: "Hessen", cities: ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach", "Hanau"] },
            { province: "Beieren", cities: ["München", "Neurenberg", "Augsburg", "Würzburg", "Regensburg", "Ingolstadt"] },
            { province: "Baden-Württemberg", cities: ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg", "Heilbronn"] },
            { province: "Berlijn", cities: ["Berlijn", "Charlottenburg", "Kreuzberg", "Neukölln", "Tempelhof", "Spandau"] },
            
            // Frankrijk
            { province: "Île-de-France", cities: ["Parijs", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil", "Nanterre"] },
            { province: "Auvergne-Rhône-Alpes", cities: ["Lyon", "Grenoble", "Saint-Étienne", "Annecy", "Chambéry", "Valence"] },
            { province: "Provence-Alpes-Côte d'Azur", cities: ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Avignon", "Cannes"] },
            { province: "Hauts-de-France", cities: ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkerque", "Valenciennes"] },
            
            // Verenigd Koninkrijk
            { province: "Engeland", cities: ["Londen", "Birmingham", "Manchester", "Liverpool", "Leeds", "Sheffield"] },
            { province: "Schotland", cities: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness", "Perth"] },
            { province: "Wales", cities: ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Neath"] },
            
            // Scandinavië
            { province: "Zweden", cities: ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Västerås", "Örebro"] },
            { province: "Noorwegen", cities: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Drammen", "Fredrikstad"] },
            { province: "Denemarken", cities: ["Kopenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers"] },
            { province: "Finland", cities: ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku"] },
            
            // Overige Europa
            { province: "Zwitserland", cities: ["Zürich", "Genève", "Basel", "Bern", "Lausanne", "Winterthur"] },
            { province: "Oostenrijk", cities: ["Wenen", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt"] },
            { province: "Italië", cities: ["Rome", "Milaan", "Napels", "Turijn", "Palermo", "Genua"] },
            { province: "Spanje", cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Málaga"] },
            { province: "Portugal", cities: ["Lissabon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal"] },
            
            // Noord-Amerika
            { province: "Verenigde Staten", cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"] },
            { province: "Canada", cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa"] },
            { province: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"] },
            { province: "Californië", cities: ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Fresno", "Sacramento"] },
            { province: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso"] },
            { province: "Ontario", cities: ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London"] },
            { province: "Quebec", cities: ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil", "Sherbrooke"] },
            
            // Azië
            { province: "China", cities: ["Shanghai", "Peking", "Guangzhou", "Shenzhen", "Tianjin", "Chongqing"] },
            { province: "Japan", cities: ["Tokio", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe"] },
            { province: "Zuid-Korea", cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju"] },
            { province: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata"] },
            { province: "Singapore", cities: ["Singapore", "Jurong West", "Woodlands", "Tampines", "Sengkang", "Hougang"] },
            
            // Australië & Oceanië
            { province: "Australië", cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast"] },
            { province: "Nieuw-Zeeland", cities: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Napier"] },
            { province: "Nieuw-Zuid-Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Wagga Wagga", "Coffs Harbour", "Port Macquarie"] },
            { province: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton", "Mildura"] },
            
            // Afrika
            { province: "Zuid-Afrika", cities: ["Johannesburg", "Kaapstad", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein"] },
            { province: "Nigeria", cities: ["Lagos", "Kano", "Ibadan", "Kaduna", "Port Harcourt", "Benin City"] },
            { province: "Kenia", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"] },
            
            // Zuid-Amerika
            { province: "Brazilië", cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte"] },
            { province: "Argentinië", cities: ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "Tucumán"] },
            { province: "Chili", cities: ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Viña del Mar"] },
            
            // Midden-Oosten
            { province: "Verenigde Arabische Emiraten", cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah"] },
            { province: "Saudi-Arabië", cities: ["Riyad", "Jeddah", "Mekka", "Medina", "Dammam", "Taif"] },
            { province: "Israël", cities: ["Jeruzalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod"] }
        ];
        
        const randomLocation = internationalLocations[Math.floor(Math.random() * internationalLocations.length)];
        const province = randomLocation.province;
        const city = randomLocation.cities[Math.floor(Math.random() * randomLocation.cities.length)];
        const distance = Math.floor(Math.random() * 2000); // Random distance 0-2000km for international
        
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
            clients: Math.floor(Math.random() * 500) + 50,
            photo: `assets/entrepreneurs/${firstName.toLowerCase()}-${lastName.toLowerCase().replace(' ', '')}.jpg`, // ← NIEUW: Foto pad
            linkedin: `https://linkedin.com/in/${firstName.toLowerCase()}${lastName.toLowerCase().replace(' ', '')}` // ← NIEUW: LinkedIn URL
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
    
    // Foto en LinkedIn sectie
    const photoSection = entrepreneur.photo ? `
        <div class="flex items-center mb-3">
            <div class="w-12 h-12 rounded-full overflow-hidden mr-3 bg-gray-200 flex-shrink-0">
                <img src="${entrepreneur.photo}" 
                     alt="${entrepreneur.name}" 
                     class="w-full h-full object-cover"
                     onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=\\'w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs\\'>${entrepreneur.name.split(' ').map(n => n[0]).join('')}</div>'">
            </div>
            <div class="flex-1">
                <h4 class="font-medium text-gray-800 mb-1">${entrepreneur.name}</h4>
                <p class="text-sm text-gray-600">${entrepreneur.profession}</p>
            </div>
            ${entrepreneur.linkedin ? `
                <a href="${entrepreneur.linkedin}" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="text-blue-600 hover:text-blue-800 transition-colors ml-2">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
            ` : ''}
        </div>
    ` : `
        <h4 class="font-medium text-gray-800 mb-2">${entrepreneur.name}</h4>
        <p class="text-sm text-gray-600 mb-3">${entrepreneur.profession}</p>
    `;
    
    card.innerHTML = `
        ${photoSection}
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