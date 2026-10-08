// src/app/(main)/directory/page.tsx
import { getSchools } from '@/lib/data/get-schools';
import { Search, Frown, ChevronRight, School } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import DirectorySearch from '@/components/directory/DirectorySearch';
import PreschoolCardsGrid, { type SchoolWithId } from '@/components/directory/PreschoolCardsGrid';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const lastDocId = typeof params.lastDocId === 'string' ? params.lastDocId : undefined;

  const { schools, lastVisibleId, error } = await getSchools(city, lastDocId, 20);

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 text-primary mb-4">
            <School className="h-10 w-10" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Preschool Directory
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Find the perfect start for your child. Browse verified early learning centers and preschools.
          </p>
        </header>

        <Suspense fallback={<div className="h-11 w-full max-w-2xl mx-auto mb-10 animate-pulse bg-muted rounded-md" />}>
          <DirectorySearch />
        </Suspense>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
            <Frown className="h-4 w-4" />
            <AlertTitle>Error Loading Directory</AlertTitle>
            <AlertDescription>
              {error} Please ensure the Firestore Index is created or reload the page.
            </AlertDescription>
          </Alert>
        )}

        {!error && schools.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-6 px-1">
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{schools.length}</span> preschool{schools.length === 1 ? '' : 's'}
                {city ? (
                  <span> matching &ldquo;<span className="text-primary font-semibold">{city}</span>&rdquo;</span>
                ) : (
                  <span> across all regions</span>
                )}
              </p>
            </div>

            {/* Staggered Animated Cards Grid */}
            <PreschoolCardsGrid schools={schools as SchoolWithId[]} cityQuery={city} />
            
            {lastVisibleId && schools.length === 20 && (
              <div className="flex justify-center mt-8">
                <Link href={`/directory?${city ? `city=${encodeURIComponent(city)}&` : ''}lastDocId=${lastVisibleId}`}>
                  <Button variant="outline" size="lg" className="gap-2">
                    Next Page <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {!error && schools.length === 0 && (
          <div className="text-center py-16 px-4 bg-muted/30 rounded-2xl border border-dashed border-border/80 max-w-xl mx-auto">
            <div className="p-4 rounded-full bg-primary/10 w-16 h-16 mx-auto flex items-center justify-center text-primary mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No preschools found</h3>
            <p className="text-muted-foreground mt-2 text-sm max-w-md mx-auto">
              {city 
                ? `We couldn't find any preschools matching "${city}". Try searching for another city like Johannesburg, Pretoria, Ekurhuleni, or Polokwane.`
                : 'No preschools are currently available in the directory. Please check back later.'}
            </p>
            {city && (
              <div className="mt-6">
                <Link href="/directory">
                  <Button variant="outline" size="sm">
                    Clear Search Filters
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
