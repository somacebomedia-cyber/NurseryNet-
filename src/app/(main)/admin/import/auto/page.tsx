'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { writeBatch, collection, doc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import data from '@/lib/data/preschools.json';

// Safely handle JSON import
const preschoolsData = Array.isArray(data) ? data : (data as any)?.default || [];

// Simple slugify fallback to avoid client-side module issues
function createSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-');     // Replace multiple - with single -
}

export default function AutoImportPage() {
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function startImport() {
    if (!preschoolsData || preschoolsData.length === 0) {
      toast({ title: 'No data', description: 'preschools.json is empty.', variant: 'destructive' });
      return;
    }

    setImporting(true);
    setError(null);
    setProgress({ done: 0, total: preschoolsData.length });

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast({ title: 'Not signed in', description: 'Please log in to import data.', variant: 'destructive' });
        setImporting(false);
        return;
      }

      const CHUNK_SIZE = 450;
      for (let i = 0; i < preschoolsData.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const slice = preschoolsData.slice(i, i + CHUNK_SIZE);

        slice.forEach((school: any) => {
          const docId = createSlug(`${school.name}-${school.id}`);
          const colRef = collection(db, 'preschools');
          const ref = doc(colRef, docId);
          
          const schoolData = {
            ...school,
            slug: docId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true,
            ownerId: currentUser.uid, // Set ownerId to pass security rules
          };
          
          delete schoolData.id;
          batch.set(ref, schoolData, { merge: true });
        });

        await batch.commit();
        setProgress(prev => ({ ...prev, done: Math.min(prev.done + slice.length, prev.total) }));
        await new Promise(res => setTimeout(res, 50));
      }

      toast({ title: 'Import Complete!', description: `Successfully imported ${preschoolsData.length} preschools.` });
    } catch (e: any) {
      console.error('Firestore Import Error:', e);
      setError(e.message || 'An unknown error occurred during the import.');
      toast({
        title: 'Import Failed',
        description: e.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  }

  if (!isMounted) {
    return null; // Prevent hydration errors
  }

  return (
    <div className="container mx-auto py-20 max-w-2xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Auto Import Google Places Data</CardTitle>
          <CardDescription>Push the {preschoolsData?.length || 0} preschools from the JSON file into your Firestore database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded-md">{error}</div>}

          {importing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing... {progress.done} / {progress.total}
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: progress.total > 0 ? `${(progress.done / progress.total) * 100}%` : '0%' }}></div>
              </div>
            </div>
          )}

          <Button onClick={startImport} disabled={importing || !preschoolsData || preschoolsData.length === 0} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              Start Import
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
