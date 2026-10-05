import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-primary/10 text-primary mb-6">
        <Compass className="h-12 w-12" />
      </div>
      <h1 className="font-headline text-6xl font-extrabold text-primary mb-3">404</h1>
      <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl mb-3">
        Page Not Found
      </h2>
      <p className="max-w-md text-muted-foreground mb-8 text-base">
        Sorry, we couldn&apos;t find the preschool, page, or resource you are looking for. It might have been moved or doesn&apos;t exist.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/">
          <Button className="gap-2 rounded-xl">
            <Home className="h-4 w-4" /> Go Home
          </Button>
        </Link>
        <Link href="/directory">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Search className="h-4 w-4" /> Browse Directory
          </Button>
        </Link>
      </div>
    </div>
  );
}
