import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface TalentLevel {
  id: string;
  name: string;
  level: 'regional' | 'provincial' | 'national';
  description: string;
  requirements: {
    minPoints: number;
    minShares: number;
    minEngagement: number;
    timeInCurrentLevel: number; // months
  };
  benefits: string[];
  color: string;
  maxMembers: number;
  currentMembers: number;
}

interface TalentMember {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  currentLevel: 'regional' | 'provincial' | 'national';
  teamId: string;
  teamName: string;
  points: number;
  sharesCount: number;
  engagementRate: number;
  joinDate: Date;
  levelUpDate?: Date;
  performanceScore: number;
  isEligibleForPromotion: boolean;
  promotionHistory: Array<{
    fromLevel: string;
    toLevel: string;
    date: Date;
    reason: string;
  }>;
}

interface PromotionOpportunity {
  id: string;
  memberId: string;
  memberName: string;
  currentLevel: string;
  targetLevel: string;
  performanceScore: number;
  eligibilityScore: number;
  recommendedAction: 'promote' | 'review' | 'maintain';
  createdAt: Date;
}

const TalentPipeline: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'opportunities' | 'analytics' | 'settings'>('pipeline');
  const [talentLevels, setTalentLevels] = useState<TalentLevel[]>([]);
  const [talentMembers, setTalentMembers] = useState<TalentMember[]>([]);
  const [promotionOpportunities, setPromotionOpportunities] = useState<PromotionOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TalentMember | null>(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  useEffect(() => {
    checkSuperAdminStatus();
    loadData();
    initializeTalentLevels();
  }, []);

  const checkSuperAdminStatus = async () => {
    const superAdminEmails = ['admin@superkonnected.nl'];
    if (user && superAdminEmails.includes(user.email || '')) {
      setIsSuperAdmin(true);
    }
  };

  const initializeTalentLevels = () => {
    const levels: TalentLevel[] = [
      {
        id: 'regional',
        name: 'Regionaal Talent',
        level: 'regional',
        description: 'Top performers binnen hun regionale team',
        requirements: {
          minPoints: 100,
          minShares: 20,
          minEngagement: 5.0,
          timeInCurrentLevel: 3
        },
        benefits: [
          'Exclusieve regionale events',
          'Mentorship programma',
          'Prioriteit bij sessies',
          'Speciale badges'
        ],
        color: '#3182ce',
        maxMembers: 50,
        currentMembers: 0
      },
      {
        id: 'provincial',
        name: 'Provinciaal Support',
        level: 'provincial',
        description: 'Doorstroom naar provinciaal niveau',
        requirements: {
          minPoints: 500,
          minShares: 100,
          minEngagement: 8.0,
          timeInCurrentLevel: 6
        },
        benefits: [
          'Provinciale leiderschapsrol',
          'Cross-team samenwerking',
          'Advanced training programma',
          'Networking events'
        ],
        color: '#805ad5',
        maxMembers: 20,
        currentMembers: 0
      },
      {
        id: 'national',
        name: 'Landelijk Talent',
        level: 'national',
        description: 'Elite niveau voor nationale impact',
        requirements: {
          minPoints: 1000,
          minShares: 250,
          minEngagement: 12.0,
          timeInCurrentLevel: 12
        },
        benefits: [
          'Nationale leiderschapsrol',
          'VIP events en conferenties',
          'Exclusieve partnerships',
          'Mentorship van experts'
        ],
        color: '#d69e2e',
        maxMembers: 10,
        currentMembers: 0
      }
    ];
    setTalentLevels(levels);
  };

  const loadData = async () => {
    try {
      // Load talent members
      const membersQuery = query(collection(db, 'talentMembers'), orderBy('performanceScore', 'desc'));
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate.toDate(),
        levelUpDate: doc.data().levelUpDate?.toDate(),
        promotionHistory: doc.data().promotionHistory?.map((h: any) => ({
          ...h,
          date: h.date.toDate()
        })) || []
      })) as TalentMember[];
      setTalentMembers(membersData);

      // Load promotion opportunities
      const opportunitiesQuery = query(collection(db, 'promotionOpportunities'), orderBy('eligibilityScore', 'desc'));
      const opportunitiesSnapshot = await getDocs(opportunitiesQuery);
      const opportunitiesData = opportunitiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as PromotionOpportunity[];
      setPromotionOpportunities(opportunitiesData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading talent data:', error);
      setLoading(false);
    }
  };

  const calculatePerformanceScore = (member: TalentMember) => {
    const pointsWeight = 0.4;
    const sharesWeight = 0.3;
    const engagementWeight = 0.3;

    const normalizedPoints = Math.min(member.points / 1000, 1);
    const normalizedShares = Math.min(member.sharesCount / 100, 1);
    const normalizedEngagement = Math.min(member.engagementRate / 20, 1);

    return (
      normalizedPoints * pointsWeight +
      normalizedShares * sharesWeight +
      normalizedEngagement * engagementWeight
    ) * 100;
  };

  const checkEligibilityForPromotion = (member: TalentMember) => {
    const currentLevel = talentLevels.find(level => level.level === member.currentLevel);
    const nextLevel = talentLevels.find(level => {
      const levels = ['regional', 'provincial', 'national'];
      const currentIndex = levels.indexOf(member.currentLevel);
      return levels[currentIndex + 1] === level.level;
    });

    if (!currentLevel || !nextLevel) return false;

    const timeInCurrentLevel = member.levelUpDate 
      ? (new Date().getTime() - member.levelUpDate.getTime()) / (1000 * 60 * 60 * 24 * 30) // months
      : (new Date().getTime() - member.joinDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    return (
      member.points >= nextLevel.requirements.minPoints &&
      member.sharesCount >= nextLevel.requirements.minShares &&
      member.engagementRate >= nextLevel.requirements.minEngagement &&
      timeInCurrentLevel >= nextLevel.requirements.timeInCurrentLevel
    );
  };

  const promoteMember = async (memberId: string, newLevel: string) => {
    try {
      const member = talentMembers.find(m => m.id === memberId);
      if (!member) return;

      const promotionRecord = {
        fromLevel: member.currentLevel,
        toLevel: newLevel,
        date: new Date(),
        reason: 'Performance-based promotion'
      };

      const memberRef = doc(db, 'talentMembers', memberId);
      await updateDoc(memberRef, {
        currentLevel: newLevel,
        levelUpDate: new Date(),
        promotionHistory: [...member.promotionHistory, promotionRecord]
      });

      // Create promotion opportunity record
      await addDoc(collection(db, 'promotionOpportunities'), {
        memberId,
        memberName: member.userName,
        currentLevel: member.currentLevel,
        targetLevel: newLevel,
        performanceScore: member.performanceScore,
        eligibilityScore: 100,
        recommendedAction: 'promote',
        createdAt: new Date()
      });

      loadData();
    } catch (error) {
      console.error('Error promoting member:', error);
    }
  };

  const getLevelColor = (level: string) => {
    const levelData = talentLevels.find(l => l.level === level);
    return levelData?.color || '#3182ce';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'regional': return '🌟';
      case 'provincial': return '⭐';
      case 'national': return '👑';
      default: return '🌟';
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Toegang Geweigerd</h1>
          <p className="text-white/70">Je hebt geen super admin rechten om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Talent pipeline laden...</p>
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
              🚀 Talent Pipeline
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-white">Super Admin: {user?.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'pipeline' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🚀 Pipeline
            </button>
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'opportunities' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📈 Kansen
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'analytics' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'settings' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              ⚙️ Instellingen
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pipeline Tab */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              🚀 Talent Doorstroom Pipeline
            </h2>

            {/* Pipeline Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              {talentLevels.map((level) => {
                const levelMembers = talentMembers.filter(m => m.currentLevel === level.level);
                const eligibleForPromotion = levelMembers.filter(m => checkEligibilityForPromotion(m));
                
                return (
                  <div key={level.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: level.color }}
                      >
                        {getLevelIcon(level.level)}
                      </div>
                      <span className="text-white/70 text-sm">
                        {levelMembers.length}/{level.maxMembers}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">{level.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{level.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-semibold mb-2">Vereisten</h4>
                        <ul className="text-white/80 text-sm space-y-1">
                          <li>• {level.requirements.minPoints} punten</li>
                          <li>• {level.requirements.minShares} shares</li>
                          <li>• {level.requirements.minEngagement}% engagement</li>
                          <li>• {level.requirements.timeInCurrentLevel} maanden ervaring</li>
                        </ul>
                      </div>

                      <div className="bg-white/5 rounded-lg p-3">
                        <h4 className="text-white font-semibold mb-2">Voordelen</h4>
                        <ul className="text-white/80 text-sm space-y-1">
                          {level.benefits.map((benefit, index) => (
                            <li key={index}>• {benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Huidige leden:</span>
                        <span className="text-accent font-semibold">{levelMembers.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Klaar voor promotie:</span>
                        <span className="text-green-400 font-semibold">{eligibleForPromotion.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top Performers */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Top Performers</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">Lid</th>
                      <th className="text-left text-white font-semibold py-3">Niveau</th>
                      <th className="text-left text-white font-semibold py-3">Performance Score</th>
                      <th className="text-left text-white font-semibold py-3">Punten</th>
                      <th className="text-left text-white font-semibold py-3">Shares</th>
                      <th className="text-left text-white font-semibold py-3">Engagement</th>
                      <th className="text-left text-white font-semibold py-3">Status</th>
                      <th className="text-left text-white font-semibold py-3">Actie</th>
                    </tr>
                  </thead>
                  <tbody>
                    {talentMembers
                      .sort((a, b) => b.performanceScore - a.performanceScore)
                      .slice(0, 10)
                      .map((member) => {
                        const isEligible = checkEligibilityForPromotion(member);
                        const nextLevel = member.currentLevel === 'regional' ? 'provincial' : 
                                        member.currentLevel === 'provincial' ? 'national' : null;
                        
                        return (
                          <tr key={member.id} className="border-b border-white/10">
                            <td className="py-3">
                              <div className="flex items-center space-x-3">
                                {member.userPhotoURL && (
                                  <img 
                                    src={member.userPhotoURL} 
                                    alt="Profile" 
                                    className="w-8 h-8 rounded-full"
                                  />
                                )}
                                <div>
                                  <div className="text-white font-medium">{member.userName}</div>
                                  <div className="text-white/70 text-sm">{member.teamName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: getLevelColor(member.currentLevel) }}
                              >
                                {getLevelIcon(member.currentLevel)} {member.currentLevel}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="text-accent font-semibold">
                                {member.performanceScore.toFixed(1)}
                              </div>
                            </td>
                            <td className="py-3 text-white">{member.points}</td>
                            <td className="py-3 text-white">{member.sharesCount}</td>
                            <td className="py-3 text-white">{member.engagementRate.toFixed(1)}%</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isEligible ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {isEligible ? 'Klaar voor promotie' : 'In ontwikkeling'}
                              </span>
                            </td>
                            <td className="py-3">
                              {isEligible && nextLevel && (
                                <button
                                  onClick={() => {
                                    setSelectedMember(member);
                                    setShowPromotionModal(true);
                                  }}
                                  className="btn-accent text-sm"
                                >
                                  Promoveren
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Opportunities Tab */}
        {activeTab === 'opportunities' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📈 Promotie Kansen
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotionOpportunities.map((opportunity) => {
                const member = talentMembers.find(m => m.id === opportunity.memberId);
                if (!member) return null;

                return (
                  <div key={opportunity.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {member.userPhotoURL && (
                          <img 
                            src={member.userPhotoURL} 
                            alt="Profile" 
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="text-white font-medium">{member.userName}</div>
                          <div className="text-white/70 text-sm">{member.teamName}</div>
                        </div>
                      </div>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: getLevelColor(member.currentLevel) }}
                      >
                        {getLevelIcon(member.currentLevel)}
                      </span>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Huidig niveau:</span>
                        <span className="text-white">{member.currentLevel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Doel niveau:</span>
                        <span className="text-accent font-semibold">{opportunity.targetLevel}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Performance score:</span>
                        <span className="text-green-400 font-semibold">{opportunity.performanceScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Eligibility score:</span>
                        <span className="text-blue-400 font-semibold">{opportunity.eligibilityScore.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => promoteMember(member.id, opportunity.targetLevel)}
                        className="btn-primary flex-1"
                      >
                        ✅ Promoveren
                      </button>
                      <button className="btn-secondary flex-1">
                        📋 Review
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📊 Talent Analytics
            </h2>

            {/* Pipeline Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {talentMembers.length}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Talent</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {talentMembers.filter(m => checkEligibilityForPromotion(m)).length}
                  </div>
                  <div className="text-white/70 text-sm">Klaar voor Promotie</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {talentMembers.filter(m => m.currentLevel === 'national').length}
                  </div>
                  <div className="text-white/70 text-sm">Landelijk Talent</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {Math.round(talentMembers.reduce((sum, m) => sum + m.performanceScore, 0) / talentMembers.length)}
                  </div>
                  <div className="text-white/70 text-sm">Gem. Performance</div>
                </div>
              </div>
            </div>

            {/* Level Distribution */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Niveau Verdeling</h3>
              <div className="space-y-4">
                {talentLevels.map((level) => {
                  const levelMembers = talentMembers.filter(m => m.currentLevel === level.level);
                  const percentage = talentMembers.length > 0 ? (levelMembers.length / talentMembers.length) * 100 : 0;
                  
                  return (
                    <div key={level.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getLevelIcon(level.level)}</span>
                          <div>
                            <div className="text-white font-medium">{level.name}</div>
                            <div className="text-white/70 text-sm">{levelMembers.length} leden</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-accent font-semibold">{percentage.toFixed(1)}%</div>
                          <div className="text-white/70 text-sm">van totaal</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: level.color 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              ⚙️ Pipeline Instellingen
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Automatische Evaluatie</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Maandelijkse evaluatie</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Ingeschakeld
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Automatische promoties</span>
                    <button className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                      Uitgeschakeld
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Performance alerts</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Ingeschakeld
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Pipeline Configuratie</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Max regionaal</span>
                    <span className="text-accent font-semibold">50 leden</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Max provinciaal</span>
                    <span className="text-accent font-semibold">20 leden</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Max landelijk</span>
                    <span className="text-accent font-semibold">10 leden</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Promotion Modal */}
      {showPromotionModal && selectedMember && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">
              Promotie Bevestigen
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  {selectedMember.userPhotoURL && (
                    <img 
                      src={selectedMember.userPhotoURL} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <div className="text-white font-medium">{selectedMember.userName}</div>
                    <div className="text-white/70 text-sm">{selectedMember.teamName}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/70">Huidig niveau:</span>
                    <div className="text-white font-medium">{selectedMember.currentLevel}</div>
                  </div>
                  <div>
                    <span className="text-white/70">Performance score:</span>
                    <div className="text-accent font-semibold">{selectedMember.performanceScore.toFixed(1)}</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl mb-2">⬆️</div>
                <div className="text-white font-medium">
                  Promoveren naar {selectedMember.currentLevel === 'regional' ? 'Provinciaal' : 'Landelijk'} niveau
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  const nextLevel = selectedMember.currentLevel === 'regional' ? 'provincial' : 'national';
                  promoteMember(selectedMember.id, nextLevel);
                  setShowPromotionModal(false);
                }}
                className="btn-primary flex-1"
              >
                ✅ Bevestigen
              </button>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TalentPipeline;
