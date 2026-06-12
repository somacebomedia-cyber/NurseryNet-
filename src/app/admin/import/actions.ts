
// src/app/admin/import/actions.ts
'use server';

import { db } from '@/lib/firebase';
import { writeBatch, doc, collection, serverTimestamp } from 'firebase/firestore';
import data from '@/lib/data/preschools.json';

const preschoolsData = Array.isArray(data) ? data : (data as any)?.default || [];

function createSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export async function importSchoolsAction(ownerId: string): Promise<{ success: boolean; count: number; message: string }> {
  if (!db) {
    return {
      success: false,
      count: 0,
      message: 'Firebase DB SDK is not initialized. Cannot perform import.',
    };
  }

  try {
    const batchSize = 400; // Firestore batch limit is 500
    let successfulImports = 0;

    for (let i = 0; i < preschoolsData.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = preschoolsData.slice(i, i + batchSize);

      chunk.forEach(school => {
        const docId = createSlug(`${school.name}-${school.id}`);
        const colRef = collection(db, 'preschools');
        const docRef = doc(colRef, docId);
        
        const schoolForFirestore = {
            ...school,
            slug: docId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true, 
            ownerId: ownerId, // added ownerId to comply with rules
        };
        delete (schoolForFirestore as any).id;

        batch.set(docRef, schoolForFirestore, { merge: true });
      });

      await batch.commit();
      successfulImports += chunk.length;
    }

    return {
      success: true,
      count: successfulImports,
      message: `Successfully imported ${successfulImports} schools into Firestore.`,
    };
  } catch (error: any) {
    console.error('Error during Firestore import:', error);
    return {
      success: false,
      count: 0,
      message: `An error occurred during import: ${error.message}`,
    };
  }
}
