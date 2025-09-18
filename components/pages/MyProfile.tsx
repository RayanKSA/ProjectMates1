
import React, { useState } from 'react';
import type { User } from '../../types';
import { apiService } from '../../services/apiService';
import { generateBio } from '../../services/geminiService';
import Tag from '../Tag';
import { SparklesIcon } from '../Icons';

interface MyProfileProps {
  user: User;
  onProfileUpdate: (updatedUser: User) => void;
}

const MyProfile: React.FC<MyProfileProps> = ({ user, onProfileUpdate }) => {
  const [isBioLoading, setIsBioLoading] = useState(false);

  const handleEnhanceBio = async () => {
    setIsBioLoading(true);
    try {
        const newBio = await generateBio(user);
        // Optimistically update the local state
        const updatedUser = { ...user, about: newBio };
        onProfileUpdate(updatedUser); 
        // Persist the change to the database
        await apiService.updateUserProfile({ about: newBio });
    } catch(error) {
        console.error("Failed to enhance bio", error);
        // Optionally revert optimistic update on error
        onProfileUpdate(user); 
    } finally {
        setIsBioLoading(false);
    }
  };

  const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">{children}</dd>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100">{user.name}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">{user.title} - Year {user.year}</p>
            </div>
            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                Edit Profile
            </button>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">About Me</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0">
                    <p className="whitespace-pre-wrap">{user.about}</p>
                    <button 
                        onClick={handleEnhanceBio} 
                        disabled={isBioLoading}
                        className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                    >
                       <SparklesIcon className={`-ml-0.5 mr-2 h-4 w-4 ${isBioLoading ? 'animate-spin' : ''}`} />
                       {isBioLoading ? 'Enhancing...' : 'Enhance Bio with AI'}
                    </button>
                </dd>
            </div>
            <div className="sm:px-6"><InfoRow label="Email address">{user.email}</InfoRow></div>
            <div className="sm:px-6"><InfoRow label="Department">{user.department}</InfoRow></div>
            <div className="sm:px-6">
                <InfoRow label="Academic Interests">
                    <div className="flex flex-wrap gap-2">{user.interests.map(i => <Tag key={i} text={i} />)}</div>
                </InfoRow>
            </div>
            <div className="sm:px-6">
                <InfoRow label="Skills & Technologies">
                    <div className="flex flex-wrap gap-2">{user.skills.map(s => <Tag key={s} text={s} />)}</div>
                </InfoRow>
            </div>
            <div className="sm:px-6">
                <InfoRow label="Working Preferences">
                    <ul className="list-disc space-y-1 pl-5 text-gray-900 dark:text-gray-100">
                        {user.workingPreferences.map((p, index) => <li key={index}>{p}</li>)}
                    </ul>
                </InfoRow>
            </div>
            <div className="sm:px-6">
                <InfoRow label="Team Status">
                     <span className={`px-3 py-1 text-sm font-medium rounded-full ${user.teamStatus === 'Looking for a team' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                         {user.teamStatus}
                     </span>
                </InfoRow>
            </div>
        </dl>
      </div>
    </div>
  );
};

export default MyProfile;
