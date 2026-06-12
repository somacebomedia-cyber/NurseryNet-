'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { cleanupUnusedFiles } from '@/utils/cleanup';

export default function SettingsForm() {
  const uid = auth.currentUser?.uid!;
  const [targetUid, setTargetUid] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">Assign role</h3>
        <div className="flex gap-2">
          <input className="border p-2" placeholder="User UID" value={targetUid} onChange={(e) => setTargetUid(e.target.value)} />
          <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={async () => {
            if (!targetUid) return;
            await setDoc(doc(db, 'users', targetUid), { role: 'admin' }, { merge: true });
            alert('Assigned admin role');
          }}>Make admin</button>
          <button className="px-3 py-2 bg-gray-600 text-white rounded" onClick={async () => {
            if (!targetUid) return;
            await setDoc(doc(db, 'users', targetUid), { role: 'editor' }, { merge: true });
            alert('Assigned editor role');
          }}>Make editor</button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Storage cleanup</h3>
        <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={async () => {
          await cleanupUnusedFiles(uid);
          alert('Cleanup complete');
        }}>Clean my unused files</button>
      </div>
    </div>
  );
}
