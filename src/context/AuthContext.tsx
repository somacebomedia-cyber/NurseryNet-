'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type UserCredential,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { isBootstrapAdminEmail, truncateString } from '@/lib/ownership-verification';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export type UserRole = 'Parent' | 'Preschool Owner' | 'Job Seeker';

export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  photoURL?: string | null;
  name: string;
  role: UserRole;
  isAdmin: boolean;
  whatsappNumber?: string;
  planId?: 'discovery' | 'creative' | 'growth';
  subscriptionStatus?: 'active' | 'cancelled' | 'inactive';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: (preferredRole?: UserRole) => Promise<UserCredential>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function resolveAdminStatus(uid: string, email: string | null, emailVerified: boolean): Promise<boolean> {
  if (!emailVerified) return false;
  if (isBootstrapAdminEmail(email, emailVerified)) return true;
  try {
    const adminSnap = await getDoc(doc(db, 'admins', uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocPath = `users/${firebaseUser.uid}`;
        let userData: Record<string, any> | null = null;

        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            userData = userDocSnap.data();
          } else if (firebaseUser.email && firebaseUser.emailVerified) {
            // Auto-provision user profile on first verified Google Sign-In
            const pendingRole =
              typeof window !== 'undefined'
                ? (window.sessionStorage.getItem('nurserynet_pending_role') as UserRole | null)
                : null;
            const safeRole: UserRole =
              pendingRole === 'Parent' || pendingRole === 'Job Seeker' || pendingRole === 'Preschool Owner'
                ? pendingRole
                : 'Preschool Owner';

            const now = serverTimestamp();
            const newProfile: Record<string, unknown> = {
              uid: firebaseUser.uid,
              name: truncateString(
                firebaseUser.displayName || firebaseUser.email.split('@')[0] || 'NurseryNet Member',
                120
              ),
              email: truncateString(firebaseUser.email, 200),
              role: safeRole,
              planId: 'discovery',
              subscriptionStatus: 'inactive',
              createdAt: now,
              updatedAt: now,
            };
            await setDoc(userDocRef, newProfile);
            userData = newProfile;
            if (typeof window !== 'undefined') {
              window.sessionStorage.removeItem('nurserynet_pending_role');
            }
          }
        } catch (err) {
          console.error('Error hydrating user profile from Firestore:', err);
        }

        const isAdmin = await resolveAdminStatus(
          firebaseUser.uid,
          firebaseUser.email,
          firebaseUser.emailVerified
        );

        const resolvedRole: UserRole =
          userData?.role === 'Parent' ||
          userData?.role === 'Job Seeker' ||
          userData?.role === 'Preschool Owner'
            ? userData.role
            : 'Preschool Owner';

        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          phoneNumber: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL,
          name:
            userData?.name ||
            firebaseUser.displayName ||
            firebaseUser.email?.split('@')[0] ||
            'NurseryNet Member',
          role: resolvedRole,
          isAdmin,
          whatsappNumber: userData?.whatsappNumber,
          planId: userData?.planId || 'discovery',
          subscriptionStatus: userData?.subscriptionStatus || 'inactive',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async (preferredRole: UserRole = 'Preschool Owner') => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('nurserynet_pending_role', preferredRole);
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const credential = await signInWithPopup(auth, provider);
    const fbUser = credential.user;

    if (fbUser.email && fbUser.emailVerified) {
      const userDocRef = doc(db, 'users', fbUser.uid);
      try {
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const now = serverTimestamp();
          await setDoc(userDocRef, {
            uid: fbUser.uid,
            name: truncateString(fbUser.displayName || fbUser.email.split('@')[0] || 'Member', 120),
            email: truncateString(fbUser.email, 200),
            role: preferredRole,
            planId: 'discovery',
            subscriptionStatus: 'inactive',
            createdAt: now,
            updatedAt: now,
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${fbUser.uid}`);
      }
    }

    return credential;
  }, []);

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    const now = serverTimestamp();
    const baseUserData: Record<string, unknown> = {
      uid: fbUser.uid,
      name: truncateString(name, 120),
      email: truncateString(fbUser.email || email, 200),
      role,
      planId: 'discovery',
      subscriptionStatus: 'inactive',
      createdAt: now,
      updatedAt: now,
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), baseUserData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${fbUser.uid}`);
    }

    return userCredential;
  };

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    router.push('/login');
  };

  const signInWithPhone = (
    phoneNumber: string,
    appVerifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken();
    } catch {
      return null;
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signup,
    login,
    logout,
    resetPassword,
    signInWithPhone,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
