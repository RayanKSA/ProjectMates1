import React, { useState, useEffect } from 'react';
import type { User, Team } from '../../types';
import { apiService } from '../../services/apiService';
import { auth } from '../../firebase';
import { deleteUser } from 'firebase/auth';
import Tag from '../Tag';

interface MyProfileProps {
  user: User; // The user whose profile is being viewed
  isOwnProfile: boolean;
  onProfileUpdate?: (updatedUser: User) => void;
  onStartChat?: (user: User) => void;
  currentUser?: User; // The currently logged-in user
}

const MyProfile: React.FC<MyProfileProps> = ({ user, isOwnProfile, onProfileUpdate, onStartChat, currentUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [invitationSent, setInvitationSent] = useState(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);

  useEffect(() => {
    setFormData(user);
    setIsEditing(false);
    setInvitationSent(false); // Reset invitation status when viewing a new profile
    
    const fetchTeam = async () => {
        if(user.teamId) {
            const fetchedTeam = await apiService.getTeam(user.teamId);
            setTeam(fetchedTeam);
        } else {
            setTeam(null);
        }
    }
    fetchTeam();
    
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: 'skills' | 'interests', value: string) => {
    const list = value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: list }));
  };

  const handleSave = async () => {
    if (!onProfileUpdate || !user) return;
    setIsLoading(true);
    try {
        const updatedUser = await apiService.updateUserProfile(user.id, formData);
        onProfileUpdate(updatedUser);
        setIsEditing(false);
    } catch(error) {
        console.error("Failed to update profile", error);
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleInvite = async () => {
      if (!currentUser || !currentUser.teamId) return;
      setIsLoading(true);
      try {
          const ownerTeam = await apiService.getTeam(currentUser.teamId);
          if (ownerTeam) {
            await apiService.sendInvitation(ownerTeam, currentUser, user);
            setInvitationSent(true); // Provide feedback
          }
      } catch (error) {
          console.error("Failed to send invitation:", error);
          alert(`Error: ${(error as Error).message}`);
      } finally {
          setIsLoading(false);
      }
  };
  
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
        // First, delete Firestore data and handle team logic
        await apiService.deleteUserAccount(user);
        
        // Then, delete the Firebase Auth user
        const firebaseUser = auth.currentUser;
        if (firebaseUser) {
            // This will trigger the onAuthStateChanged listener in App.tsx,
            // which will handle redirecting the user to the Auth page.
            await deleteUser(firebaseUser);
        }
    } catch (error: any) {
        console.error("Error deleting account:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsLoading(false);
        setIsDeleteConfirmVisible(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setIsEditing(false);
  };

  const displayedUser = isEditing ? { ...user, ...formData } : user;

  const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );
  
  const canInvite = currentUser?.isTeamOwner && user.teamStatus === 'Looking for a team';

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{isOwnProfile ? 'My Profile' : `${user.name}'s Profile`}</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {isOwnProfile ? 'View and update your information, interests, and skills.' : `Viewing the profile of ${user.name}.`}
            </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                    <div className="flex items-center">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-2xl mr-4 flex-shrink-0">
                            {user.avatarInitial}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-6 text-gray-900 dark:text-gray-100">{user.name}</h2>
                            {isEditing ? (
                                <input
                                  type="text"
                                  name="title"
                                  value={displayedUser.title || ''}
                                  onChange={handleInputChange}
                                  className="mt-1 max-w-2xl text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1"
                                />
                            ) : (
                                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{user.title} - Year {user.year}</p>
                            )}
                        </div>
                    </div>
                    {isOwnProfile ? (
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button onClick={handleCancel} disabled={isLoading} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400">
                                        {isLoading ? 'Saving...' : 'Save'}
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {canInvite && (
                                <button onClick={handleInvite} disabled={isLoading || invitationSent} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">
                                    {isLoading ? 'Inviting...' : (invitationSent ? 'Invitation Sent' : 'Invite to Team')}
                                </button>
                            )}
                            <button onClick={() => onStartChat && onStartChat(user)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                Message {user.name.split(' ')[0]}
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
                    <InfoRow label="About Me">
                        {isEditing ? (
                            <textarea
                                name="about"
                                value={displayedUser.about || ''}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                            />
                        ) : (
                            <p className="whitespace-pre-wrap">{user.about}</p>
                        )}
                    </InfoRow>
                    <InfoRow label="Email address">{user.email}</InfoRow>
                    <InfoRow label="Department">
                      {isEditing ? (
                        <input
                          type="text"
                          name="department"
                          value={displayedUser.department || ''}
                          onChange={handleInputChange}
                          className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                        />
                      ) : (
                        user.department
                      )}
                    </InfoRow>
                    <InfoRow label="Academic Interests">
                        {isEditing ? (
                             <input
                                type="text"
                                value={displayedUser.interests?.join(', ') || ''}
                                onChange={(e) => handleListChange('interests', e.target.value)}
                                placeholder="AI, Machine Learning, Web Dev"
                                className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                              />
                        ) : (
                            <div className="flex flex-wrap gap-2">{user.interests.map(i => <Tag key={i} text={i} />)}</div>
                        )}
                    </InfoRow>
                    <InfoRow label="Skills & Technologies">
                        {isEditing ? (
                            <input
                               type="text"
                               value={displayedUser.skills?.join(', ') || ''}
                               onChange={(e) => handleListChange('skills', e.target.value)}
                               placeholder="Python, React, Figma"
                               className="w-full text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"
                             />
                        ) : (
                            <div className="flex flex-wrap gap-2">{user.skills.map(s => <Tag key={s} text={s} />)}</div>
                        )}
                    </InfoRow>
                    <InfoRow label="Team Status">
                       <div>
                         <span className={`px-3 py-1 text-sm font-medium rounded-full ${user.teamStatus === 'Looking for a team' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                            {user.teamStatus}
                        </span>
                        {team && <span className="ml-2 font-semibold">{team.name}</span>}
                       </div>
                    </InfoRow>
                </dl>
            </div>
        </div>

        {isOwnProfile && (
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-red-300 dark:border-red-700">
                <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Deleting your account is a permanent action and cannot be undone. All your data will be removed.
                </p>
                <button
                    onClick={() => setIsDeleteConfirmVisible(true)}
                    className="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Delete My Account
                </button>
            </div>
        )}
        
        {isDeleteConfirmVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" aria-modal="true" role="dialog">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-sm w-full border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Are you absolutely sure?</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        This action is irreversible. Please confirm that you want to permanently delete your account.
                    </p>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button 
                            onClick={() => setIsDeleteConfirmVisible(false)} 
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDeleteAccount} 
                            disabled={isLoading} 
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                        >
                            {isLoading ? 'Deleting...' : 'Yes, Delete Account'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default MyProfile;