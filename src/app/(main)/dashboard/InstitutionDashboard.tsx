
// src/app/(main)/dashboard/InstitutionDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, ImagePlus, BrainCircuit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import DashboardAiTools from "@/components/dashboard/DashboardAiTools";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardInquiries from "@/components/dashboard/DashboardInquiries";
import { PreschoolData } from "@/lib/schemas/preschool";
  
export default function InstitutionDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<PreschoolData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  useEffect(() => {
    if (!user) {
        setLoadingProfile(false);
        return;
    };
    const fetchProfile = async () => {
        setLoadingProfile(true);
        try {
            const q = query(collection(db, "preschools"), where("ownerId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Assuming one owner owns one preschool for now
                const profileSnap = querySnapshot.docs[0];
                setProfileData(profileSnap.data() as PreschoolData);
            } else {
                setProfileData(null);
            }
        } catch (error) {
            console.error("Failed to fetch preschool profile:", error);
            toast({
                title: 'Error',
                description: 'Could not fetch your preschool profile data.',
                variant: 'destructive'
            });
        } finally {
            setLoadingProfile(false);
        }
    };
    fetchProfile();
  }, [user, toast]);

  const handlePostStory = () => {
    toast({
      title: "Story Posted!",
      description: "Your story is now live on your profile for 24 hours.",
    });
  };

  const preschoolName = profileData?.name || (user?.name ? `${user.name}'s Preschool` : "My Preschool");
  const isGrowthMember = user?.planId === 'growth' && user.subscriptionStatus === 'active';
  const isCreativeMember = user?.planId === 'creative' && user.subscriptionStatus === 'active';

  return (
    <div className="bg-background py-10 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            {preschoolName} - Dashboard
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Welcome, {user?.name}! Track your profile's performance and engagement on NurseryNet.
          </p>
        </header>

        {loadingProfile ? (
          <div className="flex items-center justify-center p-12">
             <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <Card className="shadow-lg glassmorphism bg-primary/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center"><Edit className="mr-2 h-5 w-5"/>Manage Public Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Your profile is how parents find you. Keep it complete and up-to-date.</p>
                        <Button asChild>
                            <Link href="/dashboard/profile">Edit Profile</Link>
                        </Button>
                        <Button variant="outline" asChild className="ml-2">
                            <Link href="/preschools/profile-preview">Preview</Link>
                        </Button>
                    </CardContent>
                </Card>
                <Card className="shadow-lg glassmorphism">
                     <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center"><ImagePlus className="mr-2 h-5 w-5"/>Post a Story</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">Share a real-time update with parents. Visible for 24 hours.</p>
                        <input id="story-file" type="file" className="mb-4 w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        <Button onClick={handlePostStory} className="w-full">Post to Story</Button>
                    </CardContent>
                </Card>
                <Card className="shadow-lg glassmorphism lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-xl text-primary flex items-center"><BrainCircuit className="mr-2 h-5 w-5"/>AI Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isGrowthMember ? (
                           <p className="text-muted-foreground">Access your premium AI tools for funding, business plans, and content generation below.</p>
                        ) : (
                           <div className="text-center p-4 bg-primary/5 rounded-lg">
                               <p className="text-muted-foreground mb-3">Upgrade to unlock powerful AI features.</p>
                               <Button asChild size="sm">
                                   <Link href="/pricing">View Plans</Link>
                               </Button>
                           </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            
            <DashboardAiTools 
                isGrowthMember={isGrowthMember}
                isCreativeMember={isCreativeMember}
                preschoolName={preschoolName}
                profileData={profileData}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <DashboardInquiries />
              <DashboardAnalytics />
            </div>

          </>
        )}
        
        <p className="mt-12 text-center text-sm text-muted-foreground">
          Note: Analytics data is for demonstration purposes. Full functionality requires an active preschool profile.
        </p>
      </div>
    </div>
  );
}
