'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-4">
        <AlertCircle className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-2">
        Something went wrong!
      </h2>
      <p className="max-w-md text-muted-foreground mb-8 text-sm">
        An unexpected error occurred while loading this page. Please try again or return to the home page.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={() => reset()} className="gap-2 rounded-xl">
          <RefreshCw className="h-4 w-4" /> Try Again
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
