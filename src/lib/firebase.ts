import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from 'firebase/storage';

// IMPORTANT: Configure Firebase credentials in .env.local or your deployment platform (e.g. Vercel).
// Safe fallback placeholders are provided so build-time static page collection succeeds even if
// environment variables are missing during CI/Vercel build phase.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForBuildEnv1234567890",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nurserynet-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nurserynet-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nurserynet-app.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:placeholder1234567890",
};

// Initialize Firebase
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase Auth initialization skipped during build:", error);
  auth = {} as Auth;
}

let db: Firestore;
try {
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase Firestore initialization warning:", error);
  db = {} as Firestore;
}

let storage: FirebaseStorage;
try {
  storage = getStorage(app);
} catch (error) {
  console.warn("Firebase Storage initialization warning:", error);
  storage = {} as FirebaseStorage;
}

export { app, auth, db, storage };
