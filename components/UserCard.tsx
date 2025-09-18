
import React from 'react';
import type { User } from '../types';
import Tag from './Tag';

interface UserCardProps {
  user: User;
  // FIX: Add optional variant prop to fix type error in FindTeammates.tsx
  variant?: string;
}

const UserCard: React.FC<UserCardProps> = ({ user }) => {
  const cardBaseStyles = "bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col";

  return (
    <div className={cardBaseStyles}>
        <div className="flex items-center mb-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xl mr-4">
                {user.avatarInitial}
            </div>
            <div>
                <h3 className="text-md font-bold text-gray-800 dark:text-gray-200">{user.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.interests.slice(0, 2).join(', ')}</p>
            </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
            {user.skills.slice(0, 3).map(skill => <Tag key={skill} text={skill} />)}
        </div>
        <button className="mt-auto w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            View Profile
        </button>
    </div>
  );
};

export default UserCard;
