'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, limit, getDocs, DocumentData } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import PublicProfileView from '@/components/profile/PublicProfileView';
import type { PreschoolData } from '@/lib/schemas/preschool';

export default function DirectoryProfileClient({ id }: { id: string }) {
  const [data, setData] = useState<(PreschoolData & {id: string}) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // try direct doc id
        const ref = doc(db, 'preschools', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          if (!cancelled) setData({ id: snap.id, ...(snap.data() as PreschoolData) });
          return;
        }
        // fall back to slug lookup
        const q = query(collection(db, 'preschools'), where('slug', '==', id), limit(1));
        const qs = await getDocs(q);
        if (!qs.empty) {
          const d = qs.docs[0];
          if (!cancelled) setData({ id: d.id, ...(d.data() as PreschoolData) });
          return;
        }
        // If neither found, set error.
        if (!cancelled) setError("Preschool not found.");
      } catch (e) {
        console.error("Error fetching profile client-side: ", e);
        if (!cancelled) setError("An error occurred while fetching the preschool data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  if (error || !data) {
    return <div className="p-10 text-center text-muted-foreground">{error || "Preschool not found."}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-background to-secondary/30 py-12 md:py-20">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <PublicProfileView preschool={data} showBackButton={true} />
      </div>
    </div>
  );
}
