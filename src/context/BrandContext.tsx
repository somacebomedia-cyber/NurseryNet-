// src/context/BrandContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type Brand = 'NurseryNet' | 'PrimaryNet' | 'HighschoolNet' | 'TertiaryNet';

interface BrandContextType {
  brand: Brand;
  setBrand: (brand: Brand) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// This is a new wrapper component that contains the 'use client' directive
// and handles the state and effects that depend on client-side hooks.
function BrandProviderClient({ children }: { children: ReactNode }) {
  const [brand, setBrand] = useState<Brand>('NurseryNet');
  const searchParams = useSearchParams();

  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam === 'primary') {
      setBrand('PrimaryNet');
    } else if (brandParam === 'highschool') {
      setBrand('HighschoolNet');
    } else if (brandParam === 'tertiary') {
        setBrand('TertiaryNet');
    } else {
      setBrand('NurseryNet');
    }
  }, [searchParams]);

  useEffect(() => {
    // This effect will run on the client side after the component mounts
    // and whenever the brand changes. It updates the data-brand attribute on the body.
    if (typeof window !== 'undefined') {
      document.body.setAttribute('data-brand', brand.toLowerCase());
    }
  }, [brand]);

  const value = { brand, setBrand };

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}


// The exported BrandProvider remains a server-friendly component
// that wraps the client-side logic.
export const BrandProvider = ({ children }: { children: ReactNode }) => {
  return (
      <BrandProviderClient>
        {children}
      </BrandProviderClient>
  );
};

export const useBrand = (): BrandContextType => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrand must be used within a BrandProvider');
  }
  return context;
};
