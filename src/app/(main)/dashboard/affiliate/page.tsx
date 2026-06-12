// src/app/(main)/dashboard/affiliate/page.tsx
import AffiliateDashboard from '@/components/dashboard/AffiliateDashboard';
import { Handshake } from 'lucide-react';

export default function AffiliateDashboardPage() {
  return (
    <div>
        <header className="mb-10">
            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary sm:text-4xl flex items-center">
               <Handshake className="mr-4 h-10 w-10"/> Affiliate Dashboard
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Track your referrals, earnings, and climb the ranks!
            </p>
        </header>
       <AffiliateDashboard />
    </div>
  );
}
