
// src/app/(main)/directory/page.tsx
import { getSchools } from '@/lib/data/get-schools';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Frown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PreschoolData } from '@/lib/schemas/preschool';
import DirectorySearch from '@/components/directory/DirectorySearch';
import { Button } from '@/components/ui/button';
import { Suspense } from 'react';

interface SchoolWithId extends PreschoolData {
  id: string;
}

function SchoolCard({ school }: { school: SchoolWithId }) {
  const placeholderImg = "https://picsum.photos/seed/placeholder/400/200";
  const mainImage = school.images?.[0]?.url || placeholderImg;

  return (
    <Link href={`/directory/${school.id}`} passHref>
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
        <Image
          src={mainImage}
          alt={school.name || 'Preschool Image'}
          width={400}
          height={200}
          className="w-full h-40 object-cover"
        />
        <CardHeader>
          <CardTitle className="text-xl text-primary">{school.name}</CardTitle>
          <CardDescription>{school.location}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {school.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const city = typeof params.city === 'string' ? params.city : undefined;
  const lastDocId = typeof params.lastDocId === 'string' ? params.lastDocId : undefined;

  const { schools, lastVisibleId, error } = await getSchools(city, lastDocId, 20);

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20 min-h-screen">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-8">
          <Search className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            Preschool Directory
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            Find the perfect start for your little one. Browse our curated list of local preschools.
          </p>
        </header>

        <Suspense fallback={<div className="h-10 w-full max-w-md mx-auto mb-12 animate-pulse bg-muted rounded-md" />}>
          <DirectorySearch />
        </Suspense>

        {error && (
          <Alert variant="destructive" className="max-w-2xl mx-auto mb-8">
            <Frown className="h-4 w-4" />
            <AlertTitle>Error Loading Directory</AlertTitle>
            <AlertDescription>
              {error} Please ensure the Firestore Index is created as per the README instructions.
            </AlertDescription>
          </Alert>
        )}

        {!error && schools.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {schools.map(school => <SchoolCard key={school.id} school={school as SchoolWithId} />)}
            </div>
            
            {lastVisibleId && schools.length === 20 && (
              <div className="flex justify-center">
                <Link href={`/directory?${city ? `city=${encodeURIComponent(city)}&` : ''}lastDocId=${lastVisibleId}`}>
                  <Button variant="outline" size="lg">
                    Next Page <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}

        {!error && schools.length === 0 && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">No preschools found {city ? `in ${city}` : ''}.</p>
            <p className="text-sm text-muted-foreground mt-2">Try searching for a different city or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
