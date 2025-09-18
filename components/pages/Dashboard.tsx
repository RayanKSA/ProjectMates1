
import React, { useEffect, useState } from 'react';
import UserCard from '../UserCard';
import type { User, Invitation } from '../../types';
import { apiService } from '../../services/apiService';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [suggestedTeammates, setSuggestedTeammates] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch data if the user is logged in
    if (user) {
      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [teammates, status] = await Promise.all([
            apiService.getSuggestedTeammates(),
            apiService.getTeamStatus(),
          ]);
          setSuggestedTeammates(teammates);
          setInvitations(status.invitations);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
        setIsLoading(false);
    }
  }, [user]);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back, {user?.name.split(' ')[0] || 'Guest'}!</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">Here are some suggested teammates for your graduation project.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Suggested Teammates</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Based on your profile.</p>
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {suggestedTeammates.map(user => (
                        <UserCard key={user.id} user={user} />
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">My Team Status</h3>
            <div className="text-center py-4">
              <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't joined or created a team yet.</p>
              <button 
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create a Team
              </button>
            </div>
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
                        <button className="flex-1 bg-green-500 text-white text-sm font-bold py-1 px-3 rounded-lg hover:bg-green-600 transition-colors">Accept</button>
                        <button className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold py-1 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Decline</button>
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
