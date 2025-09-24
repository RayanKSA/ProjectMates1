
import React, { useState } from 'react';
import type { Page, User } from '../types';
import { ProjectMatesIcon, BellIcon } from './Icons';

interface HeaderProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const NavItem: React.FC<{
    pageName: Page;
    activePage: Page;
    onClick: (page: Page) => void;
    children: React.ReactNode;
}> = ({ pageName, activePage, onClick, children }) => {
    const isActive = activePage === pageName;
    return (
        <button
            onClick={() => onClick(pageName)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            }`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ activePage, setActivePage, user, onLogout }) => {
  const pages: Page[] = ['Dashboard', 'Find Teammates', 'My Profile', 'Messages'];
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <ProjectMatesIcon className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 font-bold text-xl text-gray-800 dark:text-gray-200">Project Mates</span>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             {pages.map((page) => (
               <NavItem key={page} pageName={page} activePage={activePage} onClick={setActivePage}>
                 {page}
               </NavItem>
             ))}
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
               <BellIcon className="h-6 w-6"/>
            </button>
            <div className="relative">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setMenuOpen(!menuOpen)}>
                     <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">{user?.avatarInitial || '?'}</div>
                     <span className="hidden sm:inline text-gray-700 dark:text-gray-300 font-medium">{user?.name.split(' ')[0] || 'User'}</span>
                </div>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                        <button
                            onClick={onLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Sign out
                        </button>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
       {/* Mobile Nav */}
       <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex justify-around">
            {pages.map((page) => (
               <button
                  key={page}
                  onClick={() => setActivePage(page)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium text-center ${ activePage === page ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
               >
                 {page}
               </button>
            ))}
          </div>
       </div>
    </header>
  );
};

export default Header;
