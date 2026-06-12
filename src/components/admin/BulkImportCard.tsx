// src/components/admin/BulkImportCard.tsx
'use client';

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { writeBatch, collection, doc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { getAuth } from 'firebase/auth';
import slugify from 'slugify';

export function BulkImportCard() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
        setError(null);
        setRecords([]);
        parseFile(selectedFile);
    }
  };

  async function parseFile(f: File) {
    setParsing(true);
    setRecords([]);
    setError(null);
    try {
      const extension = f.name.split('.').pop()?.toLowerCase();
      let parsedRows: any[] = [];
      
      if (extension === 'csv') {
        parsedRows = await new Promise((resolve, reject) => {
          Papa.parse(f, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (err: any) => reject(err),
          });
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheetName = workbook.SheetNames[0];
        parsedRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      } else {
        throw new Error('Unsupported file type. Please use CSV or XLSX.');
      }

      setRecords(parsedRows);
      toast({ title: 'Parsed Successfully', description: `Parsed ${parsedRows.length} records. Ready to import.` });
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unknown parse error');
      toast({ title: 'Parse failed', description: e?.message || 'Unknown parse error', variant: 'destructive' });
    } finally {
      setParsing(false);
    }
  }

  function mapRowToDoc(row: any) {
    const natEmis = String(row.NatEmis || row.ID || '').trim();
    const name = row.InstitutionName || row.Name || '';
    
    if (!name) {
      return null;
    }

    const rawStatus = (row.DoE_Status || row.status || 'OPEN').toString().toUpperCase();
    const isActive = rawStatus === 'OPEN';
    
    const lat = parseFloat(row.GIS_Lat);
    const lon = parseFloat(row.GIS_Long || row.Longitude);
    const validLat = !Number.isNaN(lat) && lat !== 99 && lat !== 0;
    const validLon = !Number.isNaN(lon) && lon !== 99 && lon !== 0;

    const data: any = {
      name: name,
      slug: slugify(name, { lower: true, strict: true }),
      province: row.Province || 'Western Cape',
      city: row.LMunName || row.City || row.EIDistrict || row.DMunName || '',
      location: row.StreetAddress || row.Address || '',
      contact: {
          phone: row.Telephone || row.Phone || '',
          email: row.Email || '',
          website: '',
      },
      source: row.Source || row.GISSource || 'import',
      isActive: isActive,
      doeStatus: rawStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    if (natEmis) {
        data.id = natEmis;
    }

    if (validLat && validLon) {
       data.geopoint = new GeoPoint(lat, lon);
    }

    // Choose a doc id: prefer NatEmis/ID, else let Firestore assign
    const docId = natEmis || undefined;
    return { docId, data };
  }

  async function finalizeImport() {
    if (!records.length) {
      toast({ title: 'Nothing to import', description: 'Parse a file first.', variant: 'destructive' });
      return;
    }
    
    const user = getAuth().currentUser;
    if (!user) {
        toast({ title: 'Not signed in', description: 'Please log in again before importing.', variant: 'destructive' });
        return;
    }

    setImporting(true);
    setError(null);
    setProgress({ done: 0, total: records.length });

    try {
      const CHUNK_SIZE = 450;
      for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const batch = writeBatch(db);
        const slice = records.slice(i, i + CHUNK_SIZE);

        slice.forEach(row => {
          const mapped = mapRowToDoc(row);
          if (mapped) {
            const { docId, data } = mapped;
            const colRef = collection(db, 'preschools');
            const ref = docId ? doc(colRef, docId) : doc(colRef);
            batch.set(ref, data, { merge: true });
          }
        });

        await batch.commit();
        setProgress(prev => ({ ...prev, done: Math.min(prev.done + slice.length, prev.total) }));
        await new Promise(res => setTimeout(res, 50));
      }

      toast({ title: 'Import Complete!', description: `Successfully imported ${records.length} preschools.` });
      setRecords([]);
      setFile(null);
    } catch (e: any) {
      console.error('Firestore Import Error:', e);
      const message = e.message || 'An unknown error occurred during the import.';
      setError(message);
      toast({
        title: e.code || 'Import Failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Bulk Preschool Import</CardTitle>
        <CardDescription>Upload a CSV or XLSX file to import data directly into Firestore from your browser.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          disabled={parsing || importing}
        />

        {parsing && (
          <div className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Parsing file...</div>
        )}
        
        {error && <div className="text-destructive text-sm font-medium p-2 bg-destructive/10 rounded-md">{error}</div>}

        {records.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-green-600 font-semibold">Parsed {records.length} records. Ready to import.</p>
            {importing && (
                <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing... {progress.done} / {progress.total}
                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(progress.done / progress.total) * 100}%` }}></div>
                    </div>
                </div>
            )}
          </div>
        )}

        <Button onClick={finalizeImport} disabled={!records.length || importing || parsing} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Finalize Import
        </Button>
      </CardContent>
    </Card>
  );
}
