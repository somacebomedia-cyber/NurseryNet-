
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/context/AuthContext';
import { BrandProvider } from '@/context/BrandContext';
import { cn } from '@/lib/utils';
import { Fredoka, Nunito, Poppins, Lato, Inter, Roboto, Lora, Merriweather } from 'next/font/google';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SocialProofPopup from '@/components/marketing/SocialProofPopup';

const fredoka = Fredoka({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-fredoka' });
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-poppins' });
const lato = Lato({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-lato' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-roboto' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-merriweather' });

export const metadata: Metadata = {
  title: 'NurseryNet - Find Your Perfect Preschool',
  description: 'NurseryNet is the ultimate platform for early childhood education in South Africa, connecting parents with amazing preschools and empowering owners with AI-powered marketing tools, funding finders, and growth resources.',
};

function RootLoading() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const newIconUrl = "https://ik.imagekit.io/wugvdm3ddq/Iconnew-512x512.png?updatedAt=1764044488330";
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&family=Nunito:wght@200..1000&family=Poppins:wght@400;600;700&family=Lato:wght@400;700&family=Roboto:wght@400;500;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&display=swap" rel="stylesheet" />
        
        <link rel="manifest" href="/manifest.json?v=4" />
        <link rel="icon" href={`${newIconUrl}&v=4`} type="image/png" />
        <link rel="shortcut icon" href={`${newIconUrl}&v=4`} type="image/png" />
        <link rel="apple-touch-icon" href={`${newIconUrl}&v=4`} />
        <meta name="theme-color" content="#8A5CEE" />
      </head>
      <body
        className={cn(
          "antialiased",
          fredoka.variable,
          nunito.variable,
          poppins.variable,
          lato.variable,
          inter.variable,
          roboto.variable,
          lora.variable,
          merriweather.variable
        )}
      >
        <Suspense fallback={<RootLoading />}>
            <AuthProvider>
                <BrandProvider>
                   <div className="flex min-h-screen flex-col">
                      <Navbar />
                      <main className="flex-grow">{children}</main>
                      <Footer />
                      <SocialProofPopup />
                    </div>
                </BrandProvider>
                <Toaster />
            </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
