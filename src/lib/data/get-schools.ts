// src/lib/data/get-schools.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, startAfter, Query } from 'firebase/firestore';

export async function getSchools(city?: string, lastDocId?: string, limitCount: number = 20) {
  try {
    if (!db) {
      throw new Error("Firebase DB not initialized");
    }

    const preschoolsRef = collection(db, 'preschools');
    let q: Query = preschoolsRef;

    if (city) {
      // Case-insensitive search requires some text processing, but for simplicity we'll assume exact match or use a simple where clause.
      // In a real app, you might want to use Algolia or Typesense for full-text search.
      q = query(q, where('city', '==', city), orderBy('__name__'));
    } else {
      // Order by name for consistent pagination when not filtering
      q = query(q, orderBy('name'));
    }

    if (lastDocId) {
      const lastDocSnap = await getDoc(doc(db, 'preschools', lastDocId));
      if (lastDocSnap.exists()) {
        q = query(q, startAfter(lastDocSnap));
      }
    }

    q = query(q, limit(limitCount));

    const snapshot = await getDocs(q);
    
    const schools = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        // Convert Firestore Timestamps to strings or dates if necessary
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    const lastVisibleId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;

    return {
      schools,
      lastVisibleId,
      error: null,
    };

  } catch (error: any) {
    console.error('Error in getSchools:', error);
    return {
      schools: [],
      lastVisibleId: null,
      error: `An unexpected error occurred: ${error.message}`,
    };
  }
}
