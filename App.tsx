
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/pages/Dashboard';
import FindTeammates from './components/pages/FindTeammates';
import MyProfile from './components/pages/MyProfile';
import Messages from './components/pages/Messages';
import Auth from './components/pages/Auth';
import Onboarding from './components/pages/Onboarding';
import type { Page, User } from './types';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewedUser, setViewedUser] = useState<User | null>(null);
  const [startChatWith, setStartChatWith] = useState<User | null>(null);

  useEffect(() => {
    let userProfileUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      // Clean up previous user profile listener if it exists
      if (userProfileUnsubscribe) {
        userProfileUnsubscribe();
        userProfileUnsubscribe = null;
      }

      if (user && user.emailVerified) {
        setFirebaseUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        
        // Set up a real-time listener for the user's profile.
        // This will handle setting the user data and updating the loading state.
        userProfileUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            // This is an inconsistent state - auth user exists, but no DB record.
            // This could happen if DB creation failed during signup.
            console.error(`Profile for user ${user.uid} not found in Firestore.`);
            setCurrentUser(null);
          }
          // We have a definitive answer from Firestore (or lack thereof), so we can stop loading.
          setIsLoading(false);
        }, (error) => {
          console.error("Firestore error listening to user profile:", error);
          setCurrentUser(null);
          setIsLoading(false); // Also stop loading on an error.
        });
      } else {
        // No user is signed in or their email is not verified.
        setFirebaseUser(null);
        setCurrentUser(null);
        setIsLoading(false); // Stop loading.
      }
    });

    return () => {
      authUnsubscribe();
      if (userProfileUnsubscribe) {
        userProfileUnsubscribe();
      }
    };
  }, []);

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };
  
  const handleLogout = () => {
    auth.signOut();
  }

  const handleViewProfile = (user: User) => {
    setViewedUser(user);
    setActivePage('UserProfile');
  };

  const handleStartChat = (user: User) => {
    setStartChatWith(user);
    setActivePage('Messages');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard setActivePage={setActivePage} user={currentUser} onViewProfile={handleViewProfile}/>;
      case 'Find Teammates':
        if (!currentUser) return null;
        return <FindTeammates currentUser={currentUser} onViewProfile={handleViewProfile} />;
      case 'My Profile':
        if (!currentUser) return null;
        return <MyProfile user={currentUser} onProfileUpdate={handleProfileUpdate} isOwnProfile={true} />;
      case 'UserProfile':
        if(!viewedUser || !currentUser) return <div>User not found.</div>
        return <MyProfile user={viewedUser} isOwnProfile={false} onStartChat={handleStartChat} currentUser={currentUser} />
      case 'Messages':
         if (!currentUser) return null;
        return <Messages currentUser={currentUser} startChatWith={startChatWith} onChatStarted={() => setStartChatWith(null)}/>;
      default:
        return <Dashboard setActivePage={setActivePage} user={currentUser} onViewProfile={handleViewProfile}/>;
    }
  };

  // 1. Unified Loading State: Covers both auth check and initial profile fetch.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl font-semibold dark:text-gray-200">Loading Project Mates...</div>
      </div>
    );
  }

  // 2. Authentication Gate: If loading is done and there's no authenticated user, show Auth page.
  if (!firebaseUser) {
    return <Auth />;
  }

  // 3. Profile Integrity Gate: If user is authenticated but profile data is missing (or failed to load).
  // This is an error state that prevents the app from being stuck.
  if (!currentUser) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-center p-4">
        <div>
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error Connecting to Database</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              We couldn't retrieve your profile data. This is almost always caused by an incorrect Firebase configuration.
            </p>
            <div className="mt-4 text-left bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="font-semibold text-gray-800 dark:text-gray-200">How to Fix:</p>
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 mt-2 space-y-1">
                    <li>Open the file <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">firebase.ts</code> in your project.</li>
                    <li>Follow the instructions to replace the placeholder credentials with your own keys from the Firebase Console.</li>
                    <li>Refresh the page.</li>
                </ol>
            </div>
            <button 
                onClick={handleLogout}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
                Logout and Try Again
            </button>
        </div>
      </div>
    );
  }

  // 4. Onboarding Gate for new users
  if (!currentUser.profileComplete) {
      return <Onboarding user={currentUser} onOnboardingComplete={handleOnboardingComplete} />;
  }
  
  // 5. Main App
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Header activePage={activePage} setActivePage={setActivePage} user={currentUser} onLogout={handleLogout} />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;