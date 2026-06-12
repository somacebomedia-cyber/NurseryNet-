// src/app/(main)/dashboard/UserDashboard.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Heart } from "lucide-react";
import Link from "next/link";

export default function UserDashboard() {
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

         <p className="mt-12 text-center text-sm text-muted-foreground">
            Looking to manage your parent profile? Account settings coming soon!
        </p>
      </div>
    </div>
  );
}
