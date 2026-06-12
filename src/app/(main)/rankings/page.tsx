
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PreschoolData } from '@/lib/schemas/preschool';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Award, Star, MapPin, Frown, Sparkles, CheckSquare, BrainCircuit, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface SchoolWithId extends PreschoolData {
  id: string;
}

const rankingCriteria = [
    { icon: Star, title: "Parent Reviews & Ratings", description: "Feedback from parents is a cornerstone of our rankings, reflecting real-world experiences." },
    { icon: CheckSquare, title: "Profile Completeness", description: "Schools that provide comprehensive, up-to-date information score higher for transparency." },
    { icon: Sparkles, title: "Facilities & Features", description: "The quality and variety of facilities, from playgrounds to tech labs, are evaluated." },
    { icon: BrainCircuit, title: "Curriculum & Philosophy", description: "We assess the educational approach, looking for innovative and well-rounded programs." },
];

function RankingCardSkeleton() {
  return (
    <Card className="flex flex-col md:flex-row items-center gap-6 p-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-32 w-32 rounded-lg" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </Card>
  );
}

function RankingCard({ school, rank }: { school: SchoolWithId; rank: number }) {
  const placeholderImg = "https://picsum.photos/seed/placeholder/200/200";
  const logo = school.logo || placeholderImg;

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <CardContent className="p-4 flex flex-col md:flex-row items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className={`flex items-center justify-center h-12 w-12 rounded-full font-bold text-2xl ${
              rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
              rank === 2 ? 'bg-slate-400 text-slate-900' : 
              rank === 3 ? 'bg-yellow-600 text-yellow-100' : 
              'bg-primary/10 text-primary'
            }`}>
            {rank}
          </div>
        </div>
        <Image src={logo} alt={`${school.name} logo`} width={128} height={128} className="rounded-lg object-cover h-32 w-32 border-4 border-background shadow-md" />
        <div className="flex-1 text-center md:text-left">
          <Link href={`/directory/${school.id}`} passHref>
              <CardTitle className="text-2xl text-primary hover:underline">{school.name}</CardTitle>
          </Link>
          <CardDescription className="flex items-center justify-center md:justify-start text-muted-foreground mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            {school.location}
          </CardDescription>
          <p className="text-sm text-foreground/80 mt-3 line-clamp-2">{school.description}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-yellow-500">
              <Star className="h-5 w-5 fill-current"/>
              <Star className="h-5 w-5 fill-current"/>
              <Star className="h-5 w-5 fill-current"/>
              <Star className="h-5 w-5 fill-current"/>
              <Star className="h-5 w-5 "/>
          </div>
           <Badge variant="secondary" className="mt-2">Score: {(9.8 - rank * 0.3).toFixed(1)}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}


export default function RankingsPage() {
  const [schools, setSchools] = useState<SchoolWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const schoolsQuery = query(collection(db, "preschools"), orderBy("name", "desc"), limit(10));
        const querySnapshot = await getDocs(schoolsQuery);
        const schoolsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as SchoolWithId));
        setSchools(schoolsData);
      } catch (e: any) {
        console.error("Failed to fetch schools for rankings:", e);
        setError("Could not load school rankings. The database may be offline or misconfigured.");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  return (
    <div className="bg-gradient-to-br from-background to-secondary/20 py-12 md:py-20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-16">
          <Award className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl">
            The NurseryNet Excellence Rankings
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-muted-foreground sm:text-xl">
            A data-driven ranking of the top preschools on our platform, identifying the future leaders in early childhood education.
          </p>
        </header>

        <section className="mb-16">
          <Card className="shadow-2xl glassmorphism bg-primary/5">
            <CardHeader>
              <CardTitle className="text-3xl text-primary text-center font-headline">The Pillars of Excellence</CardTitle>
              <CardDescription className="text-center text-lg max-w-2xl mx-auto">Our rankings are calculated using a proprietary formula that fairly assesses each school on key criteria to provide a trustworthy guide for parents and identify top investment prospects.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {rankingCriteria.map(item => (
                <div key={item.title} className="text-center p-4">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-3">
                    <item.icon className="h-8 w-8 text-primary"/>
                  </div>
                  <h3 className="font-semibold text-lg text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          {loading && [...Array(5)].map((_, i) => <RankingCardSkeleton key={i} />)}
          
          {error && (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
              <Frown className="h-4 w-4" />
              <AlertTitle>Error Loading Rankings</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && schools.length > 0 && schools.map((school, index) => (
            <RankingCard key={school.id} school={school} rank={index + 1} />
          ))}

          {!loading && !error && schools.length === 0 && (
            <p className="text-center text-muted-foreground py-10">No schools available to rank currently.</p>
          )}
        </section>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          Disclaimer: Rankings are based on a combination of real data and illustrative criteria for demonstration purposes.
        </p>
      </div>
    </div>
  );
}
