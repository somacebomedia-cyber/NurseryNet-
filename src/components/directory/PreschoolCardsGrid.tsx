'use client';

import { motion, useReducedMotion, type Variants } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Star, ArrowRight, Sparkles } from 'lucide-react';
import type { PreschoolData } from '@/lib/schemas/preschool';

export interface SchoolWithId extends Partial<PreschoolData> {
  id: string;
  name: string;
  location?: string;
  city?: string;
  description?: string;
  rating?: number;
  reviewCount?: number;
  features?: string[];
  images?: { url: string; alt?: string; dataAiHint?: string }[];
}

interface PreschoolCardsGridProps {
  schools: SchoolWithId[];
  cityQuery?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1], // ease-out cubic
    },
  },
};

const reducedContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02,
    },
  },
};

const reducedCardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
};

export default function PreschoolCardsGrid({ schools, cityQuery }: PreschoolCardsGridProps) {
  const prefersReducedMotion = useReducedMotion();

  // Create an animation key based on current search and school IDs so search result updates re-trigger the staggered entrance
  const animationKey = `grid-${cityQuery || 'all'}-${schools.map((s) => s.id).join('-')}`;

  const currentContainerVariants = prefersReducedMotion ? reducedContainerVariants : containerVariants;
  const currentCardVariants = prefersReducedMotion ? reducedCardVariants : cardVariants;

  return (
    <motion.div
      key={animationKey}
      variants={currentContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
    >
      {schools.map((school, index) => {
        const placeholderImg = `https://picsum.photos/seed/${encodeURIComponent(school.id || `school-${index}`)}/600/340`;
        const mainImage = school.images?.[0]?.url || placeholderImg;
        const rating = typeof school.rating === 'number' ? school.rating : undefined;
        const reviewCount = typeof school.reviewCount === 'number' ? school.reviewCount : undefined;

        return (
          <motion.div
            key={school.id}
            variants={currentCardVariants}
            className="h-full flex flex-col"
          >
            <Link
              href={`/directory/${school.id}`}
              className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl transition-transform"
            >
              <Card className="h-full flex flex-col overflow-hidden border border-border/70 bg-card hover:border-primary/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 ease-out">
                {/* Image preview with smooth hover scale */}
                <div className="relative w-full h-48 overflow-hidden bg-muted">
                  <Image
                    src={mainImage}
                    alt={school.name || 'Preschool photograph'}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Rating display over image or subtle top bar */}
                  {rating !== undefined && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{rating.toFixed(1)}</span>
                      {reviewCount !== undefined && (
                        <span className="text-white/80">({reviewCount})</span>
                      )}
                    </div>
                  )}

                  {school.city && (
                    <div className="absolute bottom-3 left-3 text-white text-xs font-medium drop-shadow-md flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-white/90" />
                      <span>{school.city}</span>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2 pt-4 px-5">
                  <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {school.name}
                  </CardTitle>
                  {school.location && (
                    <CardDescription className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                      <span>{school.location}</span>
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                    {school.description || 'Welcome to this quality early childhood education center nurturing young minds and fostering exploration.'}
                  </p>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs font-medium text-primary">
                    <span className="group-hover:underline">Explore preschool</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
