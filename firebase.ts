
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, Timestamp, arrayUnion, writeBatch, arrayRemove } from "firebase/firestore";

// Your web app's Firebase configuration provided by the user.
const firebaseConfig = {
  apiKey: "AIzaSyACq8G2LEyU_H2coDzV3uf5N-2m4yL1D38",
  authDomain: "project-mates-app.firebaseapp.com",
  projectId: "project-mates-app",
  storageBucket: "project-mates-app.firebasestorage.app",
  messagingSenderId: "506616556958",
  appId: "1:506616556958:web:dc016549e788a832933a8f",
  measurementId: "G-2Z7QZLQ3G8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, Timestamp, arrayUnion, writeBatch, arrayRemove };