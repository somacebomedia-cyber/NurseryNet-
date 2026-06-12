// src/components/marketing/GrowthKitForm.tsx
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, { message: "Please enter your name." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormData = z.infer<typeof formSchema>;

export default function GrowthKitForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // In a real app, you would send this to your backend/email service.
    // For now, we'll just simulate success.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log("Form submitted:", data);
    
    toast({
      title: "Success!",
      description: "Your Free Resources are on their way to your inbox.",
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-500/10 border-green-500/30 text-center p-6">
        <CardContent className="p-0">
          <h3 className="text-xl font-semibold text-green-700">Thank You!</h3>
          <p className="text-green-600/90 mt-2">Check your email for the download link to all our free resources. Welcome to the NurseryNet community!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-sm mx-auto">
      <div className="space-y-2">
        <Label htmlFor="name">Your Name</Label>
        <Input id="name" {...register("name")} placeholder="e.g., Jane Doe" />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Your Email</Label>
        <Input id="email" type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <Button type="submit" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Download className="mr-2 h-5 w-5" />}
        Get Instant Access
      </Button>
      <p className="text-xs text-muted-foreground text-center pt-2">
        By submitting, you'll also receive our high-value monthly WhatsApp newsletter!
      </p>
    </form>
  );
}
