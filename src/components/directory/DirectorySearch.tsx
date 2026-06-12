'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function DirectorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [city, setCity] = useState(searchParams.get('city') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) {
      router.push(`/directory?city=${encodeURIComponent(city.trim())}`);
    } else {
      router.push('/directory');
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto items-center space-x-2 mb-12">
      <Input
        type="text"
        placeholder="Search by city (e.g., London)"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="flex-1"
      />
      <Button type="submit">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
