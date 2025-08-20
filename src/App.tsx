import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import CommunityDashboard from './components/CommunityDashboard';
import AdminDashboard from './components/AdminDashboard';
import CommunityHub from './components/CommunityHub';
import MembershipPage from './components/MembershipPage';
import TrainingCenter from './components/TrainingCenter';
import './index.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState<'dashboard' | 'community' | 'membership' | 'training'>('dashboard');
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const adminEmails = [
    'admin@superkonnected.nl',
    'info@superkonnected.nl', 
    'abdul@superkonnected.nl', 
    'team@superkonnected.nl', 
    'support@superkonnected.nl'
  ];

  // Functie om admin account aan te maken als deze nog niet bestaat
  const createAdminAccountIfNeeded = async () => {
    try {
      // Probeer in te loggen met admin credentials
      await signInWithEmailAndPassword(auth, 'admin@superkonnected.nl', '123456789');
      console.log('Admin account bestaat al');
      // Log uit na de test
      await signOut(auth);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Admin account bestaat niet, maak het aan
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, 'admin@superkonnected.nl', '123456789');
          await updateProfile(userCredential.user, {
            displayName: 'SuperKonnected Admin'
          });
          console.log('Admin account aangemaakt: admin@superkonnected.nl / 123456789');
          // Log uit na het aanmaken
          await signOut(auth);
        } catch (createError) {
          console.error('Fout bij aanmaken admin account:', createError);
        }
      } else {
        console.error('Andere fout bij admin account check:', error);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user && adminEmails.includes(user.email || '')) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    // Maak admin account aan als deze nog niet bestaat
    createAdminAccountIfNeeded();

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signInWithEmail = async () => {
    try {
      setLoginError('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      if (error.code === 'auth/user-not-found') {
        setLoginError('Gebruiker niet gevonden. Controleer je email adres.');
      } else if (error.code === 'auth/wrong-password') {
        setLoginError('Verkeerd wachtwoord. Probeer opnieuw.');
      } else {
        setLoginError('Inloggen mislukt. Probeer opnieuw.');
      }
    }
  };

  const createAccountWithEmail = async () => {
    try {
      setLoginError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Als het admin@superkonnected.nl is, maak dan een admin profiel aan
      if (email === 'admin@superkonnected.nl') {
        try {
          await updateProfile(userCredential.user, {
            displayName: 'SuperKonnected Admin'
          });
          console.log('Admin profiel aangemaakt');
        } catch (profileError) {
          console.error('Fout bij aanmaken admin profiel:', profileError);
        }
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      if (error.code === 'auth/email-already-in-use') {
        setLoginError('Dit email adres is al in gebruik. Log in of gebruik een ander email adres.');
      } else if (error.code === 'auth/weak-password') {
        setLoginError('Wachtwoord moet minimaal 6 karakters bevatten.');
      } else {
        setLoginError('Account aanmaken mislukt. Probeer opnieuw.');
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-8">
          <div className="text-center space-y-8">
            {/* Logo and Brand */}
            <div className="space-y-4">
              <div className="text-6xl">🚀</div>
              <h1 className="text-4xl font-bold text-white font-poppins">
                SuperKonnected
              </h1>
              <p className="text-xl text-white/80">
                De Community voor Ondernemers
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎙️</div>
                <div className="text-white/80 text-sm">Podcast Community</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🎓</div>
                <div className="text-white/80 text-sm">Training Center</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">🤝</div>
                <div className="text-white/80 text-sm">Networking</div>
              </div>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl mb-2">💎</div>
                <div className="text-white/80 text-sm">Premium Lidmaatschap</div>
              </div>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Google Login */}
              <button
                onClick={signInWithGoogle}
                className="w-full bg-white text-primary font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center space-x-3"
              >
                <div className="text-xl">🔐</div>
                <span>Inloggen met Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center">
                <div className="flex-1 border-t border-white/20"></div>
                <span className="px-4 text-white/60 text-sm">of</span>
                <div className="flex-1 border-t border-white/20"></div>
              </div>

              {/* Email/Password Login Toggle */}
              <button
                onClick={() => setShowEmailLogin(!showEmailLogin)}
                className="w-full bg-white/10 text-white font-semibold py-3 px-6 rounded-lg hover:bg-white/20 transition-colors"
              >
                {showEmailLogin ? 'Terug naar Google Login' : 'Inloggen met Email & Wachtwoord'}
              </button>
            </div>

            {/* Email/Password Login Form */}
            {showEmailLogin && (
              <div className="space-y-4 bg-white/5 rounded-lg p-6">
                {loginError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                    {loginError}
                  </div>
                )}
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email Adres</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-accent"
                    placeholder="jouw@email.nl"
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">Wachtwoord</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:border-accent"
                    placeholder="Minimaal 6 karakters"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={signInWithEmail}
                    disabled={!email || !password}
                    className="bg-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Inloggen
                  </button>
                  <button
                    onClick={createAccountWithEmail}
                    disabled={!email || !password}
                    className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Account Aanmaken
                  </button>
                </div>
              </div>
            )}



            {/* Footer */}
            <div className="text-white/60 text-sm">
              <p>Door in te loggen ga je akkoord met onze</p>
              <p><a href="#" className="text-accent hover:underline">Algemene Voorwaarden</a> en <a href="#" className="text-accent hover:underline">Privacy Policy</a></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Main Navigation Header */}
      <div className="bg-primary/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl">🚀</div>
              <h1 className="text-xl font-bold text-white font-poppins">
                SuperKonnected
              </h1>
              <a 
                href="https://superkonnected.nl" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white text-sm font-medium transition-colors"
              >
                ← Terug naar Hoofdsite
              </a>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex space-x-1">
              <button
                onClick={() => setActivePage('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'dashboard' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🏠 Dashboard
              </button>
              <button
                onClick={() => setActivePage('community')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'community' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🤝 Community Hub
              </button>
              <button
                onClick={() => setActivePage('membership')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'membership' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                💎 Lidmaatschap
              </button>
              <button
                onClick={() => setActivePage('training')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activePage === 'training' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🎓 Training Center
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                  👑 Admin
                </span>
              )}
              <div className="flex items-center space-x-3">
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="hidden sm:block">
                  <div className="text-white font-medium">{user.displayName}</div>
                  <div className="text-white/60 text-sm">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="text-white/70 hover:text-white transition-colors"
                title="Uitloggen"
              >
                🚪
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActivePage('dashboard')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'dashboard' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🏠
              </button>
              <button
                onClick={() => setActivePage('community')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'community' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🤝
              </button>
              <button
                onClick={() => setActivePage('membership')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'membership' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                💎
              </button>
              <button
                onClick={() => setActivePage('training')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activePage === 'training' ? 'bg-accent text-white' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                🎓
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="min-h-screen">
                 {activePage === 'dashboard' && (
           isAdmin ? <AdminDashboard user={user} isAdmin={isAdmin} /> : <CommunityDashboard />
         )}
        {activePage === 'community' && <CommunityHub />}
        {activePage === 'membership' && <MembershipPage />}
        {activePage === 'training' && <TrainingCenter />}
      </div>

      {/* Quick Access Floating Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 shadow-lg">
          <div className="flex space-x-2">
            <button
              onClick={() => setActivePage('dashboard')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                activePage === 'dashboard' ? 'bg-accent text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
              title="Dashboard"
            >
              🏠
            </button>
            <button
              onClick={() => setActivePage('community')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                activePage === 'community' ? 'bg-accent text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
              title="Community Hub"
            >
              🤝
            </button>
            <button
              onClick={() => setActivePage('membership')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                activePage === 'membership' ? 'bg-accent text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
              title="Lidmaatschap"
            >
              💎
            </button>
            <button
              onClick={() => setActivePage('training')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-lg transition-colors ${
                activePage === 'training' ? 'bg-accent text-white' : 'bg-white/20 text-white/70 hover:bg-white/30'
              }`}
              title="Training Center"
            >
              🎓
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
