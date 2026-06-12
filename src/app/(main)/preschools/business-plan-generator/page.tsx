// src/app/(main)/preschools/business-plan-generator/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated and now redirects to the funding finder page,
// where the business plan generator is integrated.
export default function BusinessPlanGeneratorRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/preschools/funding-finder');
    }, [router]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <p className="text-muted-foreground">Redirecting...</p>
        </div>
    );
}
