
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  UserCredential
} from 'firebase/auth';
import { app, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const auth = getAuth(app);

export type UserRole = 'Parent' | 'Preschool Owner' | 'Job Seeker';

export interface AuthUser {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  name: string;
  role: UserRole;
  whatsappNumber?: string;
  planId?: 'discovery' | 'creative' | 'growth';
  subscriptionStatus?: 'active' | 'cancelled' | 'inactive';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithPhone: (phoneNumber: string, appVerifier: RecaptchaVerifier) => Promise<ConfirmationResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            phoneNumber: firebaseUser.phoneNumber,
            name: userData.name,
            role: userData.role,
            whatsappNumber: userData.whatsappNumber,
            planId: userData.planId || 'discovery',
            subscriptionStatus: userData.subscriptionStatus || 'inactive',
          });
        } else {
          console.warn("User document not found for authenticated user. Logging out.");
          await signOut(auth);
          setUser(null);
        }

      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    const baseUserData: any = {
      uid: user.uid,
      name: name,
      email: user.email,
      role: role,
      createdAt: serverTimestamp()
    };
    
    if (role === 'Preschool Owner') {
        baseUserData.planId = 'discovery';
        baseUserData.subscriptionStatus = 'inactive';
    }
    
    await setDoc(doc(db, "users", user.uid), baseUserData);

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
    router.push('/login');
  };

  const signInWithPhone = (phoneNumber: string, appVerifier: RecaptchaVerifier): Promise<ConfirmationResult> => {
    return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    signInWithPhone,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
