import React, { useEffect, useState } from 'react';
import UserCard from '../UserCard';
import type { User, Invitation, Page, Team } from '../../types';
import { apiService } from '../../services/apiService';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface DashboardProps {
  setActivePage: (page: Page) => void;
  user: User | null;
  onViewProfile: (user: User) => void;
}

const CreateTeamForm: React.FC<{ user: User }> = ({ user }) => {
    const [teamName, setTeamName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim()) return;
        setIsLoading(true);
        try {
            await apiService.createTeam(teamName, user);
            // The onSnapshot listener in App.tsx will handle updating the user
            // object, which will cause this component to re-render correctly.
            setTeamName('');
        } catch (error) {
            console.error("Failed to create team:", error);
            // Optionally, set an error message to display to the user
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="text-center py-4">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't joined or created a team yet.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
             <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Your Team's Name"
                className="w-full sm:w-auto flex-grow px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                required
             />
             <button 
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
              >
                {isLoading ? 'Creating...' : 'Create a Team'}
              </button>
          </div>
        </form>
    );
}

const TeamStatusCard: React.FC<{ team: Team, user: User }> = ({ team, user }) => {
    const [isLeaving, setIsLeaving] = useState(false);

    const handleLeaveTeam = async () => {
        if (!window.confirm("Are you sure you want to leave this team? This action cannot be undone.")) return;
        setIsLeaving(true);
        try {
            await apiService.leaveTeam(user, team.id);
            // The real-time listeners on App.tsx will handle the rest.
        } catch (error) {
            alert(`Error: ${(error as Error).message}`);
            setIsLeaving(false);
        }
    };

    return (
    <div className="py-4">
        <h4 className="font-bold text-center text-lg text-indigo-700 dark:text-indigo-300 mb-3">{team.name}</h4>
        <div className="flex justify-center -space-x-2">
            {team.members.map(member => (
                <div key={member.id} title={member.name} className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm border-2 border-white dark:border-gray-800">
                    {member.avatarInitial}
                </div>
            ))}
        </div>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">{team.members.length} member(s)</p>
        <div className="mt-4 text-center">
            <button 
                onClick={handleLeaveTeam}
                disabled={isLeaving}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold disabled:opacity-50 transition-colors"
            >
                {isLeaving ? 'Leaving...' : 'Leave Team'}
            </button>
        </div>
    </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ setActivePage, user, onViewProfile }) => {
  const [suggestedTeammates, setSuggestedTeammates] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoadingTeammates, setIsLoadingTeammates] = useState(true);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  // Effect for suggested teammates and invitations
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoadingTeammates(true);
        try {
          const teammates = await apiService.getSuggestedTeammates();
          setSuggestedTeammates(teammates);
        } catch (error) {
          console.error("Failed to fetch suggested teammates:", error);
        } finally {
          setIsLoadingTeammates(false);
        }
      };
      
      fetchData();
      
      const unsubscribeInvites = apiService.listenForInvitations(setInvitations);
      return () => unsubscribeInvites();

    } else {
      setIsLoadingTeammates(false);
    }
  }, [user]);

  // Effect for listening to team data in real-time
  useEffect(() => {
    let unsubscribeTeam: (() => void) | null = null;
    
    if (user && user.teamId) {
      setIsTeamLoading(true);
      const teamDocRef = doc(db, 'teams', user.teamId);
      
      unsubscribeTeam = onSnapshot(teamDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setTeam({ id: docSnap.id, ...docSnap.data() } as Team);
        } else {
          setTeam(null);
        }
        setIsTeamLoading(false);
      }, (error) => {
        console.error("Error listening to team document:", error);
        setTeam(null);
        setIsTeamLoading(false);
      });
    } else {
      setTeam(null);
      setIsTeamLoading(false);
    }
    
    return () => {
      if (unsubscribeTeam) {
        unsubscribeTeam();
      }
    };
  }, [user]);

  const handleInvitationAction = async (invitationId: string, accept: boolean) => {
    if (!user) return;
    try {
        await apiService.handleInvitation(invitationId, accept, user);
        // The real-time listener on the user object in App.tsx will handle the main UI update.
        // For local state, we can remove the invitation to feel faster.
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
        console.error("Failed to handle invitation:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name.split(' ')[0] || 'Guest'}!</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Find your perfect graduation project teammates here.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Suggested Teammates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Based on your profile.</p>
            {isLoadingTeammates ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                </div>
            ) : suggestedTeammates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestedTeammates.map(user => (
                        <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 dark:text-gray-400">No suggestions at the moment. Check back later!</p>
            )}
             <div className="mt-6 text-right">
                <button 
                  onClick={() => setActivePage('Find Teammates')}
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                    See More Suggestions &rarr;
                </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">My Team Status</h3>
            {user ? (
                user.teamStatus === 'In a team' && user.teamId ? (
                    isTeamLoading ? (
                        <div className="text-center py-4 text-gray-500 dark:text-gray-400">Loading team details...</div>
                    ) : team ? (
                        <TeamStatusCard team={team} user={user} />
                    ) : (
                         <div className="text-center py-4">
                            <p className="text-red-500 dark:text-red-400">Error: Could not find your team's data.</p>
                            <p className="text-xs text-gray-500 mt-1">Your profile may be out of sync. It should update shortly.</p>
                        </div>
                    )
                ) : (
                    <CreateTeamForm user={user} />
                )
            ) : null}
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Pending Invitations ({invitations.length})</h3>
            {invitations.length > 0 ? (
                <ul className="space-y-4">
                  {invitations.map(inv => (
                    <li key={inv.id}>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-semibold">{inv.fromUser.name}</span> invited you to join '<span className="font-semibold">{inv.teamName}</span>'.
                      </p>
                      <div className="flex space-x-2">
                        <button onClick={() => handleInvitationAction(inv.id, true)} className="flex-1 bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                        <button onClick={() => handleInvitationAction(inv.id, false)} className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold py-1 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Decline</button>
                      </div>
                    </li>
                  ))}
                </ul>
            ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No pending invitations.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
