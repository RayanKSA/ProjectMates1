
import React from 'react';
import type { User } from '../types';
import Tag from './Tag';

interface UserCardProps {
  user: User;
  variant?: 'compact' | 'full';
  onViewProfile?: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, variant = 'compact', onViewProfile }) => {
  const cardBaseStyles = "bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col";

  const handleViewProfileClick = () => {
    if (onViewProfile) {
      onViewProfile(user);
    }
  };

  if (variant === 'compact') {
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
            <button onClick={handleViewProfileClick} className="mt-auto w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                View Profile
            </button>
        </div>
      );
  }

  // Full variant for Find Teammates page
  return (
    <div className={cardBaseStyles}>
        <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-2xl mr-4">
                {user.avatarInitial}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.title}</p>
            </div>
        </div>
        <div className="mb-4">
            <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Interests & Skills</h4>
            <div className="flex flex-wrap gap-2">
                {[...user.interests, ...user.skills].slice(0, 5).map(item => <Tag key={item} text={item} />)}
            </div>
        </div>
        <button onClick={handleViewProfileClick} className="mt-auto w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            View Profile
        </button>
    </div>
  );
};

export default UserCard;