import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface PodcastSuggestion {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  title: string;
  description: string;
  category: 'business' | 'technology' | 'health' | 'education' | 'entertainment' | 'other';
  guestSuggestion?: string;
  topicIdeas: string[];
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'reviewed' | 'approved' | 'rejected' | 'implemented';
  adminResponse?: string;
  adminResponseDate?: Date;
  adminResponder?: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface CommunityMessage {
  id: string;
  type: 'announcement' | 'update' | 'event' | 'feedback' | 'question';
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  isPinned: boolean;
  isPublic: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  readBy: string[];
  responses: MessageResponse[];
  tags: string[];
  attachments?: string[];
}

interface MessageResponse {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Date;
  isAdminResponse: boolean;
  likes: number;
}

interface CommunityPoll {
  id: string;
  title: string;
  description: string;
  options: PollOption[];
  authorId: string;
  authorName: string;
  isActive: boolean;
  endDate: Date;
  createdAt: Date;
  totalVotes: number;
  allowMultipleVotes: boolean;
  resultsVisible: boolean;
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

interface FeedbackItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  type: 'bug' | 'feature' | 'improvement' | 'complaint' | 'praise';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: 'platform' | 'podcast' | 'training' | 'community' | 'other';
  adminResponse?: string;
  adminResponseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
}

const CommunityHub: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'messages' | 'polls' | 'feedback' | 'create'>('suggestions');
  const [podcastSuggestions, setPodcastSuggestions] = useState<PodcastSuggestion[]>([]);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>([]);
  const [communityPolls, setCommunityPolls] = useState<CommunityPoll[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSuggestion, setShowCreateSuggestion] = useState(false);
  const [showCreateMessage, setShowCreateMessage] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);
  const [showCreateFeedback, setShowCreateFeedback] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Form states
  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: '',
    category: 'business' as PodcastSuggestion['category'],
    guestSuggestion: '',
    topicIdeas: [] as string[],
    urgency: 'medium' as PodcastSuggestion['urgency'],
    tags: [] as string[]
  });

  const [newMessage, setNewMessage] = useState({
    type: 'announcement' as CommunityMessage['type'],
    title: '',
    content: '',
    priority: 'medium' as CommunityMessage['priority'],
    isPublic: true,
    tags: [] as string[]
  });

  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    options: ['', ''] as string[],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    allowMultipleVotes: false,
    resultsVisible: true
  });

  const [newFeedback, setNewFeedback] = useState({
    type: 'feature' as FeedbackItem['type'],
    title: '',
    description: '',
    priority: 'medium' as FeedbackItem['priority'],
    category: 'platform' as FeedbackItem['category']
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
      // Load podcast suggestions
      const suggestionsQuery = query(collection(db, 'podcastSuggestions'), orderBy('createdAt', 'desc'));
      const suggestionsSnapshot = await getDocs(suggestionsQuery);
      const suggestionsData = suggestionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        adminResponseDate: doc.data().adminResponseDate?.toDate()
      })) as PodcastSuggestion[];
      setPodcastSuggestions(suggestionsData);

      // Load community messages
      const messagesQuery = query(collection(db, 'communityMessages'), orderBy('createdAt', 'desc'));
      const messagesSnapshot = await getDocs(messagesQuery);
      const messagesData = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        responses: doc.data().responses?.map((r: any) => ({
          ...r,
          createdAt: r.createdAt.toDate()
        })) || []
      })) as CommunityMessage[];
      setCommunityMessages(messagesData);

      // Load community polls
      const pollsQuery = query(collection(db, 'communityPolls'), orderBy('createdAt', 'desc'));
      const pollsSnapshot = await getDocs(pollsQuery);
      const pollsData = pollsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        endDate: doc.data().endDate.toDate()
      })) as CommunityPoll[];
      setCommunityPolls(pollsData);

      // Load feedback items
      const feedbackQuery = query(collection(db, 'feedbackItems'), orderBy('createdAt', 'desc'));
      const feedbackSnapshot = await getDocs(feedbackQuery);
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        adminResponseDate: doc.data().adminResponseDate?.toDate()
      })) as FeedbackItem[];
      setFeedbackItems(feedbackData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading community data:', error);
      setLoading(false);
    }
  };

  const createPodcastSuggestion = async () => {
    try {
      if (!user) return;

      const suggestionData = {
        ...newSuggestion,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        userPhotoURL: user.photoURL || '',
        status: 'pending',
        votes: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'podcastSuggestions'), suggestionData);
      setShowCreateSuggestion(false);
      setNewSuggestion({
        title: '',
        description: '',
        category: 'business',
        guestSuggestion: '',
        topicIdeas: [],
        urgency: 'medium',
        tags: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating podcast suggestion:', error);
    }
  };

  const createCommunityMessage = async () => {
    try {
      if (!user) return;

      const messageData = {
        ...newMessage,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || '',
        isPinned: false,
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        readBy: [],
        responses: []
      };

      await addDoc(collection(db, 'communityMessages'), messageData);
      setShowCreateMessage(false);
      setNewMessage({
        type: 'announcement',
        title: '',
        content: '',
        priority: 'medium',
        isPublic: true,
        tags: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating community message:', error);
    }
  };

  const createCommunityPoll = async () => {
    try {
      if (!user) return;

      const pollData = {
        ...newPoll,
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        isActive: true,
        createdAt: new Date(),
        totalVotes: 0,
        options: newPoll.options.filter(option => option.trim() !== '').map((option, index) => ({
          id: `option-${index}`,
          text: option,
          votes: 0,
          voters: []
        }))
      };

      await addDoc(collection(db, 'communityPolls'), pollData);
      setShowCreatePoll(false);
      setNewPoll({
        title: '',
        description: '',
        options: ['', ''],
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        allowMultipleVotes: false,
        resultsVisible: true
      });
      loadData();
    } catch (error) {
      console.error('Error creating community poll:', error);
    }
  };

  const createFeedback = async () => {
    try {
      if (!user) return;

      const feedbackData = {
        ...newFeedback,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email || '',
        userPhotoURL: user.photoURL || '',
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'feedbackItems'), feedbackData);
      setShowCreateFeedback(false);
      setNewFeedback({
        type: 'feature',
        title: '',
        description: '',
        priority: 'medium',
        category: 'platform'
      });
      loadData();
    } catch (error) {
      console.error('Error creating feedback:', error);
    }
  };

  const respondToSuggestion = async (suggestionId: string, response: string, status: PodcastSuggestion['status']) => {
    try {
      const suggestionRef = doc(db, 'podcastSuggestions', suggestionId);
      await updateDoc(suggestionRef, {
        adminResponse: response,
        adminResponseDate: new Date(),
        adminResponder: user?.displayName || 'Admin',
        status,
        updatedAt: new Date()
      });
      loadData();
    } catch (error) {
      console.error('Error responding to suggestion:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return '💼';
      case 'technology': return '💻';
      case 'health': return '🏥';
      case 'education': return '📚';
      case 'entertainment': return '🎬';
      default: return '🎙️';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-500/20 text-green-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      case 'high': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'reviewed': return 'bg-blue-500/20 text-blue-400';
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'implemented': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'announcement': return '📢';
      case 'update': return '🔄';
      case 'event': return '📅';
      case 'feedback': return '💬';
      case 'question': return '❓';
      default: return '📝';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Community hub laden...</p>
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
              🤝 Community Hub
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateSuggestion(true)}
                className="btn-primary"
              >
                🎙️ Podcast Suggestie
              </button>
              {isAdmin && (
                <button
                  onClick={() => setShowCreateMessage(true)}
                  className="btn-accent"
                >
                  📢 Bericht
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
              onClick={() => setActiveTab('suggestions')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'suggestions' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🎙️ Podcast Suggesties
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'messages' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📢 Berichten
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'polls' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              📊 Polls
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'feedback' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              💬 Feedback
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'create' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              ➕ Maken
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Podcast Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                🎙️ Podcast Suggesties
              </h2>
              <div className="flex space-x-2">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="all">Alle Suggesties</option>
                  <option value="pending">In Afwachting</option>
                  <option value="approved">Goedgekeurd</option>
                  <option value="implemented">Geïmplementeerd</option>
                </select>
              </div>
            </div>

            {/* Suggestions Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcastSuggestions
                .filter(suggestion => selectedFilter === 'all' || suggestion.status === selectedFilter)
                .map((suggestion) => (
                  <div key={suggestion.id} className="card hover:scale-105 transition-transform">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">{getCategoryIcon(suggestion.category)}</div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(suggestion.urgency)}`}>
                          {suggestion.urgency}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(suggestion.status)}`}>
                          {suggestion.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">{suggestion.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{suggestion.description}</p>

                    {suggestion.guestSuggestion && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <h4 className="text-white font-semibold mb-1">Gast Suggestie</h4>
                        <p className="text-white/80 text-sm">{suggestion.guestSuggestion}</p>
                      </div>
                    )}

                    {suggestion.topicIdeas.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2">Topic Ideeën</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.topicIdeas.map((topic, index) => (
                            <span key={index} className="bg-accent/20 text-accent px-2 py-1 rounded-full text-xs">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Door:</span>
                        <span className="text-white">{suggestion.userName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Datum:</span>
                        <span className="text-white">{suggestion.createdAt.toLocaleDateString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Stemmen:</span>
                        <span className="text-accent font-semibold">{suggestion.votes}</span>
                      </div>
                    </div>

                    {suggestion.adminResponse && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                        <h4 className="text-blue-400 font-semibold mb-1">Admin Reactie</h4>
                        <p className="text-white/80 text-sm">{suggestion.adminResponse}</p>
                        <div className="text-white/60 text-xs mt-2">
                          {suggestion.adminResponder} - {suggestion.adminResponseDate?.toLocaleDateString('nl-NL')}
                        </div>
                      </div>
                    )}

                    <div className="flex space-x-2">
                      <button className="btn-primary flex-1">
                        👍 Stemmen
                      </button>
                      {isAdmin && (
                        <button className="btn-secondary">
                          📝 Reageren
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📢 Community Berichten
            </h2>

            {/* Pinned Messages */}
            {communityMessages.filter(m => m.isPinned).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">📌 Vastgepinde Berichten</h3>
                {communityMessages
                  .filter(m => m.isPinned)
                  .map((message) => (
                    <div key={message.id} className="card bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getMessageTypeIcon(message.type)}</div>
                          <div>
                            <h4 className="text-white font-semibold">{message.title}</h4>
                            <div className="text-white/70 text-sm">{message.authorName}</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                      <p className="text-white/80 mb-4">{message.content}</p>
                      <div className="flex justify-between items-center text-sm text-white/70">
                        <span>{message.createdAt.toLocaleDateString('nl-NL')}</span>
                        <span>{message.responses.length} reacties</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Regular Messages */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">📝 Recente Berichten</h3>
              {communityMessages
                .filter(m => !m.isPinned)
                .slice(0, 10)
                .map((message) => (
                  <div key={message.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{getMessageTypeIcon(message.type)}</div>
                        <div>
                          <h4 className="text-white font-semibold">{message.title}</h4>
                          <div className="text-white/70 text-sm">{message.authorName}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(message.priority)}`}>
                        {message.priority}
                      </span>
                    </div>
                    <p className="text-white/80 mb-4">{message.content}</p>
                    <div className="flex justify-between items-center text-sm text-white/70">
                      <span>{message.createdAt.toLocaleDateString('nl-NL')}</span>
                      <span>{message.responses.length} reacties</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Polls Tab */}
        {activeTab === 'polls' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                📊 Community Polls
              </h2>
              <button
                onClick={() => setShowCreatePoll(true)}
                className="btn-primary"
              >
                ➕ Nieuwe Poll
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {communityPolls
                .filter(poll => poll.isActive && poll.endDate > new Date())
                .map((poll) => (
                  <div key={poll.id} className="card">
                    <h3 className="text-xl font-semibold text-white mb-2">{poll.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{poll.description}</p>
                    
                    <div className="space-y-3 mb-4">
                      {poll.options.map((option) => {
                        const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                        return (
                          <div key={option.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white">{option.text}</span>
                              <span className="text-accent font-semibold">{option.votes} stemmen</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-gradient-to-r from-accent to-blue-500 transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-xs text-white/70">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center text-sm text-white/70">
                      <span>Totaal: {poll.totalVotes} stemmen</span>
                      <span>Eindigt: {poll.endDate.toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                💬 Feedback & Verbeteringen
              </h2>
              <button
                onClick={() => setShowCreateFeedback(true)}
                className="btn-primary"
              >
                ➕ Nieuwe Feedback
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedbackItems.map((feedback) => (
                <div key={feedback.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">
                      {feedback.type === 'bug' ? '🐛' : 
                       feedback.type === 'feature' ? '✨' : 
                       feedback.type === 'improvement' ? '🚀' : 
                       feedback.type === 'complaint' ? '😞' : '👍'}
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(feedback.priority)}`}>
                        {feedback.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                        {feedback.status}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2">{feedback.title}</h3>
                  <p className="text-white/70 text-sm mb-4">{feedback.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Door:</span>
                      <span className="text-white">{feedback.userName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Categorie:</span>
                      <span className="text-white capitalize">{feedback.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Datum:</span>
                      <span className="text-white">{feedback.createdAt.toLocaleDateString('nl-NL')}</span>
                    </div>
                  </div>

                  {feedback.adminResponse && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                      <h4 className="text-blue-400 font-semibold mb-1">Admin Reactie</h4>
                      <p className="text-white/80 text-sm">{feedback.adminResponse}</p>
                      <div className="text-white/60 text-xs mt-2">
                        {feedback.adminResponseDate?.toLocaleDateString('nl-NL')}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button className="btn-primary flex-1">
                      👍 Ondersteunen
                    </button>
                    {isAdmin && (
                      <button className="btn-secondary">
                        📝 Reageren
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              ➕ Community Content Maken
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowCreateSuggestion(true)}>
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Podcast Suggestie</h3>
                <p className="text-white/70 text-sm">Stel een podcast onderwerp of gast voor</p>
              </div>

              <div className="card text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowCreatePoll(true)}>
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-white mb-2">Community Poll</h3>
                <p className="text-white/70 text-sm">Maak een poll voor de community</p>
              </div>

              <div className="card text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowCreateFeedback(true)}>
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-xl font-semibold text-white mb-2">Feedback</h3>
                <p className="text-white/70 text-sm">Geef feedback of meld een probleem</p>
              </div>

              {isAdmin && (
                <div className="card text-center hover:scale-105 transition-transform cursor-pointer" onClick={() => setShowCreateMessage(true)}>
                  <div className="text-6xl mb-4">📢</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Community Bericht</h3>
                  <p className="text-white/70 text-sm">Plaats een bericht voor de community</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Suggestion Modal */}
      {showCreateSuggestion && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">🎙️ Nieuwe Podcast Suggestie</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Podcast titel"
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                className="input-field"
              />
              <select
                value={newSuggestion.category}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, category: e.target.value as any })}
                className="input-field"
              >
                <option value="business">💼 Business</option>
                <option value="technology">💻 Technology</option>
                <option value="health">🏥 Health</option>
                <option value="education">📚 Education</option>
                <option value="entertainment">🎬 Entertainment</option>
                <option value="other">🎙️ Other</option>
              </select>
              <textarea
                placeholder="Beschrijving van je podcast idee"
                value={newSuggestion.description}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                className="input-field"
                rows={4}
              />
              <input
                type="text"
                placeholder="Gast suggestie (optioneel)"
                value={newSuggestion.guestSuggestion}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, guestSuggestion: e.target.value })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newSuggestion.urgency}
                  onChange={(e) => setNewSuggestion({ ...newSuggestion, urgency: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hoog</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createPodcastSuggestion}
                className="btn-primary flex-1"
              >
                Suggestie Indienen
              </button>
              <button
                onClick={() => setShowCreateSuggestion(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Message Modal */}
      {showCreateMessage && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">📢 Nieuw Community Bericht</h3>
            <div className="space-y-4">
              <select
                value={newMessage.type}
                onChange={(e) => setNewMessage({ ...newMessage, type: e.target.value as any })}
                className="input-field"
              >
                <option value="announcement">📢 Aankondiging</option>
                <option value="update">🔄 Update</option>
                <option value="event">📅 Event</option>
                <option value="feedback">💬 Feedback</option>
                <option value="question">❓ Vraag</option>
              </select>
              <input
                type="text"
                placeholder="Bericht titel"
                value={newMessage.title}
                onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Bericht inhoud"
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                className="input-field"
                rows={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hoog</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createCommunityMessage}
                className="btn-primary flex-1"
              >
                Bericht Plaatsen
              </button>
              <button
                onClick={() => setShowCreateMessage(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Poll Modal */}
      {showCreatePoll && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">📊 Nieuwe Community Poll</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Poll titel"
                value={newPoll.title}
                onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Poll beschrijving"
                value={newPoll.description}
                onChange={(e) => setNewPoll({ ...newPoll, description: e.target.value })}
                className="input-field"
                rows={3}
              />
              <div className="space-y-2">
                <label className="text-white font-semibold">Poll opties</label>
                {newPoll.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    placeholder={`Optie ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options];
                      newOptions[index] = e.target.value;
                      setNewPoll({ ...newPoll, options: newOptions });
                    }}
                    className="input-field"
                  />
                ))}
                <button
                  onClick={() => setNewPoll({ ...newPoll, options: [...newPoll.options, ''] })}
                  className="btn-secondary text-sm"
                >
                  + Optie Toevoegen
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="datetime-local"
                  value={newPoll.endDate.toISOString().slice(0, 16)}
                  onChange={(e) => setNewPoll({ ...newPoll, endDate: new Date(e.target.value) })}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createCommunityPoll}
                className="btn-primary flex-1"
              >
                Poll Aanmaken
              </button>
              <button
                onClick={() => setShowCreatePoll(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Feedback Modal */}
      {showCreateFeedback && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in max-w-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">💬 Nieuwe Feedback</h3>
            <div className="space-y-4">
              <select
                value={newFeedback.type}
                onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value as any })}
                className="input-field"
              >
                <option value="feature">✨ Feature Request</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="improvement">🚀 Verbetering</option>
                <option value="complaint">😞 Klacht</option>
                <option value="praise">👍 Compliment</option>
              </select>
              <select
                value={newFeedback.category}
                onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value as any })}
                className="input-field"
              >
                <option value="platform">Platform</option>
                <option value="podcast">Podcast</option>
                <option value="training">Training</option>
                <option value="community">Community</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Feedback titel"
                value={newFeedback.title}
                onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Beschrijf je feedback in detail"
                value={newFeedback.description}
                onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                className="input-field"
                rows={6}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={newFeedback.priority}
                  onChange={(e) => setNewFeedback({ ...newFeedback, priority: e.target.value as any })}
                  className="input-field"
                >
                  <option value="low">Laag</option>
                  <option value="medium">Medium</option>
                  <option value="high">Hoog</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createFeedback}
                className="btn-primary flex-1"
              >
                Feedback Indienen
              </button>
              <button
                onClick={() => setShowCreateFeedback(false)}
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

export default CommunityHub;
