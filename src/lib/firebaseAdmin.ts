// src/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

// Initialize Firebase Admin (Firebase Studio handles credentials automatically)
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminAuth = admin.apps.length ? admin.auth() : null;
