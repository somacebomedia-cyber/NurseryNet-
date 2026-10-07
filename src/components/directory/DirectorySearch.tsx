'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { label: 'All Preschools', value: '' },
  { label: 'Bloemfontein', value: 'Bloemfontein' },
  { label: 'Welkom', value: 'Welkom' },
  { label: 'Port Elizabeth', value: 'Port Elizabeth' },
  { label: 'Benoni', value: 'Benoni' },
  { label: 'Kempton Park', value: 'Kempton Park' },
];

export default function DirectorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCity = searchParams.get('city') || '';
  const [city, setCity] = useState(urlCity);
  const [isPending, startTransition] = useTransition();

  // Sync state if URL changes externally
  useEffect(() => {
    setCity(urlCity);
  }, [urlCity]);

  const performSearch = (targetCity: string) => {
    startTransition(() => {
      if (targetCity.trim()) {
        router.push(`/directory?city=${encodeURIComponent(targetCity.trim())}`);
      } else {
        router.push('/directory');
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(city);
  };

  const handleClear = () => {
    setCity('');
    performSearch('');
  };

  const handleQuickFilter = (locationValue: string) => {
    setCity(locationValue);
    performSearch(locationValue);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <form onSubmit={handleSearch} className="flex w-full items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by city, area, or name (e.g., London)..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="pl-9 pr-9 h-11 text-base bg-background shadow-xs border-border/80 focus-visible:ring-primary"
          />
          {city && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              aria-label="Clear search text"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" disabled={isPending} className="h-11 px-6 font-semibold">
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>

      {/* Segmented Quick Filter Buttons */}
      <div className="flex items-center justify-center flex-wrap gap-1.5 p-1 bg-muted/60 backdrop-blur-xs rounded-lg border border-border/40 text-xs">
        <span className="text-muted-foreground px-2 py-1 font-medium">Quick filter:</span>
        {POPULAR_LOCATIONS.map((loc) => {
          const isActive = (loc.value === '' && !urlCity) || (loc.value.toLowerCase() === urlCity.toLowerCase());
          return (
            <button
              key={loc.label}
              type="button"
              onClick={() => handleQuickFilter(loc.value)}
              className={`px-3 py-1.5 font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-background text-foreground shadow-xs border border-border/60'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {loc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
