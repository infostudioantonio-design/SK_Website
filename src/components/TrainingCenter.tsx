import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface TrainingModule {
  id: string;
  title: string;
  category: 'podcast' | 'presentation' | 'networking' | 'leadership' | 'technical';
  description: string;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  instructorPhoto?: string;
  thumbnail?: string;
  videoUrl?: string;
  materials: TrainingMaterial[];
  exercises: TrainingExercise[];
  prerequisites: string[];
  learningObjectives: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrolledCount: number;
  completionRate: number;
  rating: number;
  tags: string[];
}

interface TrainingMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'audio' | 'link' | 'template';
  url: string;
  description: string;
  isRequired: boolean;
}

interface TrainingExercise {
  id: string;
  title: string;
  description: string;
  type: 'practice' | 'assignment' | 'quiz' | 'roleplay';
  duration: number; // minutes
  instructions: string;
  expectedOutcome: string;
}

interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  moduleTitle: string;
  progress: number; // 0-100
  completedSections: string[];
  currentSection: string;
  startedAt: Date;
  completedAt?: Date;
  exercisesCompleted: string[];
  certificateEarned: boolean;
  certificateUrl?: string;
  notes: string;
  rating?: number;
  feedback?: string;
}

interface TrainingSession {
  id: string;
  moduleId: string;
  title: string;
  instructor: string;
  date: Date;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  location: 'online' | 'offline' | 'hybrid';
  meetingUrl?: string;
  address?: string;
  description: string;
  isActive: boolean;
  participants: string[];
}

const TrainingCenter: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'modules' | 'sessions' | 'progress' | 'create'>('modules');
  const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [showCreateModule, setShowCreateModule] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [newModule, setNewModule] = useState({
    title: '',
    category: 'podcast' as TrainingModule['category'],
    description: '',
    duration: 60,
    difficulty: 'beginner' as TrainingModule['difficulty'],
    instructor: '',
    prerequisites: [] as string[],
    learningObjectives: [] as string[],
    tags: [] as string[]
  });

  const [newSession, setNewSession] = useState({
    moduleId: '',
    title: '',
    instructor: '',
    date: new Date(),
    duration: 120,
    maxParticipants: 20,
    location: 'online' as 'online' | 'offline' | 'hybrid',
    description: ''
  });

  useEffect(() => {
    checkAdminStatus();
    loadData();
  }, []);

  const checkAdminStatus = async () => {
    const adminEmails = ['admin@superkonnected.nl', 'abdul@superkonnected.nl', 'team@superkonnected.nl'];
    if (user && adminEmails.includes(user.email || '')) {
      setIsAdmin(true);
    }
  };

  const loadData = async () => {
    try {
      // Load training modules
      const modulesQuery = query(collection(db, 'trainingModules'), orderBy('createdAt', 'desc'));
      const modulesSnapshot = await getDocs(modulesQuery);
      const modulesData = modulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate()
      })) as TrainingModule[];
      setTrainingModules(modulesData);

      // Load user progress
      if (user) {
        const progressQuery = query(collection(db, 'userProgress'), where('userId', '==', user.uid));
        const progressSnapshot = await getDocs(progressQuery);
        const progressData = progressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startedAt: doc.data().startedAt.toDate(),
          completedAt: doc.data().completedAt?.toDate()
        })) as UserProgress[];
        setUserProgress(progressData);
      }

      // Load training sessions
      const sessionsQuery = query(collection(db, 'trainingSessions'), orderBy('date', 'asc'));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      const sessionsData = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
      })) as TrainingSession[];
      setTrainingSessions(sessionsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading training data:', error);
      setLoading(false);
    }
  };

  const createTrainingModule = async () => {
    try {
      const moduleData = {
        ...newModule,
        materials: [],
        exercises: [],
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        enrolledCount: 0,
        completionRate: 0,
        rating: 0
      };

      await addDoc(collection(db, 'trainingModules'), moduleData);
      setShowCreateModule(false);
      setNewModule({
        title: '',
        category: 'podcast',
        description: '',
        duration: 60,
        difficulty: 'beginner',
        instructor: '',
        prerequisites: [],
        learningObjectives: [],
        tags: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating training module:', error);
    }
  };

  const createTrainingSession = async () => {
    try {
      const sessionData = {
        ...newSession,
        currentParticipants: 0,
        isActive: true,
        participants: []
      };

      await addDoc(collection(db, 'trainingSessions'), sessionData);
      setShowCreateSession(false);
      setNewSession({
        moduleId: '',
        title: '',
        instructor: '',
        date: new Date(),
        duration: 120,
        maxParticipants: 20,
        location: 'online',
        description: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating training session:', error);
    }
  };

  const enrollInModule = async (moduleId: string) => {
    try {
      const module = trainingModules.find(m => m.id === moduleId);
      if (!module || !user) return;

      const progressData = {
        userId: user.uid,
        moduleId,
        moduleTitle: module.title,
        progress: 0,
        completedSections: [],
        currentSection: 'introduction',
        startedAt: new Date(),
        exercisesCompleted: [],
        certificateEarned: false,
        notes: ''
      };

      await addDoc(collection(db, 'userProgress'), progressData);
      loadData();
    } catch (error) {
      console.error('Error enrolling in module:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'podcast': return '🎙️';
      case 'presentation': return '🎤';
      case 'networking': return '🤝';
      case 'leadership': return '👑';
      case 'technical': return '💻';
      default: return '📚';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Training center laden...</p>
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
              🎓 Training Center
            </h1>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <button
                  onClick={() => setShowCreateModule(true)}
                  className="btn-primary"
                >
                  ➕ Nieuwe Module
                </button>
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
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'modules' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📚 Modules
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'sessions' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🎯 Sessies
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'progress' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📊 Mijn Voortgang
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('create')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'create' ? 'tab-active' : 'tab-inactive'
                }`}
              >
                ⚙️ Beheer
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                📚 Training Modules
              </h2>
              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alle Categorieën</option>
                  <option value="podcast">🎙️ Podcast</option>
                  <option value="presentation">🎤 Presentatie</option>
                  <option value="networking">🤝 Netwerken</option>
                  <option value="leadership">👑 Leiderschap</option>
                  <option value="technical">💻 Technisch</option>
                </select>
              </div>
            </div>

            {/* Featured Podcast Module */}
            <div className="card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
              <div className="flex items-start space-x-6">
                <div className="text-6xl">🎙️</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Podcast Mastery: Van Beginner tot Expert
                  </h3>
                  <p className="text-white/80 mb-4">
                    Leer alles over podcast voorbereiding, presentatie skills, en hoe je het beste voor de dag komt. 
                    Van technische aspecten tot storytelling en audience engagement.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">🎯 Voorbereiding</span>
                    <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">🎤 Presentatie</span>
                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">📈 Engagement</span>
                    <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm">💡 Storytelling</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm text-white/70">
                    <span>⏱️ 120 minuten</span>
                    <span>👤 Abdul Antonio</span>
                    <span>⭐ 4.8/5</span>
                    <span>👥 150+ deelnemers</span>
                  </div>
                </div>
                <button className="btn-primary">
                  Start Training
                </button>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingModules
                .filter(module => selectedCategory === 'all' || module.category === selectedCategory)
                .map((module) => {
                  const userModuleProgress = userProgress.find(p => p.moduleId === module.id);
                  
                  return (
                    <div key={module.id} className="card hover:scale-105 transition-transform">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">{getCategoryIcon(module.category)}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">{module.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{module.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Duur:</span>
                          <span className="text-white">{module.duration} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Instructor:</span>
                          <span className="text-white">{module.instructor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Deelnemers:</span>
                          <span className="text-accent font-semibold">{module.enrolledCount}</span>
                        </div>
                        {userModuleProgress && (
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Voortgang:</span>
                            <span className={`font-semibold ${getProgressColor(userModuleProgress.progress)}`}>
                              {userModuleProgress.progress}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        {userModuleProgress ? (
                          <button className="btn-accent flex-1">
                            {userModuleProgress.progress === 100 ? '✅ Voltooid' : '▶️ Doorgaan'}
                          </button>
                        ) : (
                          <button
                            onClick={() => enrollInModule(module.id)}
                            className="btn-primary flex-1"
                          >
                            Start Module
                          </button>
                        )}
                        <button className="btn-secondary">
                          📋 Details
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                🎯 Live Training Sessies
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateSession(true)}
                  className="btn-primary"
                >
                  ➕ Nieuwe Sessie
                </button>
              )}
            </div>

            {/* Upcoming Sessions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trainingSessions
                .filter(session => session.isActive && session.date > new Date())
                .map((session) => {
                  const module = trainingModules.find(m => m.id === session.moduleId);
                  
                  return (
                    <div key={session.id} className="card">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">🎯</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          session.currentParticipants >= session.maxParticipants 
                            ? 'bg-red-500/20 text-red-400' 
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {session.currentParticipants >= session.maxParticipants ? 'Vol' : 'Beschikbaar'}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">{session.title}</h3>
                      <p className="text-white/70 text-sm mb-4">{session.description}</p>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Datum:</span>
                          <span className="text-white">{session.date.toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Tijd:</span>
                          <span className="text-white">{session.date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Duur:</span>
                          <span className="text-white">{session.duration} min</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Instructor:</span>
                          <span className="text-white">{session.instructor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Deelnemers:</span>
                          <span className="text-accent font-semibold">
                            {session.currentParticipants}/{session.maxParticipants}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Locatie:</span>
                          <span className="text-white capitalize">{session.location}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button className="btn-primary flex-1">
                          Aanmelden
                        </button>
                        <button className="btn-secondary">
                          📋 Details
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📊 Mijn Training Voortgang
            </h2>

            {/* Progress Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {userProgress.length}
                  </div>
                  <div className="text-white/70 text-sm">Gestarte Modules</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {userProgress.filter(p => p.progress === 100).length}
                  </div>
                  <div className="text-white/70 text-sm">Voltooide Modules</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {Math.round(userProgress.reduce((sum, p) => sum + p.progress, 0) / userProgress.length || 0)}%
                  </div>
                  <div className="text-white/70 text-sm">Gem. Voortgang</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {userProgress.filter(p => p.certificateEarned).length}
                  </div>
                  <div className="text-white/70 text-sm">Certificaten</div>
                </div>
              </div>
            </div>

            {/* My Modules */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Mijn Modules</h3>
              <div className="space-y-4">
                {userProgress.map((progress) => {
                  const module = trainingModules.find(m => m.id === progress.moduleId);
                  if (!module) return null;

                  return (
                    <div key={progress.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getCategoryIcon(module.category)}</div>
                          <div>
                            <div className="text-white font-medium">{module.title}</div>
                            <div className="text-white/70 text-sm">{module.instructor}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getProgressColor(progress.progress)}`}>
                            {progress.progress}%
                          </div>
                          <div className="text-white/70 text-sm">
                            {progress.progress === 100 ? 'Voltooid' : 'In progress'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                        <div 
                          className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-accent to-blue-500"
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-white/70">
                          Gestart: {progress.startedAt.toLocaleDateString('nl-NL')}
                        </div>
                        <div className="flex space-x-2">
                          {progress.progress === 100 && progress.certificateEarned && (
                            <button className="btn-accent text-sm">
                              🏆 Certificaat
                            </button>
                          )}
                          <button className="btn-primary text-sm">
                            {progress.progress === 100 ? 'Herbekijken' : 'Doorgaan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Create/Manage Tab */}
        {activeTab === 'create' && isAdmin && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              ⚙️ Training Beheer
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Module Statistieken</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Totaal modules:</span>
                    <span className="text-accent font-semibold">{trainingModules.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Gepubliceerd:</span>
                    <span className="text-green-400 font-semibold">
                      {trainingModules.filter(m => m.isPublished).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Totaal deelnemers:</span>
                    <span className="text-blue-400 font-semibold">
                      {trainingModules.reduce((sum, m) => sum + m.enrolledCount, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Gem. rating:</span>
                    <span className="text-purple-400 font-semibold">
                      {Math.round(trainingModules.reduce((sum, m) => sum + m.rating, 0) / trainingModules.length || 0)}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Sessie Statistieken</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Aankomende sessies:</span>
                    <span className="text-accent font-semibold">
                      {trainingSessions.filter(s => s.isActive && s.date > new Date()).length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Totaal deelnemers:</span>
                    <span className="text-green-400 font-semibold">
                      {trainingSessions.reduce((sum, s) => sum + s.currentParticipants, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Online sessies:</span>
                    <span className="text-blue-400 font-semibold">
                      {trainingSessions.filter(s => s.location === 'online').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Module Modal */}
      {showCreateModule && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Nieuwe Training Module</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Module titel"
                value={newModule.title}
                onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                className="input-field"
              />
              <select
                value={newModule.category}
                onChange={(e) => setNewModule({ ...newModule, category: e.target.value as any })}
                className="input-field"
              >
                <option value="podcast">🎙️ Podcast</option>
                <option value="presentation">🎤 Presentatie</option>
                <option value="networking">🤝 Netwerken</option>
                <option value="leadership">👑 Leiderschap</option>
                <option value="technical">💻 Technisch</option>
              </select>
              <textarea
                placeholder="Module beschrijving"
                value={newModule.description}
                onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                className="input-field"
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Duur (minuten)"
                  value={newModule.duration}
                  onChange={(e) => setNewModule({ ...newModule, duration: parseInt(e.target.value) })}
                  className="input-field"
                />
                <select
                  value={newModule.difficulty}
                  onChange={(e) => setNewModule({ ...newModule, difficulty: e.target.value as any })}
                  className="input-field"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Instructor naam"
                value={newModule.instructor}
                onChange={(e) => setNewModule({ ...newModule, instructor: e.target.value })}
                className="input-field"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTrainingModule}
                className="btn-primary flex-1"
              >
                Module Aanmaken
              </button>
              <button
                onClick={() => setShowCreateModule(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">Nieuwe Training Sessie</h3>
            <div className="space-y-4">
              <select
                value={newSession.moduleId}
                onChange={(e) => setNewSession({ ...newSession, moduleId: e.target.value })}
                className="input-field"
              >
                <option value="">Selecteer module</option>
                {trainingModules.map(module => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Sessie titel"
                value={newSession.title}
                onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Instructor"
                value={newSession.instructor}
                onChange={(e) => setNewSession({ ...newSession, instructor: e.target.value })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={newSession.date.toISOString().slice(0, 16)}
                  onChange={(e) => setNewSession({ ...newSession, date: new Date(e.target.value) })}
                  className="input-field"
                />
                <input
                  type="number"
                  placeholder="Duur (minuten)"
                  value={newSession.duration}
                  onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newSession.location}
                  onChange={(e) => setNewSession({ ...newSession, location: e.target.value as any })}
                  className="input-field"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="hybrid">Hybrid</option>
                </select>
                <input
                  type="number"
                  placeholder="Max deelnemers"
                  value={newSession.maxParticipants}
                  onChange={(e) => setNewSession({ ...newSession, maxParticipants: parseInt(e.target.value) })}
                  className="input-field"
                />
              </div>
              <textarea
                placeholder="Sessie beschrijving"
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                className="input-field"
                rows={3}
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTrainingSession}
                className="btn-primary flex-1"
              >
                Sessie Aanmaken
              </button>
              <button
                onClick={() => setShowCreateSession(false)}
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

export default TrainingCenter;
