// This component has been temporarily disabled as part of the MVP pivot.
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DisabledComponent() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
            <p className="text-muted-foreground">This feature is temporarily unavailable.</p>
        </div>
    );
}
