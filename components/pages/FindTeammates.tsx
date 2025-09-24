
import React, { useState, useEffect, useCallback } from 'react';
import UserCard from '../UserCard';
import TeamCard from '../TeamCard';
import { SearchIcon } from '../Icons';
import type { User, Team } from '../../types';
import { apiService } from '../../services/apiService';
import { MOCK_USERS } from '../../constants';


const SKILLS = Array.from(new Set(MOCK_USERS.flatMap(u => u.skills))).sort();
const INTERESTS = Array.from(new Set(MOCK_USERS.flatMap(u => u.interests))).sort();

type FindView = 'students' | 'teams';

interface FindTeammatesProps {
    currentUser: User;
    onViewProfile: (user: User) => void;
}

const FindTeammates: React.FC<FindTeammatesProps> = ({ currentUser, onViewProfile }) => {
    const [view, setView] = useState<FindView>('students');
    const [users, setUsers] = useState<User[]>([]);
    const [recommendedTeams, setRecommendedTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('Any Skill');
    const [interestFilter, setInterestFilter] = useState('Any Interest');
    const [availabilityFilter, setAvailabilityFilter] = useState('Any');

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const results = await apiService.searchUsers({
                name: searchTerm,
                skill: skillFilter,
                interest: interestFilter,
                availability: availabilityFilter,
            });
            setUsers(results);
        } catch (error) {
            console.error("Failed to search users:", error);
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, skillFilter, interestFilter, availabilityFilter]);

    const fetchTeams = useCallback(async () => {
        setIsLoading(true);
        try {
            const teams = await apiService.getRecommendedTeams(currentUser);
            setRecommendedTeams(teams);
        } catch (error) {
            console.error("Failed to fetch recommended teams:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (view === 'students') {
            fetchUsers();
        } else {
            fetchTeams();
        }
    }, [view, fetchUsers, fetchTeams]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };
    
    const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                active 
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find Your Team</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Discover potential teammates or find an existing team to join.</p>
            </div>
            
             <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton active={view === 'students'} onClick={() => setView('students')}>Search Students</TabButton>
                    <TabButton active={view === 'teams'} onClick={() => setView('teams')}>Recommended Teams</TabButton>
                </nav>
            </div>

            {view === 'students' && (
                <>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-700">
                        <div className="lg:col-span-2">
                            <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search by Name</label>
                            <input
                                type="text"
                                id="search-name"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Enter name..."
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="filter-skill" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Skill</label>
                            <select id="filter-skill" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white">
                                <option>Any Skill</option>
                                {SKILLS.map(skill => <option key={skill}>{skill}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="filter-interest" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Interest</label>
                            <select id="filter-interest" value={interestFilter} onChange={(e) => setInterestFilter(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white">
                                <option>Any Interest</option>
                                {INTERESTS.map(interest => <option key={interest}>{interest}</option>)}
                            </select>
                        </div>
                         <div className="flex items-end">
                            <button type="submit" className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <SearchIcon className="h-5 w-5 mr-2" />
                                Search
                            </button>
                        </div>
                    </form>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Search Results ({users.length} found)</h2>
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => <div key={i} className="h-60 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                            </div>
                        ) : users.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {users.map(user => (
                                    <UserCard key={user.id} user={user} variant="full" onViewProfile={onViewProfile} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Teammates Found</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find more results.</p>
                            </div>
                        )}
                    </div>
                </>
            )}
            
            {view === 'teams' && (
                <div>
                     <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recommended Teams For You</h2>
                     {isLoading ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>)}
                         </div>
                     ) : recommendedTeams.length > 0 ? (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedTeams.map((team: any) => (
                                <TeamCard key={team.id} team={team} currentUser={currentUser} />
                            ))}
                         </div>
                     ) : (
                        <div className="text-center py-12">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Team Recommendations Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Make sure your profile is complete with skills and interests!</p>
                        </div>
                     )}
                </div>
            )}

        </div>
    );
};

export default FindTeammates;