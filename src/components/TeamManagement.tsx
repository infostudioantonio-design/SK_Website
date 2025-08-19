import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

interface Team {
  id: string;
  name: string;
  region: string;
  description: string;
  createdAt: Date;
  memberCount: number;
  adminCount: number;
  totalShares: number;
  totalViews: number;
  isActive: boolean;
  logo?: string;
  color: string;
}

interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhotoURL?: string;
  role: 'admin' | 'member' | 'moderator';
  joinDate: Date;
  points: number;
  sharesCount: number;
  isActive: boolean;
}

interface TeamAdmin {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: 'super_admin' | 'team_admin' | 'moderator';
  permissions: string[];
  joinDate: Date;
}

const TeamManagement: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'teams' | 'members' | 'analytics' | 'settings'>('teams');
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamAdmins, setTeamAdmins] = useState<TeamAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Form states
  const [newTeam, setNewTeam] = useState({
    name: '',
    region: '',
    description: '',
    color: '#3182ce'
  });

  const [newMember, setNewMember] = useState({
    email: '',
    role: 'member' as 'admin' | 'member' | 'moderator'
  });

  useEffect(() => {
    checkSuperAdminStatus();
    loadData();
  }, []);

  const checkSuperAdminStatus = async () => {
    const superAdminEmails = ['admin@superkonnected.nl'];
    if (user && superAdminEmails.includes(user.email || '')) {
      setIsSuperAdmin(true);
    }
  };

  const loadData = async () => {
    try {
      // Load teams
      const teamsQuery = query(collection(db, 'teams'), orderBy('createdAt', 'desc'));
      const teamsSnapshot = await getDocs(teamsQuery);
      const teamsData = teamsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Team[];
      setTeams(teamsData);

      // Load team members
      const membersQuery = query(collection(db, 'teamMembers'));
      const membersSnapshot = await getDocs(membersQuery);
      const membersData = membersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate.toDate()
      })) as TeamMember[];
      setTeamMembers(membersData);

      // Load team admins
      const adminsQuery = query(collection(db, 'teamAdmins'));
      const adminsSnapshot = await getDocs(adminsQuery);
      const adminsData = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        joinDate: doc.data().joinDate.toDate()
      })) as TeamAdmin[];
      setTeamAdmins(adminsData);

      setLoading(false);
    } catch (error) {
      console.error('Error loading team data:', error);
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      const teamData = {
        ...newTeam,
        createdAt: new Date(),
        memberCount: 0,
        adminCount: 0,
        totalShares: 0,
        totalViews: 0,
        isActive: true
      };

      await addDoc(collection(db, 'teams'), teamData);
      setShowCreateTeam(false);
      setNewTeam({ name: '', region: '', description: '', color: '#3182ce' });
      loadData();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const addTeamMember = async () => {
    if (!selectedTeam) return;

    try {
      const memberData = {
        teamId: selectedTeam.id,
        userEmail: newMember.email,
        role: newMember.role,
        joinDate: new Date(),
        points: 0,
        sharesCount: 0,
        isActive: true
      };

      await addDoc(collection(db, 'teamMembers'), memberData);
      setShowAddMember(false);
      setNewMember({ email: '', role: 'member' });
      loadData();
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const getTeamStats = (teamId: string) => {
    const members = teamMembers.filter(m => m.teamId === teamId);
    const admins = teamAdmins.filter(a => a.teamId === teamId);
    
    return {
      memberCount: members.length,
      adminCount: admins.length,
      activeMembers: members.filter(m => m.isActive).length,
      totalPoints: members.reduce((sum, m) => sum + m.points, 0),
      totalShares: members.reduce((sum, m) => sum + m.sharesCount, 0)
    };
  };

  const getTeamColor = (color: string) => {
    return {
      backgroundColor: color,
      color: '#ffffff'
    };
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
          <p className="text-white text-lg">Team management laden...</p>
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
              🏢 Team Management
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
              onClick={() => setActiveTab('teams')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'teams' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              🏢 Teams
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                activeTab === 'members' ? 'tab-active' : 'tab-inactive'
              }`}
            >
              👥 Leden
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
        {/* Teams Tab */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white font-poppins">
                🏢 Regionale Teams
              </h2>
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-primary"
              >
                ➕ Nieuw Team
              </button>
            </div>

            {/* Teams Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => {
                const stats = getTeamStats(team.id);
                return (
                  <div key={team.id} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                        style={getTeamColor(team.color)}
                      >
                        {team.name.charAt(0)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        team.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {team.isActive ? 'Actief' : 'Inactief'}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">{team.name}</h3>
                    <p className="text-white/70 text-sm mb-3">{team.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Regio:</span>
                        <span className="text-white font-medium">{team.region}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Leden:</span>
                        <span className="text-accent font-semibold">{stats.memberCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Admins:</span>
                        <span className="text-blue-400 font-semibold">{stats.adminCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">Totaal punten:</span>
                        <span className="text-green-400 font-semibold">{stats.totalPoints}</span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowAddMember(true);
                        }}
                        className="btn-secondary flex-1"
                      >
                        👥 Leden
                      </button>
                      <button
                        onClick={() => setSelectedTeam(team)}
                        className="btn-accent flex-1"
                      >
                        📊 Analytics
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              👥 Team Leden Overzicht
            </h2>

            <div className="card">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">Lid</th>
                      <th className="text-left text-white font-semibold py-3">Team</th>
                      <th className="text-left text-white font-semibold py-3">Rol</th>
                      <th className="text-left text-white font-semibold py-3">Punten</th>
                      <th className="text-left text-white font-semibold py-3">Shares</th>
                      <th className="text-left text-white font-semibold py-3">Status</th>
                      <th className="text-left text-white font-semibold py-3">Lid sinds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => {
                      const team = teams.find(t => t.id === member.teamId);
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
                                <div className="text-white/70 text-sm">{member.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-white">{team?.name || 'Onbekend'}</span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                              member.role === 'moderator' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="py-3 text-accent font-semibold">{member.points}</td>
                          <td className="py-3 text-white">{member.sharesCount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {member.isActive ? 'Actief' : 'Inactief'}
                            </span>
                          </td>
                          <td className="py-3 text-white/70 text-sm">
                            {member.joinDate.toLocaleDateString('nl-NL')}
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

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white font-poppins">
              📊 Team Analytics
            </h2>

            {/* Team Performance Overview */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">
                    {teams.length}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Teams</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {teamMembers.length}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Leden</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">
                    {teamMembers.reduce((sum, m) => sum + m.points, 0)}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Punten</div>
                </div>
              </div>
              <div className="card">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">
                    {teamMembers.reduce((sum, m) => sum + m.sharesCount, 0)}
                  </div>
                  <div className="text-white/70 text-sm">Totaal Shares</div>
                </div>
              </div>
            </div>

            {/* Team Comparison */}
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">Team Vergelijking</h3>
              <div className="space-y-4">
                {teams.map((team) => {
                  const stats = getTeamStats(team.id);
                  const avgPoints = stats.memberCount > 0 ? Math.round(stats.totalPoints / stats.memberCount) : 0;
                  
                  return (
                    <div key={team.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={getTeamColor(team.color)}
                          >
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-white font-medium">{team.name}</div>
                            <div className="text-white/70 text-sm">{team.region}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-accent font-semibold">{stats.memberCount} leden</div>
                          <div className="text-white/70 text-sm">Gem. {avgPoints} punten</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-green-400 font-semibold">{stats.totalPoints}</div>
                          <div className="text-white/70 text-sm">Punten</div>
                        </div>
                        <div>
                          <div className="text-blue-400 font-semibold">{stats.totalShares}</div>
                          <div className="text-white/70 text-sm">Shares</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-semibold">{stats.adminCount}</div>
                          <div className="text-white/70 text-sm">Admins</div>
                        </div>
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
              ⚙️ Team Instellingen
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Team Permissions</h3>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Team Admin</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Leden beheren</li>
                      <li>• Team analytics bekijken</li>
                      <li>• Content modereren</li>
                      <li>• Team instellingen wijzigen</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Moderator</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Content modereren</li>
                      <li>• Basis analytics bekijken</li>
                      <li>• Leden ondersteunen</li>
                    </ul>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Lid</h4>
                    <ul className="text-white/80 text-sm space-y-1">
                      <li>• Deelnemen aan activiteiten</li>
                      <li>• Content delen</li>
                      <li>• Punten verdienen</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold text-white mb-4">Systeem Instellingen</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white">Auto-team toewijzing</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Ingeschakeld
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Team analytics</span>
                    <button className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                      Ingeschakeld
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white">Cross-team sharing</span>
                    <button className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm">
                      Uitgeschakeld
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">Nieuw Team Aanmaken</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Team naam"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="input-field"
              />
              <input
                type="text"
                placeholder="Regio (bijv. Amsterdam, Groningen)"
                value={newTeam.region}
                onChange={(e) => setNewTeam({ ...newTeam, region: e.target.value })}
                className="input-field"
              />
              <textarea
                placeholder="Team beschrijving"
                value={newTeam.description}
                onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                className="input-field"
                rows={3}
              />
              <input
                type="color"
                value={newTeam.color}
                onChange={(e) => setNewTeam({ ...newTeam, color: e.target.value })}
                className="w-full h-12 rounded-lg border border-white/20 bg-white/5"
              />
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createTeam}
                className="btn-primary flex-1"
              >
                Team Aanmaken
              </button>
              <button
                onClick={() => setShowCreateTeam(false)}
                className="btn-secondary flex-1"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && selectedTeam && (
        <div className="modal-overlay">
          <div className="modal-content bounce-in">
            <h3 className="text-xl font-semibold text-white mb-4">
              Lid Toevoegen aan {selectedTeam.name}
            </h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email adres"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                className="input-field"
              />
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                className="input-field"
              >
                <option value="member">Lid</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={addTeamMember}
                className="btn-primary flex-1"
              >
                Toevoegen
              </button>
              <button
                onClick={() => setShowAddMember(false)}
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

export default TeamManagement;
