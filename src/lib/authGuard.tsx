'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export function useRole() {
  const [state, setState] = useState<{ uid?: string; role?: string; loading: boolean }>({ loading: true });
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return setState({ loading: false });
      const snap = await getDoc(doc(db, 'users', user.uid));
      setState({ uid: user.uid, role: snap.data()?.role || 'viewer', loading: false });
    });
    return () => unsub();
  }, []);
  return state;
}

export function RequireRole({ allow, children }: { allow: string[]; children: React.ReactNode }) {
  const { role, loading } = useRole();
  if (loading) return <div>Loading…</div>;
  if (!role || !allow.includes(role)) return <div>Access denied</div>;
  return <>{children}</>;
}
