import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

export async function cleanupUnusedFiles(uid: string) {
  const profile = (await getDoc(doc(db, 'preschools', uid))).data() || {};
  const galleryDocs = await getDocs(collection(db, `preschools/${uid}/gallery`));
  const docDocs = await getDocs(collection(db, `preschools/${uid}/documents`));

  const used = new Set<string>();
  if (profile.logo) used.add(profile.logo);
  for (const g of galleryDocs.docs) used.add(g.data().url);
  for (const d of docDocs.docs) used.add(d.data().url);

  const folders = [ref(storage, `preschools/${uid}`), ref(storage, `preschools/${uid}/public`)];

  for (const folder of folders) {
    const res = await listAll(folder);
    for (const item of res.items) {
      const url = await getDownloadURL(item);
      if (!used.has(url)) {
        await deleteObject(item);
        // Optionally: delete matching metadata doc by item.name if you used it as doc ID
      }
    }
  }
}
