
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { doc, setDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { retry } from './retry';
import { stripUndefined } from './stripUndefined';

const sanitizeName = (s: string) => s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();

export async function uploadAndSaveProfileAsset(opts: {
  uid: string; file: File | null; fieldName: string; storageFieldName?: string; profileData?: Record<string, any>; isPublic?: boolean;
}): Promise<string | ''> {
  const { uid, file, fieldName, storageFieldName, profileData = {}, isPublic = true } = opts;
  if (!uid) throw new Error('Missing uid for upload.');

  // Text-only incremental save when no file present
  if (!file) {
    if (Object.keys(profileData).length) {
      await setDoc(doc(db, 'preschools', uid), stripUndefined(profileData), { merge: true });
    }
    return '';
  }
  
  // Use storageFieldName for the file's name, fallback to fieldName
  const baseName = sanitizeName(storageFieldName || fieldName);
  const safe = `${baseName}_${Date.now()}_${sanitizeName(file.name)}`;
  const filePath = isPublic ? `preschools/${uid}/public/${safe}` : `preschools/${uid}/${safe}`;

  const fileRef = ref(storage, filePath);
  
  await retry(() => uploadBytes(fileRef, file, { contentType: file.type }));
  const url = await retry(() => getDownloadURL(fileRef));

  // Use fieldName for the Firestore document key
  // This was a bug before, we must use the correct field name e.g. `logoUrl`.
  const firestoreFieldName = fieldName === 'logo' ? 'logoUrl' : fieldName;
  await setDoc(doc(db, 'preschools', uid), stripUndefined({ ...profileData, [firestoreFieldName]: url }), { merge: true });

  return url;
}


export async function uploadMultipleAssets(opts: {
  uid: string; files: File[]; fieldName: 'gallery' | 'documents'; isPublic?: boolean; useSubcollection?: boolean;
}) {
  const { uid, files, fieldName, isPublic = true, useSubcollection = true } = opts;
  if (!uid) throw new Error('Missing uid for upload.');
  
  const urls: string[] = [];
  for (const file of files) {
    const safe = `${fieldName}_${Date.now()}_${sanitizeName(file.name)}`;
    const filePath = isPublic ? `preschools/${uid}/public/${safe}` : `preschools/${uid}/${safe}`;
    const fileRef = ref(storage, filePath);
    await retry(() => uploadBytes(fileRef, file, { contentType: file.type }));
    const url = await retry(() => getDownloadURL(fileRef));
    urls.push(url);

    if (useSubcollection) {
      await setDoc(doc(collection(db, `preschools/${uid}/${fieldName}`), safe), {
        url, fileName: file.name, path: filePath, uploadedAt: new Date().toISOString(),
      }, { merge: true });
    }
  }
  if (!useSubcollection) {
    // This part would need more complex logic to handle merging arrays of objects
    const updatePayload: Record<string, any> = {};
    if (fieldName === 'gallery') {
      updatePayload.images = arrayUnion(...urls.map(url => ({ url, alt: 'gallery image', dataAiHint: 'preschool image' })));
    }
    await updateDoc(doc(db, 'preschools', uid), updatePayload);
  }
  return urls;
}
