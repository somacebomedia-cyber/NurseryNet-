
// src/app/admin/import/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, AlertTriangle, CheckCircle } from 'lucide-react';
import { importSchoolsAction } from './actions';
import { useAuth } from '@/context/AuthContext';

export default function ImportPage() {
  const { user } = useAuth();
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; count: number; message: string } | null>(null);

  const handleImport = async () => {
    setIsImporting(true);
    setResult(null);
    const importResult = await importSchoolsAction();
    setResult(importResult);
    setIsImporting(false);
  };
  
  if (user?.role !== 'admin') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
             <Card className="w-full max-w-md m-4">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center"><AlertTriangle className="mr-2"/>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You must be an administrator to access this page.</p>
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md m-4">
        <CardHeader>
          <CardTitle>Database Import</CardTitle>
          <CardDescription>
            One-time action to migrate schools from `preschools.json` into the Firestore database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleImport} disabled={isImporting} className="w-full">
            {isImporting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
            ) : (
              <><Database className="mr-2 h-4 w-4" /> Start Import</>
            )}
          </Button>
          {result && (
            <div className={`mt-4 p-4 rounded-md text-sm ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <div className="flex items-center">
                 {result.success ? <CheckCircle className="mr-2"/> : <AlertTriangle className="mr-2"/>}
                 <strong>{result.success ? 'Success' : 'Error'}</strong>
              </div>
              <p>{result.message}</p>
              {result.count > 0 && <p>Processed {result.count} records.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
