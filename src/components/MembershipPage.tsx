import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  description: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
  maxMembers?: number;
  currentMembers: number;
  discount?: number; // percentage discount for yearly
  color: string;
  icon: string;
}

interface MembershipSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  tierId: string;
  tierName: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  paymentMethod?: string;
  autoRenew: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank' | 'paypal';
  last4?: string;
  brand?: string;
  isDefault: boolean;
  expiryDate?: string;
}

const MembershipPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'current' | 'billing' | 'benefits'>('plans');
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [userSubscription, setUserSubscription] = useState<MembershipSubscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Checkout form states
  const [checkoutForm, setCheckoutForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Netherlands',
    acceptTerms: false,
    acceptMarketing: false
  });

  // Payment form states
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    saveCard: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load membership tiers
      const tiersQuery = query(collection(db, 'membershipTiers'), where('isActive', '==', true), orderBy('price', 'asc'));
      const tiersSnapshot = await getDocs(tiersQuery);
      const tiersData = tiersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MembershipTier[];
      setMembershipTiers(tiersData);

      // Load user subscription if logged in
      if (user) {
        const subscriptionQuery = query(collection(db, 'membershipSubscriptions'), where('userId', '==', user.uid));
        const subscriptionSnapshot = await getDocs(subscriptionQuery);
        if (!subscriptionSnapshot.empty) {
          const subscriptionData = subscriptionSnapshot.docs[0];
          setUserSubscription({
            id: subscriptionData.id,
            ...subscriptionData.data(),
            startDate: subscriptionData.data().startDate.toDate(),
            endDate: subscriptionData.data().endDate.toDate(),
            nextBillingDate: subscriptionData.data().nextBillingDate.toDate(),
            createdAt: subscriptionData.data().createdAt.toDate(),
            updatedAt: subscriptionData.data().updatedAt.toDate()
          } as MembershipSubscription);
        }

        // Load payment methods
        const paymentQuery = query(collection(db, 'paymentMethods'), where('userId', '==', user.uid));
        const paymentSnapshot = await getDocs(paymentQuery);
        const paymentData = paymentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PaymentMethod[];
        setPaymentMethods(paymentData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading membership data:', error);
      setLoading(false);
    }
  };

  const calculatePrice = (tier: MembershipTier) => {
    if (billingCycle === 'yearly' && tier.discount) {
      return tier.price * (1 - tier.discount / 100);
    }
    return tier.price;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const startCheckout = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setShowCheckout(true);
  };

  const processPayment = async () => {
    try {
      if (!user || !selectedTier) return;

      // Simulate payment processing
      const paymentSuccess = await simulatePayment();
      
      if (paymentSuccess) {
        // Create subscription
        const subscriptionData = {
          userId: user.uid,
          userName: `${checkoutForm.firstName} ${checkoutForm.lastName}`,
          userEmail: checkoutForm.email,
          tierId: selectedTier.id,
          tierName: selectedTier.name,
          price: calculatePrice(selectedTier),
          billingCycle,
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
          nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
          autoRenew: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await addDoc(collection(db, 'membershipSubscriptions'), subscriptionData);
        
        // Save payment method if requested
        if (paymentForm.saveCard) {
          const paymentMethodData = {
            userId: user.uid,
            type: 'card',
            last4: paymentForm.cardNumber.slice(-4),
            brand: 'Visa', // This would be detected from card number
            isDefault: paymentMethods.length === 0,
            expiryDate: paymentForm.expiryDate
          };
          await addDoc(collection(db, 'paymentMethods'), paymentMethodData);
        }

        setShowCheckout(false);
        setShowPaymentModal(false);
        loadData();
        
        // Show success message
        alert('🎉 Welkom bij SuperKonnected! Je lidmaatschap is actief.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Er is een fout opgetreden bij het verwerken van je betaling.');
    }
  };

  const simulatePayment = async (): Promise<boolean> => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Simulate 95% success rate
    return Math.random() > 0.05;
  };

  const cancelSubscription = async () => {
    try {
      if (!userSubscription) return;

      const subscriptionRef = doc(db, 'membershipSubscriptions', userSubscription.id);
      await updateDoc(subscriptionRef, {
        status: 'cancelled',
        autoRenew: false,
        updatedAt: new Date()
      });

      loadData();
      alert('Je lidmaatschap is geannuleerd. Je hebt nog toegang tot je lidmaatschap tot het einde van je betaalperiode.');
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Er is een fout opgetreden bij het annuleren van je lidmaatschap.');
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    return tier.isPopular ? 'from-purple-600 to-pink-600' : 'from-blue-600 to-cyan-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'expired': return 'bg-gray-500/20 text-gray-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Lidmaatschap laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-primary/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-white font-poppins">
              👑 SuperKonnected Lidmaatschap
            </h1>
            <div className="flex items-center space-x-4">
              {userSubscription && (
                <span className="text-white">
                  Huidig: {userSubscription.tierName}
                </span>
              )}
              <span className="text-white">Welkom, {user?.displayName || 'Gast'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('plans')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'plans' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              💎 Lidmaatschap Plannen
            </button>
            {userSubscription && (
              <>
                <button
                  onClick={() => setActiveTab('current')}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'current' ? 'tab-active' : 'tab-inactive'
                  }`}
                >
                  📋 Mijn Lidmaatschap
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                    activeTab === 'billing' ? 'tab-active' : 'tab-inactive'
                  }`}
                >
                  💳 Facturering
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('benefits')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'benefits' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🎁 Voordelen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold text-white font-poppins">
                Word Lid van SuperKonnected
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Sluit je aan bij een exclusieve community van ondernemers en krijg toegang tot premium content, 
                trainingen, networking events en persoonlijke begeleiding.
              </p>
              
              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center space-x-4">
                <span className="text-white">Maandelijks</span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    billingCycle === 'yearly' ? 'bg-accent' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-white">Jaarlijks</span>
                {billingCycle === 'yearly' && (
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    🎉 20% Korting
                  </span>
                )}
              </div>
            </div>

            {/* Membership Tiers */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {membershipTiers.map((tier) => (
                <div 
                  key={tier.id} 
                  className={`relative card hover:scale-105 transition-transform ${
                    tier.isPopular ? 'ring-2 ring-purple-500' : ''
                  }`}
                >
                  {tier.isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                        🏆 Meest Populair
                      </span>
                    </div>
                  )}

                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-2">{tier.icon}</div>
                    <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                    <p className="text-white/70">{tier.description}</p>
                    
                    <div className="space-y-2">
                      <div className="text-3xl font-bold text-accent">
                        {formatPrice(calculatePrice(tier))}
                      </div>
                      <div className="text-white/60 text-sm">
                        per {billingCycle === 'yearly' ? 'jaar' : 'maand'}
                      </div>
                      {billingCycle === 'yearly' && tier.discount && (
                        <div className="text-green-400 text-sm">
                          {tier.discount}% korting
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="text-green-400">✅</div>
                          <span className="text-white/80 text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {tier.maxMembers && (
                      <div className="text-white/60 text-sm">
                        {tier.currentMembers}/{tier.maxMembers} leden
                      </div>
                    )}

                    <button
                      onClick={() => startCheckout(tier)}
                      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                        tier.isPopular 
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                          : 'btn-primary'
                      }`}
                    >
                      {userSubscription?.tierId === tier.id ? 'Huidig Plan' : 'Lid Worden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div className="card">
              <h3 className="text-2xl font-bold text-white mb-6">Veelgestelde Vragen</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Kan ik mijn lidmaatschap op elk moment annuleren?</h4>
                    <p className="text-white/70 text-sm">Ja, je kunt je lidmaatschap op elk moment annuleren. Je behoudt toegang tot alle voordelen tot het einde van je betaalperiode.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Wat gebeurt er als ik van plan wil wisselen?</h4>
                    <p className="text-white/70 text-sm">Je kunt op elk moment upgraden naar een hoger plan. Voor downgrades geldt dat deze ingaan bij je volgende facturatie.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Zijn er verborgen kosten?</h4>
                    <p className="text-white/70 text-sm">Nee, alle prijzen zijn transparant. Er zijn geen setup kosten of verborgen kosten.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-2">Krijg ik een factuur?</h4>
                    <p className="text-white/70 text-sm">Ja, je ontvangt automatisch een factuur per email voor elke betaling.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Membership Tab */}
        {activeTab === 'current' && userSubscription && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              Mijn Lidmaatschap
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Lidmaatschap Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Plan:</span>
                    <span className="text-white font-semibold">{userSubscription.tierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userSubscription.status)}`}>
                      {userSubscription.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Prijs:</span>
                    <span className="text-white">{formatPrice(userSubscription.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Facturatie:</span>
                    <span className="text-white capitalize">{userSubscription.billingCycle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Startdatum:</span>
                    <span className="text-white">{userSubscription.startDate.toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Einddatum:</span>
                    <span className="text-white">{userSubscription.endDate.toLocaleDateString('nl-NL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Volgende facturatie:</span>
                    <span className="text-white">{userSubscription.nextBillingDate.toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Beheer</h3>
                <div className="space-y-4">
                  <button className="btn-primary w-full">
                    📋 Facturen Bekijken
                  </button>
                  <button className="btn-secondary w-full">
                    🔄 Plan Wijzigen
                  </button>
                  <button 
                    onClick={cancelSubscription}
                    className="btn-secondary w-full text-red-400 hover:text-red-300"
                  >
                    ❌ Lidmaatschap Annuleren
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && userSubscription && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              Facturering & Betaling
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Betaalmethoden</h3>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">💳</div>
                          <div>
                            <div className="text-white font-medium">
                              {method.brand} •••• {method.last4}
                            </div>
                            <div className="text-white/60 text-sm">
                              Verloopt {method.expiryDate}
                            </div>
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                            Standaard
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/70">Geen betaalmethoden opgeslagen.</p>
                )}
                <button className="btn-primary mt-4">
                  ➕ Betaalmethode Toevoegen
                </button>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Factuur Geschiedenis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <div className="text-white font-medium">Lidmaatschap {userSubscription.tierName}</div>
                      <div className="text-white/60 text-sm">
                        {userSubscription.startDate.toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{formatPrice(userSubscription.price)}</div>
                      <div className="text-green-400 text-sm">Betaald</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              Lidmaatschap Voordelen
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card text-center">
                <div className="text-4xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Exclusieve Podcasts</h3>
                <p className="text-white/70 text-sm">Toegang tot premium podcast content en interviews met top ondernemers.</p>
              </div>

              <div className="card text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-semibold text-white mb-2">Training Modules</h3>
                <p className="text-white/70 text-sm">Complete training programma's voor ondernemerschap en persoonlijke ontwikkeling.</p>
              </div>

              <div className="card text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-semibold text-white mb-2">Networking Events</h3>
                <p className="text-white/70 text-sm">Exclusieve events en meetups met andere ondernemers uit de community.</p>
              </div>

              <div className="card text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Directe Support</h3>
                <p className="text-white/70 text-sm">Persoonlijke begeleiding en support van het SuperKonnected team.</p>
              </div>

              <div className="card text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-white/70 text-sm">Gedetailleerde insights en analytics voor je business groei.</p>
              </div>

              <div className="card text-center">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-white mb-2">Exclusieve Content</h3>
                <p className="text-white/70 text-sm">Toegang tot premium content die niet beschikbaar is voor niet-leden.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedTier && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-4xl">
            <h3 className="text-2xl font-semibold text-white mb-6">
              🎉 Lid Worden van SuperKonnected
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Summary */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Bestelling Overzicht</h4>
                <div className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white">{selectedTier.name}</span>
                    <span className="text-white">{formatPrice(calculatePrice(selectedTier))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Facturatie</span>
                    <span className="text-white/70 capitalize">{billingCycle}</span>
                  </div>
                  {billingCycle === 'yearly' && selectedTier.discount && (
                    <div className="flex justify-between text-green-400">
                      <span>Korting</span>
                      <span>-{selectedTier.discount}%</span>
                    </div>
                  )}
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-white">Totaal</span>
                      <span className="text-accent">{formatPrice(calculatePrice(selectedTier))}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-semibold text-white">Inbegrepen Voordelen</h4>
                  {selectedTier.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="text-green-400">✅</div>
                      <span className="text-white/80 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Checkout Form */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Persoonlijke Gegevens</h4>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Voornaam"
                    value={checkoutForm.firstName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, firstName: e.target.value })}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Achternaam"
                    value={checkoutForm.lastName}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, lastName: e.target.value })}
                    className="input-field"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email adres"
                  value={checkoutForm.email}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Bedrijf (optioneel)"
                  value={checkoutForm.company}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, company: e.target.value })}
                  className="input-field"
                />
                <input
                  type="tel"
                  placeholder="Telefoonnummer"
                  value={checkoutForm.phone}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                  className="input-field"
                />

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checkoutForm.acceptTerms}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, acceptTerms: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">
                      Ik ga akkoord met de <a href="#" className="text-accent hover:underline">Algemene Voorwaarden</a>
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={checkoutForm.acceptMarketing}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, acceptMarketing: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-white/80 text-sm">
                      Ik wil op de hoogte blijven van nieuwe features en updates
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!checkoutForm.acceptTerms}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Doorgaan naar Betaling
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">💳 Betalingsgegevens</h3>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Kaarthouder naam"
                value={paymentForm.cardholderName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Kaartnummer"
                value={paymentForm.cardNumber}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, expiryDate: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={paymentForm.cvv}
                  onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                  className="input-field"
                />
              </div>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={paymentForm.saveCard}
                  onChange={(e) => setPaymentForm({ ...paymentForm, saveCard: e.target.checked })}
                  className="rounded"
                />
                <span className="text-white/80 text-sm">
                  Betaalmethode opslaan voor toekomstige betalingen
                </span>
              </label>

              <div className="flex space-x-3">
                <button
                  onClick={processPayment}
                  className="btn-primary flex-1"
                >
                  Betaling Verwerken
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="btn-secondary flex-1"
                >
                  Annuleren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipPage;
