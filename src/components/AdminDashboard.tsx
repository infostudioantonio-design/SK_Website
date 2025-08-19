import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { analyticsService } from '../services/analyticsService';

interface AdminUser {
  uid: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
}

interface SocialShare {
  id: string;
  userId: string;
  userName: string;
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  content: string;
  timestamp: Date;
  pointsEarned: number;
  status: 'pending' | 'shared' | 'failed';
  shareUrl?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  points: number;
  socialSharingEnabled: boolean;
  sharingFrequency: 3 | 5 | 7;
  lastSharedDate?: Date;
  totalShares: number;
}

interface PodcastSession {
  id: string;
  title: string;
  date: string;
  participants: string[];
  maxParticipants: number;
  description: string;
  host: string;
  category: string;
  autoShareEnabled: boolean;
  sharesGenerated: number;
}

interface PlatformAnalytics {
  platform: string;
  totalShares: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  engagementRate: number;
  topPerformers: Array<{
    userName: string;
    shares: number;
    views: number;
  }>;
}

interface AdminDashboardProps {
  user: User | null;
  isAdmin: boolean;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, isAdmin }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'users' | 'sessions' | 'shares' | 'team'>('overview');
  const [socialShares, setSocialShares] = useState<SocialShare[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [podcastSessions, setPodcastSessions] = useState<PodcastSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<PodcastSession | null>(null);
  const [platformAnalytics, setPlatformAnalytics] = useState<PlatformAnalytics[]>([]);
  const [platformStats, setPlatformStats] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    loadPlatformStats();
  }, []);

  const loadData = async () => {
    try {
      // Load social shares
      const sharesQuery = query(collection(db, 'socialShares'), orderBy('timestamp', 'desc'));
      const sharesSnapshot = await getDocs(sharesQuery);
      const shares = sharesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as SocialShare[];
      setSocialShares(shares);

      // Load user profiles
      const usersQuery = query(collection(db, 'userProfiles'));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        ...doc.data()
      })) as UserProfile[];
      setUserProfiles(users);

      // Load podcast sessions
      const sessionsQuery = query(collection(db, 'podcastSessions'), orderBy('date', 'desc'));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PodcastSession[];
      setPodcastSessions(sessions);

      // Calculate platform analytics
      calculatePlatformAnalytics(shares);

      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setLoading(false);
    }
  };

  const calculatePlatformAnalytics = (shares: SocialShare[]) => {
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const analytics: PlatformAnalytics[] = [];

    platforms.forEach(platform => {
      const platformShares = shares.filter(share => share.platform === platform);
      const totalShares = platformShares.length;
      const totalViews = platformShares.reduce((sum, share) => sum + (share.views || 0), 0);
      const totalLikes = platformShares.reduce((sum, share) => sum + (share.likes || 0), 0);
      const totalComments = platformShares.reduce((sum, share) => sum + (share.comments || 0), 0);
      const totalSharesCount = platformShares.reduce((sum, share) => sum + (share.shares || 0), 0);
      const engagementRate = totalShares > 0 ? ((totalLikes + totalComments + totalSharesCount) / totalViews) * 100 : 0;

      // Get top performers for this platform
      const userStats = new Map<string, { shares: number; views: number }>();
      platformShares.forEach(share => {
        const current = userStats.get(share.userName) || { shares: 0, views: 0 };
        userStats.set(share.userName, {
          shares: current.shares + 1,
          views: current.views + (share.views || 0)
        });
      });

      const topPerformers = Array.from(userStats.entries())
        .map(([userName, stats]) => ({ userName, ...stats }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      analytics.push({
        platform,
        totalShares: totalSharesCount,
        totalViews,
        totalLikes,
        totalComments,
        engagementRate,
        topPerformers
      });
    });

    setPlatformAnalytics(analytics);
  };

  const loadPlatformStats = async () => {
    try {
      const stats = await analyticsService.getPlatformStats();
      setPlatformStats(stats);
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const updateAnalytics = async () => {
    try {
      await analyticsService.updateAllSharesAnalytics();
      loadData();
      loadPlatformStats();
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  };

  const enableAutoShareForSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, 'podcastSessions', sessionId);
      await updateDoc(sessionRef, {
        autoShareEnabled: true
      });

      // Trigger automatic sharing for all users with sharing enabled
      const usersWithSharing = userProfiles.filter(user => user.socialSharingEnabled);
      
      for (const user of usersWithSharing) {
        // This would trigger the automatic sharing process
        // In a real implementation, you'd call the scheduler service
        console.log(`Triggering auto-share for user: ${user.displayName}`);
      }

      loadData(); // Reload data
    } catch (error) {
      console.error('Error enabling auto-share:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return '💼';
      case 'twitter': return '🐦';
      case 'facebook': return '📘';
      case 'instagram': return '📷';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'text-blue-600';
      case 'twitter': return 'text-blue-400';
      case 'facebook': return 'text-blue-800';
      case 'instagram': return 'text-pink-500';
      default: return 'text-gray-600';
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Toegang Geweigerd</h1>
          <p className="text-white/70">Je hebt geen admin rechten om deze pagina te bekijken.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Admin dashboard laden...</p>
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
              🛠️ Admin Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-white">Beheerder: {user?.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'overview' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📊 Overzicht
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'analytics' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📈 Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'users' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              👥 Gebruikers
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🎙️ Sessies
            </button>
                         <button
               onClick={() => setActiveTab('shares')}
               className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                 activeTab === 'shares' ? 'tab-active' : 'tab-inactive'
               }`}
             >
               📱 Shares
             </button>
             <button
               onClick={() => setActiveTab('team')}
               className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                 activeTab === 'team' ? 'tab-active' : 'tab-inactive'
               }`}
             >
               👥 Team
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📊 Dashboard Overzicht
            </h2>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {userProfiles.filter(u => u.socialSharingEnabled).length}
                  </div>
                  <div className="text-white/70 text-sm">Actieve Sharers</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {socialShares.length}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Shares</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {socialShares.reduce((sum, share) => sum + (share.views || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Views</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {podcastSessions.length}
                  </div>
                  <div className="text-white/70 text-sm">Podcast Sessies</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Recente Shares</h3>
                <div className="space-y-3">
                  {socialShares.slice(0, 5).map((share) => (
                    <div key={share.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getPlatformIcon(share.platform)}</span>
                        <div>
                          <div className="text-white font-medium">{share.userName}</div>
                          <div className="text-white/70 text-sm">
                            {share.timestamp.toLocaleDateString('nl-NL')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-semibold">+{share.pointsEarned}</div>
                        <div className="text-white/70 text-sm">punten</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Top Performers</h3>
                <div className="space-y-3">
                  {userProfiles
                    .sort((a, b) => b.totalShares - a.totalShares)
                    .slice(0, 5)
                    .map((user) => (
                      <div key={user.uid} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          {user.photoURL && (
                            <img 
                              src={user.photoURL} 
                              alt="Profile" 
                              className="w-8 h-8 rounded-full"
                            />
                          )}
                          <div>
                            <div className="text-white font-medium">{user.displayName}</div>
                            <div className="text-white/70 text-sm">{user.totalShares} shares</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-accent font-semibold">{user.points}</div>
                          <div className="text-white/70 text-sm">punten</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white font-poppins">
                📈 Platform Analytics
              </h2>
              <button
                onClick={updateAnalytics}
                className="btn-accent"
              >
                🔄 Analytics Vernieuwen
              </button>
            </div>

            {/* Platform Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {platformStats.map((stats) => (
                <div key={stats.platform} className="card">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{getPlatformIcon(stats.platform)}</div>
                    <div className="text-xl font-bold text-white capitalize">{stats.platform}</div>
                    <div className="text-2xl font-bold text-accent mt-2">
                      {stats.totalPosts}
                    </div>
                    <div className="text-white/70 text-sm">Posts</div>
                    <div className="text-lg font-semibold text-green-400 mt-2">
                      {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="text-white/70 text-sm">Views</div>
                    <div className="text-sm text-white/60 mt-2">
                      {stats.averageEngagementRate.toFixed(1)}% engagement
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Analytics */}
            <div className="grid md:grid-cols-2 gap-6">
              {platformStats.map((stats) => (
                <div key={stats.platform} className="card">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <span className="text-2xl mr-2">{getPlatformIcon(stats.platform)}</span>
                    {stats.platform.charAt(0).toUpperCase() + stats.platform.slice(1)} Analytics
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-400">{stats.totalLikes}</div>
                        <div className="text-white/70 text-sm">Likes</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{stats.totalComments}</div>
                        <div className="text-white/70 text-sm">Comments</div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-3">
                      <h4 className="text-white font-semibold mb-2">Top Performing Posts</h4>
                      <div className="space-y-2">
                        {stats.topPerformingPosts.map((post: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-white/80 text-sm">Post #{index + 1}</span>
                            <div className="text-right">
                              <div className="text-accent text-sm font-semibold">{post.views} views</div>
                              <div className="text-white/60 text-xs">{post.likes} likes</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              👥 Gebruikers Overzicht
            </h2>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">Gebruiker</th>
                      <th className="text-left text-white font-semibold py-3">Status</th>
                      <th className="text-left text-white font-semibold py-3">Frequentie</th>
                      <th className="text-left text-white font-semibold py-3">Shares</th>
                      <th className="text-left text-white font-semibold py-3">Punten</th>
                      <th className="text-left text-white font-semibold py-3">Laatste Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProfiles.map((user) => (
                      <tr key={user.uid} className="border-b border-white/10">
                        <td className="py-3">
                          <div className="flex items-center space-x-3">
                            {user.photoURL && (
                              <img 
                                src={user.photoURL} 
                                alt="Profile" 
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <div className="text-white font-medium">{user.displayName}</div>
                              <div className="text-white/70 text-sm">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.socialSharingEnabled 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {user.socialSharingEnabled ? 'Actief' : 'Inactief'}
                          </span>
                        </td>
                        <td className="py-3 text-white">
                          {user.socialSharingEnabled ? `${user.sharingFrequency}x/week` : '-'}
                        </td>
                        <td className="py-3 text-white">{user.totalShares}</td>
                        <td className="py-3 text-accent font-semibold">{user.points}</td>
                        <td className="py-3 text-white/70 text-sm">
                          {user.lastSharedDate 
                            ? new Date(user.lastSharedDate).toLocaleDateString('nl-NL')
                            : 'Nooit'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              🎙️ Podcast Sessies Beheer
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcastSessions.map((session) => (
                <div key={session.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`category-badge category-${session.category.toLowerCase()}`}>
                      {session.category}
                    </span>
                    <span className="text-white/50 text-sm">
                      {new Date(session.date).toLocaleDateString('nl-NL')}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {session.title}
                  </h3>
                  <p className="text-white/80 mb-3 text-sm">{session.description}</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white/70 text-sm">
                      Host: {session.host}
                    </span>
                    <span className="text-white/70 text-sm">
                      {session.participants.length}/{session.maxParticipants}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Auto-share:</span>
                      <span className={`font-medium ${
                        session.autoShareEnabled ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {session.autoShareEnabled ? 'Ingeschakeld' : 'Uitgeschakeld'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Shares gegenereerd:</span>
                      <span className="text-accent font-semibold">{session.sharesGenerated || 0}</span>
                    </div>
                  </div>

                  {!session.autoShareEnabled && (
                    <button
                      onClick={() => enableAutoShareForSession(session.id)}
                      className="btn-primary w-full mt-3"
                    >
                      🔄 Auto-share Inschakelen
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shares Tab */}
        {activeTab === 'shares' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📱 Alle Social Shares
            </h2>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">Gebruiker</th>
                      <th className="text-left text-white font-semibold py-3">Platform</th>
                      <th className="text-left text-white font-semibold py-3">Status</th>
                      <th className="text-left text-white font-semibold py-3">Views</th>
                      <th className="text-left text-white font-semibold py-3">Engagement</th>
                      <th className="text-left text-white font-semibold py-3">Datum</th>
                      <th className="text-left text-white font-semibold py-3">Punten</th>
                    </tr>
                  </thead>
                  <tbody>
                    {socialShares.map((share) => (
                      <tr key={share.id} className="border-b border-white/10">
                        <td className="py-3">
                          <div className="text-white font-medium">{share.userName}</div>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl">{getPlatformIcon(share.platform)}</span>
                            <span className="text-white capitalize">{share.platform}</span>
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            share.status === 'shared' 
                              ? 'bg-green-500/20 text-green-400'
                              : share.status === 'pending'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {share.status === 'shared' ? 'Gedeeld' : 
                             share.status === 'pending' ? 'In behandeling' : 'Mislukt'}
                          </span>
                        </td>
                        <td className="py-3 text-white">
                          {share.views ? share.views.toLocaleString() : '-'}
                        </td>
                        <td className="py-3">
                          <div className="text-sm">
                            <div className="text-white">❤️ {share.likes || 0}</div>
                            <div className="text-white/70">💬 {share.comments || 0}</div>
                          </div>
                        </td>
                        <td className="py-3 text-white/70 text-sm">
                          {share.timestamp.toLocaleDateString('nl-NL')}
                        </td>
                        <td className="py-3 text-accent font-semibold">
                          +{share.pointsEarned}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
                 )}

         {/* Team Tab */}
         {activeTab === 'team' && (
           <div className="space-y-6">
             <h2 className="text-3xl font-bold text-white font-poppins">
               👥 Team Management
             </h2>

             <div className="grid md:grid-cols-2 gap-6">
               {/* Admin Team Members */}
               <div className="card">
                 <h3 className="text-xl font-semibold text-white mb-4">Admin Team Leden</h3>
                 <div className="space-y-3">
                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                         <span className="text-white font-bold">A</span>
                       </div>
                       <div>
                         <div className="text-white font-medium">Admin</div>
                         <div className="text-white/70 text-sm">admin@superkonnected.nl</div>
                       </div>
                     </div>
                     <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                       Super Admin
                     </span>
                   </div>

                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                         <span className="text-white font-bold">I</span>
                       </div>
                       <div>
                         <div className="text-white font-medium">Info</div>
                         <div className="text-white/70 text-sm">info@superkonnected.nl</div>
                       </div>
                     </div>
                     <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                       Admin
                     </span>
                   </div>

                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                         <span className="text-white font-bold">A</span>
                       </div>
                       <div>
                         <div className="text-white font-medium">Abdul</div>
                         <div className="text-white/70 text-sm">abdul@superkonnected.nl</div>
                       </div>
                     </div>
                     <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                       Admin
                     </span>
                   </div>

                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                         <span className="text-white font-bold">T</span>
                       </div>
                       <div>
                         <div className="text-white font-medium">Team</div>
                         <div className="text-white/70 text-sm">team@superkonnected.nl</div>
                       </div>
                     </div>
                     <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                       Admin
                     </span>
                   </div>

                   <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                         <span className="text-white font-bold">S</span>
                       </div>
                       <div>
                         <div className="text-white font-medium">Support</div>
                         <div className="text-white/70 text-sm">support@superkonnected.nl</div>
                       </div>
                     </div>
                     <span className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full text-xs">
                       Admin
                     </span>
                   </div>
                 </div>
               </div>

               {/* Admin Permissions */}
               <div className="card">
                 <h3 className="text-xl font-semibold text-white mb-4">Admin Permissions</h3>
                 <div className="space-y-4">
                   <div className="bg-white/5 rounded-lg p-4">
                     <h4 className="text-white font-semibold mb-2">Super Admin</h4>
                     <ul className="text-white/80 text-sm space-y-1">
                       <li>• Volledige toegang tot alle functies</li>
                       <li>• Team leden toevoegen/verwijderen</li>
                       <li>• Systeem instellingen wijzigen</li>
                       <li>• Database beheer</li>
                     </ul>
                   </div>

                   <div className="bg-white/5 rounded-lg p-4">
                     <h4 className="text-white font-semibold mb-2">Admin</h4>
                     <ul className="text-white/80 text-sm space-y-1">
                       <li>• Gebruikers beheren</li>
                       <li>• Podcast sessies beheren</li>
                       <li>• Analytics bekijken</li>
                       <li>• Social shares beheren</li>
                     </ul>
                   </div>

                   <div className="bg-white/5 rounded-lg p-4">
                     <h4 className="text-white font-semibold mb-2">Support</h4>
                     <ul className="text-white/80 text-sm space-y-1">
                       <li>• Gebruikers ondersteunen</li>
                       <li>• Basis analytics bekijken</li>
                       <li>• Rapportages genereren</li>
                     </ul>
                   </div>
                 </div>
               </div>
             </div>

             {/* Add New Team Member */}
             <div className="card">
               <h3 className="text-xl font-semibold text-white mb-4">Nieuw Team Lid Toevoegen</h3>
               <div className="grid md:grid-cols-3 gap-4">
                 <input
                   type="email"
                   placeholder="Email adres"
                   className="input-field"
                 />
                 <select className="input-field">
                   <option value="">Selecteer rol</option>
                   <option value="admin">Admin</option>
                   <option value="support">Support</option>
                 </select>
                 <button className="btn-primary">
                   ➕ Toevoegen
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default AdminDashboard;
