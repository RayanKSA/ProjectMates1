import React from 'react';
import type { Team, User } from '../types';
import Tag from './Tag';

interface TeamCardProps {
  team: Team & { commonSkills?: string[]; commonInterests?: string[] };
  currentUser: User;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, currentUser }) => {
  const cardBaseStyles = "bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full";

  return (
    <div className={cardBaseStyles}>
        <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{team.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Led by {team.members.find(m => m.id === team.ownerId)?.name || 'Owner'}</p>
        </div>
        
        <div className="flex items-center mb-4">
             <div className="flex -space-x-2">
                {team.members.slice(0, 4).map(member => (
                    <div key={member.id} title={member.name} className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-xs border-2 border-white dark:border-gray-800">
                        {member.avatarInitial}
                    </div>
                ))}
            </div>
            {team.members.length > 4 && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">+{team.members.length - 4} more</span>}
        </div>
        
        { (team.commonSkills && team.commonSkills.length > 0) || (team.commonInterests && team.commonInterests.length > 0) ? (
            <div className="mb-4">
                <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Common Ground</h4>
                <div className="flex flex-wrap gap-2">
                    {team.commonSkills?.map(skill => <Tag key={skill} text={skill} />)}
                    {team.commonInterests?.map(interest => <Tag key={interest} text={interest} />)}
                </div>
            </div>
        ) : (
            <div className="mb-4">
                <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Team Focus</h4>
                 <div className="flex flex-wrap gap-2">
                    {[...team.skills, ...team.interests].slice(0, 4).map(item => <Tag key={item} text={item} />)}
                </div>
            </div>
        )}
        
        <button className="mt-auto w-full text-center bg-indigo-50 hover:bg-indigo-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-indigo-700 dark:text-indigo-300 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
            View Team
        </button>
    </div>
  );
};

export default TeamCard;
