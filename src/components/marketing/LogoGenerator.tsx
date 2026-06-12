
"use client";

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles, Wand2, Film, Lock, Download, Upload } from 'lucide-react';
import Image from 'next/image';
import { generatePreschoolLogo, GeneratePreschoolLogoInput, GeneratePreschoolLogoOutput } from '@/ai/flows/generate-preschool-logo';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const generateSchema = z.object({
  businessName: z.string().min(2, { message: "Business name must be at least 2 characters." }),
});
type GenerateFormData = z.infer<typeof generateSchema>;

const animateSchema = z.object({
  logoFile: z.instanceof(FileList).refine(files => files?.length > 0, "A logo file is required."),
});
type AnimateFormData = z.infer<typeof animateSchema>;

interface ResultState {
    logoDataUri: string;
    description?: string;
    isAnimation: boolean;
}

export default function LogoGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAnimateUploading, setIsAnimateUploading] = useState(false);

  const generateForm = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
  });

  const animateForm = useForm<AnimateFormData>({
    resolver: zodResolver(animateSchema),
  });

  const isCreativeMember = (user?.planId === 'creative' || user?.planId === 'growth') && user?.subscriptionStatus === 'active';
  const isGrowthMember = user?.planId === 'growth' && user?.subscriptionStatus === 'active';
  
  const canGenerate = isCreativeMember || !user;
  const canAnimate = isGrowthMember || !user;


  const handleGenerateSubmit: SubmitHandler<GenerateFormData> = async (data) => {
    setIsLoading(true);
    setResult(null);
    setError(null);

    const input: GeneratePreschoolLogoInput = { businessName: data.businessName };

    try {
      const output = await generatePreschoolLogo(input);
      setResult({ ...output, isAnimation: false });
      toast({ title: "Success!", description: "Your new logo has been generated." });
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || "An error occurred while generating the logo.";
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAnimateSubmit: SubmitHandler<AnimateFormData> = async (data) => {
    if (!user) {
        toast({ title: "Please log in", description: "You must be logged in to submit a logo.", variant: "destructive" });
        return;
    }
    setIsAnimateUploading(true);
    setError(null);

    try {
        const file = data.logoFile[0];
        const storageRef = ref(storage, `logo-animation-requests/${user.uid}/${Date.now()}-${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadResult.ref);

        await addDoc(collection(db, "logoAnimationRequests"), {
            userId: user.uid,
            userEmail: user.email,
            userName: user.name,
            logoUrl: downloadURL,
            status: 'pending',
            submittedAt: serverTimestamp(),
        });
        
        toast({
          title: "Logo Uploaded!",
          description: "Our team has received your logo. Your animation will be ready and emailed to you within 12 hours.",
        });
        animateForm.reset();

    } catch(e: any) {
        console.error("Error submitting logo for animation:", e);
        const errorMessage = "There was an error uploading your logo. Please try again.";
        setError(errorMessage);
        toast({ title: "Upload Failed", description: errorMessage, variant: "destructive" });
    } finally {
        setIsAnimateUploading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.logoDataUri;
    const fileExtension = result.isAnimation ? 'gif' : 'png';
    link.download = `nurserynet-logo.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const UpgradePrompt = ({ featureName, requiredPlan }: {featureName: string, requiredPlan: string}) => (
      <Card className="w-full max-w-md mx-auto mt-6 text-center bg-primary/5">
            <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 mb-4">
                    <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">Exclusive {requiredPlan} Feature</CardTitle>
                <CardDescription>
                    {featureName} is a premium tool for our subscribers.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground mb-4">Upgrade your plan to unlock this powerful feature.</p>
                 <Button asChild>
                    <Link href="/pricing">View Pricing Plans</Link>
                </Button>
            </CardContent>
        </Card>
  );


  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl glassmorphism">
      <CardHeader>
        <div className="flex items-center space-x-2 mb-2">
          <Wand2 className="h-8 w-8 text-primary" />
          <CardTitle className="text-3xl">AI Logo Magic</CardTitle>
        </div>
        <CardDescription>
          Generate a stunning new logo or have us animate your existing one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate"><Sparkles className="mr-2 h-4 w-4"/>Generate New</TabsTrigger>
                <TabsTrigger value="animate"><Film className="mr-2 h-4 w-4"/>Animate Existing</TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="pt-6">
                {canGenerate ? (
                    <form onSubmit={generateForm.handleSubmit(handleGenerateSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="businessName" className="text-lg">Preschool Name</Label>
                            <Input id="businessName" {...generateForm.register("businessName")} placeholder="e.g., Little Stars Academy" className="text-base"/>
                            {generateForm.formState.errors.businessName && <p className="text-sm text-destructive">{generateForm.formState.errors.businessName.message}</p>}
                        </div>
                        <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-primary hover:bg-primary/90">
                            {isLoading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Sparkles className="mr-2 h-6 w-6" />}
                            Generate My Logo!
                        </Button>
                    </form>
                ) : (
                    <UpgradePrompt featureName="AI Logo Generation" requiredPlan="Creative Canvas" />
                )}
            </TabsContent>
            <TabsContent value="animate" className="pt-6">
                 {canAnimate ? (
                    <form onSubmit={animateForm.handleSubmit(handleAnimateSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="logoFile" className="text-lg">Upload Your Logo</Label>
                            <p className="text-sm text-muted-foreground">Submit your existing logo and our design team will create a beautiful, professional animation for you. Your animated logo will be delivered to your email within 12 hours.</p>
                            <Input id="logoFile" type="file" {...animateForm.register("logoFile")} accept="image/png, image/jpeg, image/svg+xml" className="text-base file:text-primary file:font-semibold"/>
                            {animateForm.formState.errors.logoFile && <p className="text-sm text-destructive">{animateForm.formState.errors.logoFile.message}</p>}
                        </div>
                        <Button type="submit" disabled={isAnimateUploading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90">
                            {isAnimateUploading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Upload className="mr-2 h-6 w-6" />}
                            {isAnimateUploading ? 'Uploading...' : 'Submit for Animation'}
                        </Button>
                    </form>
                 ) : (
                    <UpgradePrompt featureName="Logo Animation" requiredPlan="Growth Navigator" />
                 )}
            </TabsContent>
        </Tabs>
      </CardContent>

      {(error || result) && (
        <CardFooter className="flex flex-col items-center space-y-4 pt-4">
            {error && (
            <Alert variant="destructive" className="w-full">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
            )}
            {result && (
            <div className="w-full p-6 border border-primary/20 rounded-lg bg-primary/5 text-center">
                <h3 className="text-2xl font-headline font-semibold mb-4 text-primary">
                { result.isAnimation ? "Here's your Animated Logo!" : "Here's your New Logo!"}
                </h3>
                {result.logoDataUri && (
                <div className="mb-4 bg-white p-4 rounded-md inline-block shadow-md">
                    <Image src={result.logoDataUri} alt="Generated or Animated Logo" width={200} height={200} className="rounded-md" />
                </div>
                )}
                {result.description && (
                  <p className="text-muted-foreground italic">&quot;{result.description}&quot;</p>
                )}
                <Button onClick={handleDownload} variant="outline" className="mt-4">
                  <Download className="mr-2 h-4 w-4" />
                  Download {result.isAnimation ? 'GIF' : 'PNG'}
                </Button>
            </div>
            )}
        </CardFooter>
      )}
    </Card>
  );
}

    