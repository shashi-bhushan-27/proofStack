import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBHP0AyXzNamrrvQyEgVqP3cwEzRBhvoio",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "proofstack-b606d.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "proofstack-b606d",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "proofstack-b606d.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1083047903210",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1083047903210:web:59ee0980fe27059c2f7c93",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-GT46XXZKZQ",
};

// Initialize Firebase app safely (idempotent for SSR/Fast Refresh)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();


export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;
