// src/app/(main)/preschools/profile-preview/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, Timestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { PreschoolData } from '@/lib/schemas/preschool';
import PublicProfileView from '@/components/profile/PublicProfileView';
import { Loader2, Eye, Frown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ProfilePreviewPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PreschoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDevPreview, setIsDevPreview] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      // If user is a logged-in preschool owner, fetch their real data
      if (user && user.role === 'Preschool Owner') {
        setIsDevPreview(false);
        try {
          // CORRECTED: Query for the preschool document where ownerId matches the user's UID
          const q = query(collection(db, "preschools"), where("ownerId", "==", user.uid), limit(1));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            setProfile({ id: docSnap.id, ...docSnap.data() } as PreschoolData);
          } else {
            // No profile created yet
            setProfile(null);
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError("Could not load your profile preview. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // For developer view, create and show mock data
        setIsDevPreview(true);
        const mockProfile: PreschoolData = {
            id: 'mock-preschool-id',
            ownerId: 'mock-owner-id',
            name: 'Sunshine Mock Preschool',
            location: '123 Dreamy Lane, Imagination City',
            description: 'This is a mock description for a beautiful preschool. We focus on learning through play and creativity. Our facilities are top-notch and our teachers are passionate about early childhood development.',
            philosophy: 'We believe every child is a unique star, ready to shine. Our philosophy is to nurture their individual talents in a warm, safe, and stimulating environment.',
            contact: {
                phone: '012 345 6789',
                email: 'info@sunshinemock.com',
                website: 'https://www.sunshinemock.com',
            },
            hours: 'Monday - Friday: 07:30 - 17:30',
            ageGroup: '18 months - 5 years',
            features: ['Play-based learning', 'Large outdoor play area', 'Nutritious daily meals', 'Qualified ECD practitioners', 'Art & Music program', 'Small class sizes'],
            logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
            images: [
                { url: 'https://images.unsplash.com/photo-1576572879633-5c8a3c5a7192?w=800&h=500&fit=crop', alt: 'Preschool classroom', dataAiHint: 'classroom children' },
                { url: 'https://images.unsplash.com/photo-1550355191-aa7583f090e5?w=200&h=150&fit=crop', alt: 'Playground', dataAiHint: 'playground kids' },
                { url: 'https://images.unsplash.com/photo-1509305717900-84f40e786d82?w=200&h=150&fit=crop', alt: 'Art class', dataAiHint: 'children painting' },
                { url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=200&h=150&fit=crop', alt: 'Reading corner', dataAiHint: 'children reading' },
            ],
            videos: [
                { url: 'https://placehold.co/400x225.mp4' },
            ],
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };
        setProfile(mockProfile);
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-10">
          <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading Your Profile Preview...</p>
        </div>
      );
    }

    if (error) {
        return (
            <Card className="w-full max-w-xl mx-auto shadow-lg glassmorphism bg-destructive/10 border-destructive">
                 <CardHeader className="text-center">
                    <div className="p-3 bg-destructive/20 rounded-full w-fit mx-auto mb-3"><Frown className="h-10 w-10 text-destructive" /></div>
                    <CardTitle className="text-2xl text-destructive">An Error Occurred</CardTitle>
                    <CardDescription className="text-destructive-foreground">{error}</CardDescription>
                </CardHeader>
            </Card>
        );
    }
    
    // For logged-in owners who haven't created a profile yet
    if (!profile && !isDevPreview) {
      return (
        <Card className="w-full max-w-xl mx-auto shadow-lg glassmorphism">
            <CardHeader className="text-center">
                <div className="p-3 bg-primary/20 rounded-full w-fit mx-auto mb-3"><Eye className="h-10 w-10 text-primary" /></div>
                <CardTitle className="text-2xl text-primary">No Profile Found</CardTitle>
                <CardDescription>It looks like you haven't created your preschool profile yet. Create one to see how it will appear to parents!</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button asChild size="lg"><Link href="/dashboard/profile">Create Your Profile</Link></Button>
            </CardContent>
        </Card>
      );
    }

    // Success case (real or mock profile)
    if (profile) {
       return <PublicProfileView preschool={profile} showBackButton={false} />;
    }

    // Fallback if something unexpected happens
    return null;
  };


  return (
    <div className="py-12 md:py-20 bg-gradient-to-br from-background to-secondary/30 min-h-[calc(100vh-var(--header-height,8rem))]">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
         <header className="text-center mb-12">
          <Eye className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
            Profile Preview
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            This is exactly what parents will see when they view your profile in the directory.
          </p>
        </header>

         {isDevPreview && (
            <Alert className="mb-8 bg-primary/10 border-primary/20">
                <Info className="h-5 w-5 text-primary" />
                <AlertTitle className="font-bold text-primary">Developer Preview</AlertTitle>
                <AlertDescription>
                You are viewing a mock profile. Log in as a Preschool Owner to preview your own profile.
                </AlertDescription>
            </Alert>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
