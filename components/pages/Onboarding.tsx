import React, { useState } from 'react';
import { ProjectMatesIcon } from '../Icons';
import { apiService } from '../../services/apiService';
import type { User } from '../../types';

interface OnboardingProps {
  user: User;
  onOnboardingComplete: (user: User) => void;
}

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; required?: boolean; }> = 
({ label, name, value, onChange, placeholder, required }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
        </label>
        <div className="mt-1">
            <input 
                id={name} 
                name={name} 
                type="text" 
                value={value} 
                onChange={onChange}
                required={required} 
                placeholder={placeholder}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
            />
        </div>
    </div>
);


const Onboarding: React.FC<OnboardingProps> = ({ user, onOnboardingComplete }) => {
    const [formData, setFormData] = useState({
        title: '',
        department: '',
        year: '4',
        skills: '',
        interests: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const profileData: Partial<User> = {
                title: formData.title,
                department: formData.department,
                year: parseInt(formData.year, 10),
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
                profileComplete: true,
            };

            const updatedUser = await apiService.updateUserProfile(user.id, profileData);
            onOnboardingComplete(updatedUser);

        } catch (err) {
            setError("Failed to save profile. Please try again.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ProjectMatesIcon className="h-12 w-auto text-indigo-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    Welcome, {user.name.split(' ')[0]}!
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Let's complete your profile to get you started.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        <InputField label="Your Title" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Computer Science Student" required />
                        <InputField label="Department" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., College of Computer Science" required />
                        
                        <div>
                           <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                               Academic Year
                           </label>
                           <div className="mt-1">
                               <input id="year" name="year" type="number" min="1" max="5" value={formData.year} onChange={handleChange} required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
                           </div>
                        </div>

                        <InputField label="Your Skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="Python, React, Figma (comma-separated)" required />
                        <InputField label="Your Interests" name="interests" value={formData.interests} onChange={handleChange} placeholder="AI, Web Development, UI/UX (comma-separated)" required />
                        
                        {error && <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4"><p className="text-sm text-red-700 dark:text-red-200">{error}</p></div>}
                        
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                {isLoading ? 'Saving...' : 'Complete Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;