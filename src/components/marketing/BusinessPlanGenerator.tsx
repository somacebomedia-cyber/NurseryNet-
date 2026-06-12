// src/components/marketing/BusinessPlanGenerator.tsx
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, FileText, Info, Lock, Copy } from 'lucide-react';
import { generateBusinessPlan, type GenerateBusinessPlanOutput } from '@/ai/flows/generate-business-plan';
import { GenerateBusinessPlanInputSchema, type GenerateBusinessPlanInput } from '@/ai/schemas/business-plan-schemas';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

// Use a schema that expects a string for the form, and we'll convert it before sending to the AI.
const BusinessPlanFormSchema = GenerateBusinessPlanInputSchema.extend({
    keyFeatures: z.string().min(1, "Please list at least one feature."),
});
type BusinessPlanFormData = z.infer<typeof BusinessPlanFormSchema>;


export default function BusinessPlanGenerator() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateBusinessPlanOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessPlanFormData>({
    resolver: zodResolver(BusinessPlanFormSchema),
    defaultValues: {
      preschoolName: "Sunshine Kids Academy",
      description: "A mid-sized preschool located in a suburban area, focusing on providing high-quality, play-based learning for children aged 2-5. We aim to serve working families in the community.",
      philosophy: "Our mission is to nurture curious minds and compassionate hearts through a child-led, play-based curriculum in a safe and inclusive environment.",
      keyFeatures: "Play-based Learning\nSmall Class Sizes\nNutritious Meals Included\nLarge Outdoor Play Area",
      numberOfStaff: 8,
      monthlyFee: 3500,
      studentCapacity: 50,
    }
  });

  const onSubmit: SubmitHandler<BusinessPlanFormData> = async (data) => {
    if (!user) {
        toast({
            title: "Developer Preview",
            description: "Request submitted. In a live environment, this is a premium feature."
        });
    }
    
    setIsLoading(true);
    setResult(null);
    setError(null);

    // Convert the single string of key features into an array for the AI flow
    const submissionData: GenerateBusinessPlanInput = {
        ...data,
        keyFeatures: data.keyFeatures.split('\n').filter(feature => feature.trim() !== ''),
    };

    try {
      const output = await generateBusinessPlan(submissionData);
      setResult(output);
      toast({ title: "Business Plan Generated!", description: "Your foundational business plan is ready." });
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || "An error occurred while generating the business plan.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (textToCopy: string, sectionName: string) => {
    navigator.clipboard.writeText(textToCopy);
    toast({ description: `Copied ${sectionName} to clipboard!` });
  };
  
  const isGrowthMember = user?.planId === 'growth' && user.subscriptionStatus === 'active';
  if (user && user.role === 'Preschool Owner' && !isGrowthMember) {
    return (
        <Card className="w-full max-w-2xl mx-auto shadow-2xl glassmorphism">
            <CardHeader className="text-center">
                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Exclusive Growth Navigator Feature</CardTitle>
                <CardDescription className="text-lg">
                    The AI Business Plan Generator is a premium tool available to our Growth Navigator subscribers.
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                 <p className="text-muted-foreground mb-6">Upgrade your plan to unlock this powerful feature and create a business plan in minutes.</p>
                 <Button asChild size="lg">
                    <Link href="/pricing">View Pricing Plans</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl">Business Plan Details</CardTitle>
        <CardDescription>
          Provide the core details of your preschool. The more specific you are, the better the generated plan will be.
        </CardDescription>
        {!user && (
            <Alert variant="default" className="bg-primary/5 border-primary/20 mt-4">
              <Info className="h-5 w-5 text-primary" />
              <AlertTitle className="text-primary font-semibold">Developer Preview</AlertTitle>
              <AlertDescription className="text-foreground/80">
                This is a premium tool for Growth Navigator subscribers. You are viewing it in developer mode, pre-filled with sample data.
              </AlertDescription>
            </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preschoolName">Preschool Name</Label>
              <Input id="preschoolName" {...register("preschoolName")} />
              {errors.preschoolName && <p className="text-sm text-destructive">{errors.preschoolName.message}</p>}
            </div>
             <div className="space-y-2">
              <Label htmlFor="philosophy">Mission / Philosophy</Label>
              <Input id="philosophy" {...register("philosophy")} />
              {errors.philosophy && <p className="text-sm text-destructive">{errors.philosophy.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">School Description</Label>
            <Textarea id="description" {...register("description")} placeholder="Describe your school, its services, and target audience." />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyFeatures">Key Features (one per line)</Label>
            <Textarea id="keyFeatures" {...register("keyFeatures")} placeholder="Play-based learning&#10;Large outdoor area..." />
            {errors.keyFeatures && <p className="text-sm text-destructive">{errors.keyFeatures.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label htmlFor="numberOfStaff">Number of Staff</Label>
                <Input id="numberOfStaff" type="number" {...register("numberOfStaff", { valueAsNumber: true })} />
                {errors.numberOfStaff && <p className="text-sm text-destructive">{errors.numberOfStaff.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="monthlyFee">Avg. Monthly Fee (R)</Label>
                <Input id="monthlyFee" type="number" {...register("monthlyFee", { valueAsNumber: true })} />
                {errors.monthlyFee && <p className="text-sm text-destructive">{errors.monthlyFee.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="studentCapacity">Student Capacity</Label>
                <Input id="studentCapacity" type="number" {...register("studentCapacity", { valueAsNumber: true })} />
                {errors.studentCapacity && <p className="text-sm text-destructive">{errors.studentCapacity.message}</p>}
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <FileText className="mr-2 h-6 w-6" />}
            Generate Business Plan
          </Button>
        </form>
      </CardContent>
      {result && (
        <CardFooter className="flex flex-col items-start space-y-4 pt-6 text-black">
             <h3 className="text-2xl font-headline font-semibold text-primary w-full text-center">{result.title}</h3>
             <div className="w-full space-y-4 rounded-lg bg-white p-6 shadow-inner">
                {Object.entries(result).map(([key, value]) => {
                    if (key === 'title') return null;
                    const sectionTitle = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    return (
                        <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-lg font-bold text-gray-800">{sectionTitle}</h4>
                                <Button variant="ghost" size="sm" onClick={() => handleCopyText(value, sectionTitle)}>
                                    <Copy className="h-4 w-4 mr-1"/> Copy
                                </Button>
                            </div>
                            <p className="text-base text-gray-700 whitespace-pre-wrap">{value}</p>
                        </div>
                    );
                })}
             </div>
        </CardFooter>
      )}
    </Card>
  );
}
