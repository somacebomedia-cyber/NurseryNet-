// src/components/profile/PublicProfileView.tsx
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { MapPin, Phone, Clock, Users, Palette, CheckCircle, Award, Sparkles, Send, Loader2, Video, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PreschoolData } from "@/lib/schemas/preschool";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { useBrand } from '@/context/BrandContext';
import { brandQueryParam } from '@/components/layout/Navbar';

interface PublicProfileViewProps {
  preschool: PreschoolData & { id?: string }; // Make ID optional as it might not be there on preview
  showBackButton?: boolean; // To conditionally show the "Back to Directory" button
}

const inquirySchema = z.object({
  parentName: z.string().min(2, 'Please enter your name.'),
  parentEmail: z.string().email('Please enter a valid email address.'),
  message: z.string().min(10, 'Your message must be at least 10 characters.'),
});

type InquiryFormData = z.infer<typeof inquirySchema>;

export default function PublicProfileView({ preschool, showBackButton = false }: PublicProfileViewProps) {
  const { brand } = useBrand();
  const bqp = brandQueryParam(brand);
  const mainImage = preschool.images?.[0] ?? { url: "https://picsum.photos/seed/main/800/500", alt: "Preschool classroom", dataAiHint: "classroom children" };
  const galleryImages = preschool.images?.slice(1) ?? [];
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Mocking that this preschool has a story. In a real app, this would come from a data fetch.
  const hasStory = true; 

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InquiryFormData>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmitInquiry = async (data: InquiryFormData) => {
    if (!preschool.id) {
       toast({
        title: 'Error',
        description: 'Cannot send inquiry. Preschool ID is missing.',
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      // Use the passed preschool.id instead of ownerId for more flexibility
      await addDoc(collection(db, 'inquiries'), {
        preschoolId: preschool.id, 
        preschoolName: preschool.name,
        parentName: data.parentName,
        parentEmail: data.parentEmail,
        message: data.message,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      toast({
        title: 'Message Sent!',
        description: `Your inquiry has been sent to ${preschool.name}.`,
      });
      reset();
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: 'Error',
        description: 'Could not send your message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-2xl overflow-hidden glassmorphism max-w-5xl mx-auto">
      <CardHeader className="p-0 relative">
        <Image 
          src={mainImage.url} 
          alt={mainImage.alt} 
          data-ai-hint={mainImage.dataAiHint}
          width={800} 
          height={400} 
          className="w-full h-64 md:h-96 object-cover" 
          priority // Add priority for LCP
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8">
          <div className="flex items-start space-x-4">
            {preschool.logo && (
              <Dialog open={isStoryOpen} onOpenChange={setIsStoryOpen}>
                <DialogTrigger asChild>
                   <button className="relative outline-none">
                    {hasStory && <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-pulse"></div>}
                    <Image 
                      src={preschool.logo} 
                      alt={`${preschool.name} Logo`} 
                      data-ai-hint="preschool logo"
                      width={100} 
                      height={100} 
                      className="relative rounded-full border-4 border-background bg-background shadow-lg cursor-pointer transform hover:scale-110 transition-transform" 
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="p-0 bg-black border-none max-w-md w-full h-[80vh] overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{preschool.name}'s Story</DialogTitle>
                    </DialogHeader>
                   <Image src="https://picsum.photos/seed/story/400/700" alt="Preschool story" data-ai-hint="children learning" layout="fill" objectFit="contain" className="p-2"/>
                   <div className="absolute top-4 left-4 flex items-center gap-2">
                       <Image src={preschool.logo} alt="logo" width={40} height={40} className="rounded-full border-2 border-white"/>
                       <p className="text-white font-bold text-lg drop-shadow-md">{preschool.name}</p>
                   </div>
                   <DialogClose asChild>
                       <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-white hover:bg-white/20 hover:text-white rounded-full">
                           <X/>
                       </Button>
                   </DialogClose>
                </DialogContent>
              </Dialog>
            )}
            <div>
              <h1 className="font-headline text-3xl md:text-5xl font-bold text-primary-foreground">
                {preschool.name}
              </h1>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="font-headline text-2xl font-semibold text-primary mb-3 flex items-center"><Palette className="w-6 h-6 mr-2"/>About Us</h2>
            <p className="text-foreground/90 text-lg leading-relaxed">{preschool.description}</p>
          </section>
          <section>
            <h2 className="font-headline text-2xl font-semibold text-primary mb-3 flex items-center"><Award className="w-6 h-6 mr-2"/>Our Philosophy</h2>
            <p className="text-foreground/90 text-lg italic">&quot;{preschool.philosophy}&quot;</p>
          </section>
          <section>
            <h2 className="font-headline text-2xl font-semibold text-primary mb-4 flex items-center"><Sparkles className="w-6 h-6 mr-2"/>Key Features</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {preschool.features?.map((feature, index) => (
                <li key={index} className="flex items-center text-foreground/80">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
          {galleryImages.length > 0 && (
              <section>
                <h2 className="font-headline text-2xl font-semibold text-primary mb-3">Photo Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {galleryImages.map((img, idx) => (
                    <Image key={idx} src={img.url} alt={img.alt || `${preschool.name} gallery image ${idx + 1}`} data-ai-hint={img.dataAiHint} width={200} height={150} className="rounded-lg object-cover w-full h-32 md:h-40 shadow-md hover:scale-105 transition-transform" />
                ))}
                </div>
            </section>
          )}
           {preschool.videos && preschool.videos.length > 0 && (
              <section>
                <h2 className="font-headline text-2xl font-semibold text-primary mb-3 flex items-center"><Video className="w-6 h-6 mr-2"/>Video Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {preschool.videos.map((video, idx) => (
                    <div key={idx} className="aspect-video w-full rounded-lg overflow-hidden shadow-md">
                        <video
                            className="w-full h-full"
                            src={video.url}
                            controls
                            title={`Preschool video ${idx + 1}`}
                        />
                    </div>
                ))}
                </div>
            </section>
          )}
        </div>

        {/* Sidebar with Contact Info etc. */}
        <aside className="space-y-6 md:border-l md:pl-8 border-border/50">
          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center"><MapPin className="w-5 h-5 mr-2"/>Location & Hours</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-2">
              <p>{preschool.location}</p>
              <p className="flex items-center"><Clock className="w-4 h-4 mr-2"/>{preschool.hours}</p>
              <p className="flex items-center"><Users className="w-4 h-4 mr-2"/>Ages: {preschool.ageGroup}</p>
            </CardContent>
          </Card>
            <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center"><Phone className="w-5 h-5 mr-2"/>Direct Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="text-foreground/80 space-y-2">
              {preschool.contact?.phone && <p><a href={`tel:${preschool.contact.phone}`} className="hover:underline">{preschool.contact.phone}</a></p>}
              {preschool.contact?.email && <p><a href={`mailto:${preschool.contact.email}`} className="hover:underline">{preschool.contact.email}</a></p>}
              {preschool.contact?.website && <p><a href={preschool.contact.website} target="_blank" rel="noopener noreferrer" className="hover:underline">{preschool.contact.website}</a></p>}
            </CardContent>
          </Card>
           <Card className="bg-accent/10">
            <CardHeader>
              <CardTitle className="text-xl text-accent-foreground flex items-center"><Send className="w-5 h-5 mr-2"/>Send a Message</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmitInquiry)} className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="parent-name" className="text-accent-foreground/80">Your Name</Label>
                        <Input id="parent-name" {...register('parentName')} placeholder="e.g., Jane Doe" />
                        {errors.parentName && <p className="text-sm text-destructive">{errors.parentName.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="parent-email" className="text-accent-foreground/80">Your Email</Label>
                        <Input id="parent-email" type="email" {...register('parentEmail')} placeholder="you@example.com" />
                         {errors.parentEmail && <p className="text-sm text-destructive">{errors.parentEmail.message}</p>}
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="parent-message" className="text-accent-foreground/80">Your Message</Label>
                        <Textarea id="parent-message" {...register('message')} placeholder="Hi, I'd like to learn more about..." />
                         {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
                    </div>
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                        {isSubmitting ? 'Sending...' : 'Send Inquiry'}
                    </Button>
                </form>
            </CardContent>
          </Card>
          {showBackButton && (
            <div className="text-center">
              <Button variant="outline" asChild>
                <Link href={`/directory?${bqp}`}>Back to Directory</Link>
              </Button>
            </div>
          )}
        </aside>
      </CardContent>
    </Card>
  );
}
