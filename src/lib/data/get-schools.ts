// src/lib/data/get-schools.ts
'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, startAfter, Query } from 'firebase/firestore';
import fallbackPreschools from '@/lib/data/preschools.json';

export async function getSchools(city?: string, lastDocId?: string, limitCount: number = 20) {
  try {
    if (db && Object.keys(db).length > 0) {
      const preschoolsRef = collection(db, 'preschools');
      let q: Query = preschoolsRef;

      if (city && city.trim()) {
        q = query(q, where('city', '==', city.trim()), orderBy('__name__'));
      } else {
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
      
      if (!snapshot.empty) {
        const firestoreSchools = snapshot.docs.map(docSnap => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
            updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          };
        });

        const firestoreIds = new Set(firestoreSchools.map(s => s.id));
        const firestoreNames = new Set(firestoreSchools.map(s => ((s as any).name || '').toLowerCase()));
        
        let filteredLocal = (fallbackPreschools as any[]) || [];
        if (city && city.trim()) {
          const queryLower = city.trim().toLowerCase();
          filteredLocal = filteredLocal.filter(school => 
            (school.city && school.city.toLowerCase().includes(queryLower)) ||
            (school.location && school.location.toLowerCase().includes(queryLower)) ||
            (school.province && school.province.toLowerCase().includes(queryLower)) ||
            (school.name && school.name.toLowerCase().includes(queryLower))
          );
        }

        const additionalLocal = filteredLocal.filter(s => !firestoreIds.has(s.id) && !firestoreNames.has((s.name || '').toLowerCase()));
        const combined = [...firestoreSchools, ...additionalLocal];

        const lastVisibleId = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null;

        return {
          schools: combined.slice(0, limitCount),
          lastVisibleId,
          error: null,
        };
      }
    }
  } catch (error: any) {
    console.warn('Firestore getSchools failed, using local dataset fallback:', error?.message);
  }

  // Fallback to local dataset when Firestore is offline or empty
  try {
    let filtered = (fallbackPreschools as any[]) || [];
    if (city && city.trim()) {
      const queryLower = city.trim().toLowerCase();
      filtered = filtered.filter(school => 
        (school.city && school.city.toLowerCase().includes(queryLower)) ||
        (school.location && school.location.toLowerCase().includes(queryLower)) ||
        (school.province && school.province.toLowerCase().includes(queryLower)) ||
        (school.name && school.name.toLowerCase().includes(queryLower))
      );
    }

    let startIndex = 0;
    if (lastDocId) {
      const foundIndex = filtered.findIndex(s => s.id === lastDocId);
      if (foundIndex !== -1) {
        startIndex = foundIndex + 1;
      }
    }

    const paginated = filtered.slice(startIndex, startIndex + limitCount);
    const lastVisibleId = (startIndex + limitCount < filtered.length) && paginated.length > 0
      ? paginated[paginated.length - 1].id
      : null;

    return {
      schools: paginated,
      lastVisibleId,
      error: null,
    };
  } catch (fallbackError: any) {
    return {
      schools: [],
      lastVisibleId: null,
      error: `Could not load preschools: ${fallbackError.message}`,
    };
  }
}
