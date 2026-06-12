
// src/app/(main)/preschools/logo-generator/page.tsx
import LogoGenerator from '@/components/marketing/LogoGenerator';
import { Wand2 } from 'lucide-react';

export default function LogoGeneratorPage() {
  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-background to-secondary/30 min-h-[calc(100vh-var(--header-height,8rem))] flex items-center"> {/* Adjust min-h as needed */}
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <Wand2 className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            AI Logo Generator
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Craft a unique brand for your preschool or animate your existing logo with the power of AI.
          </p>
        </header>
        <LogoGenerator />
      </div>
    </div>
  );
}
