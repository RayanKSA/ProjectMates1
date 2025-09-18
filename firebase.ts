import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Firebase Configuration ---
// NOTE: In a typical React project with a build system (like Create React App or Vite),
// these keys would be stored in a .env file and accessed via process.env.
// However, in this simpler environment without a build step, we are placing them
// directly here. This is not recommended for production applications with sensitive keys.
// Replace these with your own Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyACq8G2LEyU_H2coDzV3uf5N-2m4yL1D38",
  authDomain: "project-mates-app.firebaseapp.com",
  projectId: "project-mates-app",
  storageBucket: "project-mates-app.appspot.com",
  messagingSenderId: "506616556958",
  appId: "1:506616556958:web:dc016549e788a832933a8f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
