// src/app/(main)/preschools/funding-finder/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is now deprecated in favor of the new /funding page.
// It will redirect users to the new, streamlined experience.
export default function FundingFinderRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/funding');
    }, [router]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirecting to our new Funding Hub...</p>
        </div>
    );
}
