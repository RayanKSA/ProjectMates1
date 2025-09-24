import React, { useState } from 'react';
import { ProjectMatesIcon } from '../Icons';
import { auth, db } from '../../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { apiService } from '../../services/apiService';

type AuthView = 'login' | 'signup' | 'resetPassword';

const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const clearState = () => {
      setError(null);
      setMessage(null);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
  }

  const handleResendVerification = async () => {
      setIsLoading(true);
      setError(null);
      setMessage(null);
      try {
          // Temporarily sign in to get the user object
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          if(userCredential.user) {
              await sendEmailVerification(userCredential.user);
              setMessage("A new verification email has been sent. Please check your inbox.");
          }
          // Sign out immediately after
          await auth.signOut();
      } catch (err: any) {
          setError("Failed to resend verification email. Please check your credentials.");
      } finally {
          setIsLoading(false);
      }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        setMessage("Password reset email sent! Check your inbox (and spam folder) for a link to reset your password.");
    } catch (err: any) {
        setError("Failed to send reset email. Please ensure the email address is correct.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (view === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      if (view === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
            setError("Your email has not been verified. Please check your inbox.");
            setMessage("Didn't receive an email?");
            await auth.signOut();
        }
      } else { // Signup
        // Seed the database with mock users if it's the first time anyone signs up
        await apiService.seedDatabase();

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;

        const newUserProfile = {
          id: newUser.uid,
          name: name,
          avatarInitial: name.split(' ').map(n => n[0]).join('').toUpperCase() || '?',
          title: 'New Student',
          year: 1,
          about: `I'm a new student ready to find a great team for my project!`,
          email: newUser.email || '',
          department: 'Not specified',
          interests: [],
          skills: [],
          workingPreferences: [],
          teamStatus: 'Looking for a team',
          profileComplete: false, // This is the trigger for the onboarding flow
        };
        
        await setDoc(doc(db, "users", newUser.uid), newUserProfile);
        await sendEmailVerification(newUser);
        setShowVerificationMessage(true);
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (showVerificationMessage) {
      return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
              <div className="sm:mx-auto sm:w-full sm:max-w-md">
                   <div className="flex justify-center">
                        <ProjectMatesIcon className="h-12 w-auto text-indigo-600" />
                   </div>
                   <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                       Verify Your Email
                   </h2>
                   <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
                       <p className="text-center text-gray-700 dark:text-gray-300">
                           Thank you for registering! A verification link has been sent to <span className="font-bold">{email}</span>. Please check your inbox (and spam folder) and click the link to activate your account.
                       </p>
                       <button onClick={() => { setShowVerificationMessage(false); setView('login'); clearState(); }} className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                           Back to Login
                       </button>
                   </div>
              </div>
          </div>
      );
  }

  if (view === 'resetPassword') {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <ProjectMatesIcon className="h-12 w-auto text-indigo-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                    Enter your email to receive a reset link.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handlePasswordReset}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="you@university.edu" />
                            </div>
                        </div>
                        {error && <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4"><p className="text-sm text-red-700 dark:text-red-200">{error}</p></div>}
                        {message && !error && <div className="rounded-md bg-blue-50 dark:bg-blue-900/50 p-4"><p className="text-sm text-blue-700 dark:text-blue-200">{message}</p></div>}
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </div>
                         <div className="text-center">
                           <button onClick={() => { setView('login'); clearState(); }} className="font-medium text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
                                Back to Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <ProjectMatesIcon className="h-12 w-auto text-indigo-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          {view === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{' '}
          <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); clearState(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
            {view === 'login' ? 'start your journey' : 'sign in to your account'}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {view === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Full Name
                </label>
                <div className="mt-1">
                  <input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="Nasser Al-Mohaimeed" />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="you@university.edu" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={view === 'login' ? "current-password" : "new-password"} required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="********" />
              </div>
            </div>
            
            {view === 'signup' && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input id="confirm-password" name="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100" placeholder="********" />
                </div>
              </div>
            )}

            {view === 'login' && (
                <div className="flex items-center justify-end">
                    <div className="text-sm">
                        <button type="button" onClick={() => { setView('resetPassword'); clearState(); }} className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
                            Forgot your password?
                        </button>
                    </div>
                </div>
            )}
            
            {error && (
                <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    {message && (
                         <button onClick={handleResendVerification} className="mt-2 font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none">
                            Click here to resend it.
                         </button>
                    )}
                </div>
            )}
            
            {message && !error && (
                 <div className="rounded-md bg-blue-50 dark:bg-blue-900/50 p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-200">{message}</p>
                </div>
            )}

            <div>
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                {isLoading ? 'Processing...' : (view === 'login' ? 'Sign in' : 'Sign Up')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;