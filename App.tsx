
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/pages/Dashboard';
import Auth from './components/pages/Auth';
import type { User } from './types';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { apiService } from './services/apiService';

const App: React.FC = () => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // For initial auth check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userProfile = await apiService.getUserProfile(user.uid);
          setCurrentUser(userProfile);
        } catch (error) {
          console.error("Failed to fetch user profile:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const handleLogout = () => {
    auth.signOut();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold dark:text-gray-200">Loading Project Mates...</div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Header user={currentUser} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        <Dashboard user={currentUser} />
      </main>
    </div>
  );
};

export default App;
