
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Heart, Handshake, Video, Lock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ParentDashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-background py-10 md:py-16">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Let's find the perfect start for your little one.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card className="shadow-lg glassmorphism hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                    <Search className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Find a Preschool</CardTitle>
                <CardDescription>Explore our directory of local preschools to find the perfect match for your family.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <Button asChild size="lg" className="bg-primary text-primary-foreground">
                    <Link href="/directory">Start Searching</Link>
                 </Button>
            </CardContent>
          </Card>
           <Card className="shadow-lg glassmorphism hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="items-center text-center">
                <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto mb-3">
                    <Heart className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl text-primary">Your Favorites</CardTitle>
                <CardDescription>Keep track of the preschools you're interested in. (Feature coming soon!)</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <Button size="lg" disabled>
                    View Favorites
                 </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-lg glassmorphism hover:shadow-xl transition-shadow duration-300 mb-8">
            <CardHeader className="items-center text-center">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                    <Video className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Live Classroom Feed</CardTitle>
                <CardDescription>Get peace of mind with a secure, live view of your child's classroom activities.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <div className="relative aspect-video w-full max-w-lg mx-auto rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center text-gray-400">
                    <Image 
                        src="https://images.unsplash.com/photo-1518542568098-b1224de5b359?w=800&h=450&fit=crop" 
                        alt="Live feed placeholder"
                        data-ai-hint="teacher children"
                        width={800}
                        height={450}
                        className="opacity-30 object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4">
                         <Lock className="h-12 w-12 text-white mb-4" />
                         <h3 className="text-xl font-bold text-white">Feature Locked</h3>
                         <p className="text-white/80">Subscribe to access the live feed.</p>
                    </div>
                </div>
                <Button size="lg" className="bg-primary text-primary-foreground">
                    Subscribe to Live Feed - R49/month
                </Button>
            </CardContent>
        </Card>


        <Card className="mt-8 shadow-lg glassmorphism bg-yellow-400/10 border-yellow-500/20">
            <CardHeader>
                <CardTitle className="text-xl text-yellow-700 flex items-center"><Handshake className="mr-2 h-5 w-5"/>Become a NurseryNet Affiliate</CardTitle>
                <CardDescription className="text-yellow-800/90">Love our platform? Share it with preschools and earn rewards! It's a great way to support early education.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
                <Button asChild className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500/90">
                    <Link href="/dashboard/affiliate">View Affiliate Dashboard</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/affiliates">Learn More</Link>
                </Button>
            </CardContent>
        </Card>

         <p className="mt-12 text-center text-sm text-muted-foreground">
            Looking to manage your parent profile? Account settings coming soon!
        </p>
      </div>
    </div>
  );
}
