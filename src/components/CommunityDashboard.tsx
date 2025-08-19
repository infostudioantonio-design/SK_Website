import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, getDocs, addDoc, query, where, orderBy, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface PodcastSession {
  id: string;
  title: string;
  date: string;
  participants: string[];
  maxParticipants: number;
  description: string;
  host: string;
  category: string;
}

interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: Date;
  likes: string[];
  authorAvatar?: string;
}

interface UserProfile {
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
}

const CommunityDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [podcastSessions, setPodcastSessions] = useState<PodcastSession[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [socialShares, setSocialShares] = useState<SocialShare[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sessions' | 'community' | 'profile' | 'social'>('sessions');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showSocialSharingModal, setShowSocialSharingModal] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadUserProfile(user);
        loadData();
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (user: User) => {
    try {
      const userDoc = await getDocs(query(collection(db, 'userProfiles'), where('uid', '==', user.uid)));
      if (userDoc.empty) {
        // Create new profile
        const newProfile: UserProfile = {
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
          joinDate: new Date(),
          points: 0,
          socialSharingEnabled: false,
          sharingFrequency: 3,
          totalShares: 0
        };
        await addDoc(collection(db, 'userProfiles'), newProfile);
        setUserProfile(newProfile);
      } else {
        setUserProfile(userDoc.docs[0].data() as UserProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load podcast sessions
      const sessionsQuery = query(
        collection(db, 'podcastSessions'),
        orderBy('date', 'asc')
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PodcastSession[];
      setPodcastSessions(sessions);

      // Load community posts
      const postsQuery = query(
        collection(db, 'communityPosts'),
        orderBy('timestamp', 'desc')
      );
      const postsSnapshot = await getDocs(postsQuery);
      const posts = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as CommunityPost[];
      setCommunityPosts(posts);

      // Load social shares
      const sharesQuery = query(
        collection(db, 'socialShares'),
        orderBy('timestamp', 'desc')
      );
      const sharesSnapshot = await getDocs(sharesQuery);
      const shares = sharesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as SocialShare[];
      setSocialShares(shares);

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const joinPodcastSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const sessionRef = doc(db, 'podcastSessions', sessionId);
      await updateDoc(sessionRef, {
        participants: arrayUnion(user.uid)
      });
      loadData(); // Reload data
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const leavePodcastSession = async (sessionId: string) => {
    if (!user) return;

    try {
      const sessionRef = doc(db, 'podcastSessions', sessionId);
      await updateDoc(sessionRef, {
        participants: arrayRemove(user.uid)
      });
      loadData(); // Reload data
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    try {
      const postData = {
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorAvatar: user.photoURL,
        content: newPost,
        timestamp: new Date(),
        likes: []
      };

      await addDoc(collection(db, 'communityPosts'), postData);
      setNewPost('');
      loadData(); // Reload posts
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const postRef = doc(db, 'communityPosts', postId);
      const post = communityPosts.find(p => p.id === postId);
      
      if (post) {
        const isLiked = post.likes.includes(user.uid);
        await updateDoc(postRef, {
          likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid)
        });
        loadData(); // Reload posts
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const createPodcastSession = async (sessionData: Omit<PodcastSession, 'id' | 'participants'>) => {
    if (!user) return;

    try {
      const newSession = {
        ...sessionData,
        participants: [user.uid],
        host: user.displayName || 'Anonymous'
      };
      await addDoc(collection(db, 'podcastSessions'), newSession);
      setShowCreateSession(false);
      loadData();
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const updateSocialSharingSettings = async (enabled: boolean, frequency: 3 | 5 | 7) => {
    if (!user || !userProfile) return;

    try {
      const userRef = doc(db, 'userProfiles', userProfile.uid);
      await updateDoc(userRef, {
        socialSharingEnabled: enabled,
        sharingFrequency: frequency
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        socialSharingEnabled: enabled,
        sharingFrequency: frequency
      });

      setShowSocialSharingModal(false);
    } catch (error) {
      console.error('Error updating social sharing settings:', error);
    }
  };

  const generateSocialShareContent = (session: PodcastSession) => {
    const platforms = {
      linkedin: `🎙️ Nieuwe podcast sessie: "${session.title}"\n\n${session.description}\n\n📅 ${new Date(session.date).toLocaleDateString('nl-NL')}\n👥 Host: ${session.host}\n\n#SuperKonnected #Podcast #Networking #Business\n\nJoin de community: superkonnected.nl`,
      twitter: `🎙️ Nieuwe podcast: "${session.title}"\n\n📅 ${new Date(session.date).toLocaleDateString('nl-NL')}\n👥 ${session.host}\n\n#SuperKonnected #Podcast`,
      facebook: `🎙️ Nieuwe podcast sessie: "${session.title}"\n\n${session.description}\n\n📅 ${new Date(session.date).toLocaleDateString('nl-NL')}\n👥 Host: ${session.host}\n\nSuperKonnected - Van netwerken naar verbinden`,
      instagram: `🎙️ Nieuwe podcast sessie: "${session.title}"\n\n📅 ${new Date(session.date).toLocaleDateString('nl-NL')}\n👥 Host: ${session.host}\n\n#SuperKonnected #Podcast #Networking #Business`
    };
    return platforms;
  };

  const createSocialShare = async (platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram', session: PodcastSession) => {
    if (!user || !userProfile) return;

    try {
      const content = generateSocialShareContent(session);
      const pointsEarned = platform === 'linkedin' ? 10 : 5; // LinkedIn gives more points

      const shareData: Omit<SocialShare, 'id'> = {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        platform,
        content: content[platform],
        timestamp: new Date(),
        pointsEarned,
        status: 'pending'
      };

      await addDoc(collection(db, 'socialShares'), shareData);

      // Update user points
      const userRef = doc(db, 'userProfiles', userProfile.uid);
      await updateDoc(userRef, {
        points: userProfile.points + pointsEarned,
        totalShares: userProfile.totalShares + 1,
        lastSharedDate: new Date()
      });

      // Update local state
      setUserProfile({
        ...userProfile,
        points: userProfile.points + pointsEarned,
        totalShares: userProfile.totalShares + 1,
        lastSharedDate: new Date()
      });

      loadData(); // Reload data
    } catch (error) {
      console.error('Error creating social share:', error);
    }
  };

  const getPointsLevel = (points: number) => {
    if (points >= 1000) return { level: 'Master', color: 'text-purple-400', icon: '👑' };
    if (points >= 500) return { level: 'Expert', color: 'text-yellow-400', icon: '⭐' };
    if (points >= 200) return { level: 'Pro', color: 'text-blue-400', icon: '🔥' };
    if (points >= 50) return { level: 'Active', color: 'text-green-400', icon: '🌟' };
    return { level: 'Beginner', color: 'text-gray-400', icon: '🌱' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Community laden...</p>
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
              SuperKonnected Community
            </h1>
            <div className="flex items-center space-x-4">
              {userProfile && (
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <span className="text-sm text-white">{userProfile.points} punten</span>
                  <span className="text-sm">{getPointsLevel(userProfile.points).icon}</span>
                </div>
              )}
              {user?.photoURL && (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-white">Welkom, {user?.displayName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-primary/50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🎙️ Podcast Sessies
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'community' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              💬 Community
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'social' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📱 Social Sharing
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'profile' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              👤 Profiel
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Podcast Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                🎙️ Aankomende Podcast Opnames
              </h2>
              <button
                onClick={() => setShowCreateSession(true)}
                className="btn-primary"
              >
                + Nieuwe Sessie
              </button>
            </div>
            
            {podcastSessions.length === 0 ? (
              <div className="card">
                <p className="text-white/80 text-center">
                  Nog geen podcast opnames gepland. Houd de community in de gaten!
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {podcastSessions.map((session) => {
                  const isParticipant = session.participants.includes(user?.uid || '');
                  const isFull = session.participants.length >= session.maxParticipants;
                  
                  return (
                    <div key={session.id} className="card card-hover session-card fade-in">
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
                      
                      {isParticipant ? (
                        <button
                          onClick={() => leavePodcastSession(session.id)}
                          className="btn-secondary w-full"
                        >
                          Uitschrijven
                        </button>
                      ) : (
                        <button
                          onClick={() => joinPodcastSession(session.id)}
                          disabled={isFull}
                          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isFull ? 'Vol' : 'Deelnemen'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Community Tab */}
        {activeTab === 'community' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              💬 Community
            </h2>
            
            {/* Create Post */}
            <div className="card">
              <div className="flex items-start space-x-3">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-10 h-10 profile-image"
                  />
                )}
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Deel je gedachten met de community..."
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={createPost}
                    disabled={!newPost.trim()}
                    className="btn-primary mt-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post plaatsen
                  </button>
                </div>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {communityPosts.length === 0 ? (
                <div className="card">
                  <p className="text-white/80 text-center">
                    Nog geen posts. Wees de eerste om iets te delen!
                  </p>
                </div>
              ) : (
                communityPosts.map((post) => {
                  const isLiked = post.likes.includes(user?.uid || '');
                  
                  return (
                    <div key={post.id} className="card card-hover fade-in">
                      <div className="flex items-start space-x-3">
                        {post.authorAvatar && (
                          <img 
                            src={post.authorAvatar} 
                            alt="Profile" 
                            className="w-10 h-10 profile-image"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-white">
                              {post.authorName}
                            </span>
                            <span className="text-white/50 text-sm">
                              {post.timestamp.toLocaleDateString('nl-NL')}
                            </span>
                          </div>
                          <p className="text-white/90 mb-3">{post.content}</p>
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => toggleLike(post.id)}
                              className={`like-button flex items-center space-x-1 text-sm ${
                                isLiked ? 'liked' : 'text-white/70 hover:text-white'
                              }`}
                            >
                              <span>{isLiked ? '❤️' : '🤍'}</span>
                              <span>{post.likes.length} likes</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Social Sharing Tab */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                📱 Social Media Sharing
              </h2>
              <button
                onClick={() => setShowSocialSharingModal(true)}
                className="btn-accent"
              >
                ⚙️ Instellingen
              </button>
            </div>

            {/* Social Sharing Status */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Automatische Sharing Status
                  </h3>
                  <p className="text-white/70">
                    {userProfile?.socialSharingEnabled 
                      ? `✅ Actief - ${userProfile.sharingFrequency}x per week`
                      : '❌ Niet actief'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-accent">
                    {userProfile?.points || 0}
                  </div>
                  <div className="text-sm text-white/70">Totaal punten</div>
                </div>
              </div>

              {userProfile?.socialSharingEnabled && (
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Volgende shares deze week:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['LinkedIn', 'Twitter', 'Facebook'].map((platform, index) => (
                      <div key={platform} className="text-center">
                        <div className="text-2xl mb-2">
                          {platform === 'LinkedIn' ? '💼' : platform === 'Twitter' ? '🐦' : '📘'}
                        </div>
                        <div className="text-white font-medium">{platform}</div>
                        <div className="text-white/70 text-sm">
                          {platform === 'LinkedIn' ? '+10 punten' : '+5 punten'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Manual Sharing */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">
                Handmatig delen
              </h3>
              <p className="text-white/70 mb-4">
                Deel podcast sessies handmatig op je social media kanalen en verdien punten!
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {podcastSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="bg-white/5 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">{session.title}</h4>
                    <p className="text-white/70 text-sm mb-3">{session.description.substring(0, 100)}...</p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => createSocialShare('linkedin', session)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors"
                      >
                        💼 LinkedIn
                      </button>
                      <button
                        onClick={() => createSocialShare('twitter', session)}
                        className="flex-1 bg-blue-400 hover:bg-blue-500 text-white text-sm py-2 px-3 rounded transition-colors"
                      >
                        🐦 Twitter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Shares */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">
                Recente Shares
              </h3>
              <div className="space-y-3">
                {socialShares
                  .filter(share => share.userId === user?.uid)
                  .slice(0, 5)
                  .map((share) => (
                    <div key={share.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {share.platform === 'linkedin' ? '💼' : 
                           share.platform === 'twitter' ? '🐦' : 
                           share.platform === 'facebook' ? '📘' : '📷'}
                        </span>
                        <div>
                          <div className="text-white font-medium capitalize">{share.platform}</div>
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
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              👤 Mijn Profiel
            </h2>
            
            <div className="card fade-in">
              <div className="flex items-center space-x-6 mb-6">
                {user?.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-20 h-20 profile-image"
                  />
                )}
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {user?.displayName}
                  </h3>
                  <p className="text-white/70">{user?.email}</p>
                  <p className="text-white/50 text-sm">
                    Lid sinds {userProfile?.joinDate.toLocaleDateString('nl-NL')}
                  </p>
                </div>
              </div>
              
              {/* Points and Level */}
              {userProfile && (
                <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {userProfile.points} punten
                      </div>
                      <div className={`text-lg font-semibold ${getPointsLevel(userProfile.points).color}`}>
                        {getPointsLevel(userProfile.points).icon} {getPointsLevel(userProfile.points).level}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/70 text-sm">Volgende level:</div>
                      <div className="text-white font-medium">
                        {userProfile.points < 50 ? '50 punten' :
                         userProfile.points < 200 ? '200 punten' :
                         userProfile.points < 500 ? '500 punten' :
                         userProfile.points < 1000 ? '1000 punten' : 'Max level!'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Statistieken</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white/70">Posts gemaakt:</span>
                      <span className="text-white">
                        {communityPosts.filter(p => p.authorId === user?.uid).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Sessies gevolgd:</span>
                      <span className="text-white">
                        {podcastSessions.filter(s => s.participants.includes(user?.uid || '')).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Totaal likes:</span>
                      <span className="text-white">
                        {communityPosts
                          .filter(p => p.authorId === user?.uid)
                          .reduce((sum, post) => sum + post.likes.length, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Social shares:</span>
                      <span className="text-white">
                        {userProfile?.totalShares || 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Mijn Sessies</h4>
                  <div className="space-y-2">
                    {podcastSessions
                      .filter(s => s.participants.includes(user?.uid || ''))
                      .slice(0, 3)
                      .map(session => (
                        <div key={session.id} className="text-sm">
                          <span className="text-white">{session.title}</span>
                          <span className="text-white/50 ml-2">
                            {new Date(session.date).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-bold text-white mb-4">Nieuwe Podcast Sessie</h3>
            <CreateSessionForm 
              onSubmit={createPodcastSession}
              onCancel={() => setShowCreateSession(false)}
            />
          </div>
        </div>
      )}

      {/* Social Sharing Settings Modal */}
      {showSocialSharingModal && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-bold text-white mb-4">Social Media Sharing Instellingen</h3>
            <SocialSharingSettings
              userProfile={userProfile}
              onSave={updateSocialSharingSettings}
              onCancel={() => setShowSocialSharingModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Create Session Form Component
const CreateSessionForm: React.FC<{
  onSubmit: (data: Omit<PodcastSession, 'id' | 'participants'>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    maxParticipants: 5,
    category: 'Business',
    host: 'Admin' // Adding the missing host property
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Titel
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="input-field w-full"
          required
        />
      </div>
      
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Beschrijving
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="input-field w-full"
          rows={3}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Datum
          </label>
          <input
            type="datetime-local"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="input-field w-full"
            required
          />
        </div>
        
        <div>
          <label className="block text-white text-sm font-medium mb-2">
            Max Deelnemers
          </label>
          <input
            type="number"
            value={formData.maxParticipants}
            onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
            className="input-field w-full"
            min="1"
            max="20"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Categorie
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="input-field w-full"
        >
          <option value="Business">Business</option>
          <option value="Technology">Technology</option>
          <option value="Marketing">Marketing</option>
          <option value="Finance">Finance</option>
          <option value="Health">Health</option>
        </select>
      </div>
      
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Annuleren
        </button>
        <button
          type="submit"
          className="btn-primary flex-1"
        >
          Sessie Aanmaken
        </button>
      </div>
    </form>
  );
};

// Social Sharing Settings Component
const SocialSharingSettings: React.FC<{
  userProfile: UserProfile | null;
  onSave: (enabled: boolean, frequency: 3 | 5 | 7) => void;
  onCancel: () => void;
}> = ({ userProfile, onSave, onCancel }) => {
  const [enabled, setEnabled] = useState(userProfile?.socialSharingEnabled || false);
  const [frequency, setFrequency] = useState<3 | 5 | 7>(userProfile?.sharingFrequency || 3);

  const handleSave = () => {
    onSave(enabled, frequency);
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 text-accent bg-white/10 border-white/20 rounded focus:ring-accent"
          />
          <span className="text-white font-medium">Automatische social media sharing inschakelen</span>
        </label>
        <p className="text-white/70 text-sm mt-2">
          SuperKonnected posts automatisch delen op je social media kanalen
        </p>
      </div>

      {enabled && (
        <div>
          <label className="block text-white text-sm font-medium mb-3">
            Sharing frequentie per week
          </label>
          <div className="space-y-3">
            {[
              { value: 3, label: '3x per week', description: 'Basis niveau' },
              { value: 5, label: '5x per week', description: 'Actief niveau' },
              { value: 7, label: '7x per week', description: 'Premium niveau' }
            ].map((option) => (
              <label key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  value={option.value}
                  checked={frequency === option.value}
                  onChange={(e) => setFrequency(parseInt(e.target.value) as 3 | 5 | 7)}
                  className="w-4 h-4 text-accent bg-white/10 border-white/20 focus:ring-accent"
                />
                <div>
                  <span className="text-white font-medium">{option.label}</span>
                  <div className="text-white/70 text-sm">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-semibold mb-2">Punten systeem</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">LinkedIn share:</span>
            <span className="text-accent">+10 punten</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Twitter share:</span>
            <span className="text-accent">+5 punten</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Facebook share:</span>
            <span className="text-accent">+5 punten</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Instagram share:</span>
            <span className="text-accent">+5 punten</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary flex-1"
        >
          Annuleren
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn-primary flex-1"
        >
          Instellingen Opslaan
        </button>
      </div>
    </div>
  );
};

export default CommunityDashboard;
