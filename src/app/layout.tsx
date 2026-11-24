import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';
import { BrandProvider } from '@/context/BrandContext';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SocialProofPopup from '@/components/marketing/SocialProofPopup';
import VoiceAssistantDock from '@/components/voice/VoiceAssistantDock';
import { OfflineIndicator } from '@/components/layout/PWAInstallButton';

export const metadata: Metadata = {
  title: 'NurseryNet - Find Your Perfect Preschool',
  description: 'NurseryNet is the ultimate platform for early childhood education in South Africa, connecting parents with amazing preschools and empowering owners with AI-powered marketing tools, funding finders, and growth resources.',
};

function RootLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:wght@200..700&family=Poppins:wght@400;600;700&family=Lato:wght@400;700&family=Roboto:wght@400;500;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/pwa-192x192.png" type="image/png" />
        <link rel="shortcut icon" href="/pwa-192x192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#8A5CEE" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Suspense fallback={<RootLoading />}>
          <AuthProvider>
            <BrandProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <Footer />
                <SocialProofPopup />
                <VoiceAssistantDock />
                <OfflineIndicator />
              </div>
            </BrandProvider>
            <Toaster />
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
