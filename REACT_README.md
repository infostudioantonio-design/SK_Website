# SuperKonnected Community Platform 🚀

Een moderne React applicatie voor het SuperKonnected community platform met Firebase integratie en automatische social media sharing.

## ✨ Features

### 🎙️ Podcast Sessies
- **Aanmaken van nieuwe sessies** - Leden kunnen hun eigen podcast sessies organiseren
- **Deelnemen/Uitschrijven** - Eenvoudig aanmelden en afmelden voor sessies
- **Categorieën** - Business, Technology, Marketing, Finance, Health
- **Deelnemers limiet** - Beheer van maximale deelnemers per sessie
- **Host informatie** - Wie organiseert de sessie

### 💬 Community
- **Posts maken** - Deel gedachten en ervaringen met de community
- **Like systeem** - Interactie met posts via likes
- **User avatars** - Profielfoto's van Google accounts
- **Real-time updates** - Live updates via Firebase

### 📱 Social Media Sharing
- **Automatische sharing** - Podcast sessies automatisch delen op social media
- **Frequentie instellingen** - Kies tussen 3x, 5x of 7x per week
- **Multi-platform support** - LinkedIn, Twitter, Facebook, Instagram
- **Handmatig delen** - Direct delen van specifieke sessies
- **Punten systeem** - Verdien punten voor elke share
- **Level systeem** - Beginner tot Master levels
- **Admin controle** - Beheerder kan auto-share inschakelen per sessie
- **Analytics dashboard** - Real-time inzichten in social media performance

### 👤 User Profiles
- **Google Authentication** - Veilige login met Google accounts
- **Statistieken** - Overzicht van posts, sessies, shares en likes
- **Profiel informatie** - Naam, email, lidmaatschap datum
- **Mijn sessies** - Overzicht van gevolgde podcast sessies
- **Punten overzicht** - Totaal punten en level status

### 🛠️ Admin Dashboard
- **Gebruikers overzicht** - Bekijk alle community leden en hun sharing status
- **Podcast sessies beheer** - Schakel auto-share in/uit per sessie
- **Social media analytics** - Real-time performance data per platform
- **Shares tracking** - Overzicht van alle gedeelde content
- **Platform statistieken** - LinkedIn, Twitter, Facebook, Instagram metrics
- **Team management** - Beheer admin team leden en permissions
- **Multi-level toegang** - Super Admin, Admin en Support rollen

### 🎨 UI/UX
- **Moderne design** - Glassmorphism effecten en gradient backgrounds
- **Responsive** - Werkt perfect op alle apparaten
- **Smooth animaties** - Fade-in, slide-in en bounce effecten
- **Tab navigatie** - Overzichtelijke sectie navigatie
- **Modal dialogen** - Voor het aanmaken van sessies en instellingen

## 🛠️ Technologieën

- **React 18** met TypeScript
- **Firebase 9** (Authentication, Firestore)
- **Tailwind CSS** voor styling
- **CSS Animations** voor smooth transitions
- **Google OAuth** voor authenticatie
- **Social Media APIs** - LinkedIn, Twitter, Facebook, Instagram

## 📦 Installatie

### 1. Dependencies installeren
```bash
npm install
```

### 2. Firebase Setup
1. Maak een Firebase project aan op [Firebase Console](https://console.firebase.google.com/)
2. Activeer Authentication met Google provider
3. Maak Firestore Database aan
4. Update `src/firebase.ts` met jouw configuratie

### 3. Social Media API Setup
Voor automatische sharing moet je de volgende APIs configureren:

#### LinkedIn API
1. Ga naar [LinkedIn Developers](https://developer.linkedin.com/)
2. Maak een nieuwe app aan
3. Configureer OAuth 2.0 scopes
4. Voeg de Client ID en Client Secret toe aan je Firebase configuratie

#### Twitter API
1. Ga naar [Twitter Developer Portal](https://developer.twitter.com/)
2. Maak een nieuwe app aan
3. Configureer OAuth 2.0
4. Voeg de API keys toe aan je Firebase configuratie

#### Facebook API
1. Ga naar [Facebook Developers](https://developers.facebook.com/)
2. Maak een nieuwe app aan
3. Configureer Facebook Login
4. Voeg de App ID en App Secret toe aan je Firebase configuratie

### 4. Development server starten
```bash
npm start
```

## 🔧 Firebase Configuratie

Update `src/firebase.ts` met jouw Firebase configuratie:

```typescript
const firebaseConfig = {
  apiKey: "jouw-api-key",
  authDomain: "jouw-project.firebaseapp.com",
  projectId: "jouw-project-id",
  storageBucket: "jouw-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

### Firestore Collections

#### `userProfiles`
```typescript
{
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  company?: string;
  linkedin?: string;
  joinDate: Date;
  points: number;
  socialSharingEnabled: boolean;
  sharingFrequency: 3 | 5 | 7;
  lastSharedDate?: Date;
  totalShares: number;
  linkedinAccessToken?: string;
  twitterAccessToken?: string;
  facebookAccessToken?: string;
  instagramAccessToken?: string;
}
```

#### `podcastSessions`
```typescript
{
  title: string;
  description: string;
  date: string;
  maxParticipants: number;
  participants: string[];
  host: string;
  category: string;
}
```

#### `communityPosts`
```typescript
{
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  timestamp: Date;
  likes: string[];
}
```

#### `socialShares`
```typescript
{
  userId: string;
  userName: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  content: string;
  timestamp: Date;
  pointsEarned: number;
  status: 'pending' | 'shared' | 'failed';
  shareUrl?: string;
}
```

## 🎯 Gebruik

### Voor Bezoekers
1. Ga naar de homepage
2. Klik op "Inloggen met Google"
3. Accepteer de Google OAuth permissies
4. Je wordt automatisch doorgestuurd naar het Community Dashboard

### Voor Leden

#### Podcast Sessies
- **Bekijk sessies** - Scroll door beschikbare podcast opnames
- **Deelnemen** - Klik op "Deelnemen" bij interessante sessies
- **Nieuwe sessie** - Klik op "+ Nieuwe Sessie" om zelf te organiseren
- **Uitschrijven** - Klik op "Uitschrijven" om af te melden

#### Community Posts
- **Posts maken** - Type je bericht en klik "Post plaatsen"
- **Likes geven** - Klik op het hartje om posts te liken
- **Interactie** - Bekijk wie er gereageerd heeft

#### Social Media Sharing
- **Instellingen** - Ga naar "Social Sharing" tab en klik "Instellingen"
- **Automatisch delen** - Schakel automatische sharing in en kies frequentie
- **Handmatig delen** - Deel specifieke sessies direct op social media
- **Punten verdienen** - LinkedIn shares geven 10 punten, andere platforms 5 punten

#### Admin Dashboard (Alleen voor beheerders)
- **Toegang** - Log in met een van de volgende email adressen:
  - admin@superkonnected.nl (Super Admin)
  - info@superkonnected.nl (Admin)
  - abdul@superkonnected.nl (Admin)
  - team@superkonnected.nl (Admin)
  - support@superkonnected.nl (Support)
- **Gebruikers beheer** - Bekijk alle community leden en hun sharing status
- **Sessies beheer** - Schakel auto-share in/uit voor specifieke podcast sessies
- **Analytics** - Bekijk real-time social media performance data
- **Shares tracking** - Overzicht van alle gedeelde content en engagement
- **Team management** - Beheer admin team leden en permissions

#### Profiel
- **Statistieken** - Bekijk je activiteit in de community
- **Mijn sessies** - Overzicht van sessies waar je aan deelneemt
- **Punten overzicht** - Totaal punten en level status
- **Social shares** - Overzicht van je gedeelde content

## 🏆 Punten Systeem

### Punten Verdienen
- **LinkedIn share**: +10 punten
- **Twitter share**: +5 punten
- **Facebook share**: +5 punten
- **Instagram share**: +5 punten
- **Community post**: +2 punten
- **Podcast sessie organiseren**: +15 punten
- **Deelnemen aan sessie**: +5 punten

### Levels
- **🌱 Beginner**: 0-49 punten
- **🌟 Active**: 50-199 punten
- **🔥 Pro**: 200-499 punten
- **⭐ Expert**: 500-999 punten
- **👑 Master**: 1000+ punten

### Voordelen per Level
- **Beginner**: Basis toegang tot community
- **Active**: Kan podcast sessies organiseren
- **Pro**: Prioriteit bij sessie inschrijvingen
- **Expert**: Exclusieve content toegang
- **Master**: VIP status en speciale privileges

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Vercel
```bash
npm run build
vercel --prod
```

### Netlify
```bash
npm run build
# Upload de build folder naar Netlify
```

## 📁 Project Structuur

```
src/
├── components/
│   ├── CommunityDashboard.tsx    # Community platform hoofdcomponent
│   └── AdminDashboard.tsx        # Admin dashboard voor beheerders
├── services/
│   ├── socialSharingService.ts   # Social media sharing service
│   ├── schedulerService.ts       # Automatische sharing scheduler
│   └── analyticsService.ts       # Social media analytics service
├── firebase.ts                   # Firebase configuratie
├── index.css                     # Styling en animaties
├── App.tsx                       # App component met routing
└── index.tsx                     # Entry point
```

## 🎨 Styling

### CSS Classes
- `.btn-primary` - Primaire actie knoppen
- `.btn-secondary` - Secundaire knoppen
- `.btn-accent` - Accent knoppen (social sharing)
- `.card` - Basis card styling
- `.card-hover` - Hover effecten voor cards
- `.fade-in` - Fade-in animatie
- `.bounce-in` - Bounce animatie
- `.profile-image` - Profielfoto styling
- `.like-button` - Like button animaties

### Kleuren
- **Primary**: #0A2342 (Donkerblauw)
- **Secondary**: #1a365d (Middelblauw)
- **Accent**: #3182ce (Lichtblauw)
- **Gradients**: Van donkerblauw naar grijs

## 🔮 Toekomstige Features

### Korte Termijn
- [ ] LinkedIn OAuth toevoegen
- [ ] Email notificaties voor sessies
- [ ] Comment systeem voor posts
- [ ] File uploads voor sessie materialen
- [ ] Admin dashboard voor moderatie
- [ ] Social media analytics dashboard

### Lange Termijn
- [ ] Video chat integratie
- [ ] Stripe betalingen voor premium features
- [ ] Mobile app (React Native)
- [ ] AI-powered matching algoritme
- [ ] Advanced analytics dashboard
- [ ] Social media influencer programma

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit je wijzigingen (`git commit -m 'Add some AmazingFeature'`)
4. Push naar de branch (`git push origin feature/AmazingFeature`)
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License - zie het [LICENSE](LICENSE) bestand voor details.

## 📞 Contact

- **Website**: [superkonnected.nl](https://superkonnected.nl)
- **Email**: info@superkonnected.nl
- **LinkedIn**: [SuperKonnected](https://linkedin.com/company/superkonnected)

---

**SuperKonnected** - Van netwerken naar verbinden 🚀
