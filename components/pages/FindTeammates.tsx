
import React, { useState, useEffect, useCallback } from 'react';
import UserCard from '../UserCard';
import { SearchIcon } from '../Icons';
import type { User } from '../../types';
import { apiService } from '../../services/apiService';
import { MOCK_USERS } from '../../constants';


const SKILLS = Array.from(new Set(MOCK_USERS.flatMap(u => u.skills))).sort();
const INTERESTS = Array.from(new Set(MOCK_USERS.flatMap(u => u.interests))).sort();

const FindTeammates: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
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


    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Find Teammates</h1>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Search and filter students based on skills, interests, and more.</p>
            </div>

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
                            <UserCard key={user.id} user={user} variant="full" />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">No Teammates Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters to find more results.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindTeammates;
