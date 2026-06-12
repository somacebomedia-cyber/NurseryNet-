
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2, Mail, Phone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAuth, RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";


declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(['Parent', 'Preschool Owner', 'Job Seeker'], { required_error: "You must select a role."}),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup, signInWithPhone } = useAuth();
  const { toast } = useToast();
  const auth = getAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });
  
  const [phoneName, setPhoneName] = useState("");
  const [phoneRole, setPhoneRole] = useState<UserRole | "">("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneIsLoading, setPhoneIsLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved
        }
      });
    }
  }, [auth]);

  const onEmailSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data.email, data.password, data.name, data.role);
      toast({
        title: "Account Created",
        description: "Welcome to NurseryNet! You are now logged in.",
      });
      router.push("/dashboard"); 
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = error.message || "An unknown error occurred.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered. Please log in instead.";
      }
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneName || phoneName.length < 2) {
      toast({ title: "Invalid Name", description: "Please enter your full name.", variant: "destructive" });
      return;
    }
    if (!phoneRole) {
      toast({ title: "Role Required", description: "Please select whether you are a Parent or a Preschool Owner.", variant: "destructive" });
      return;
    }
    if (!phone || phone.length < 9) {
      toast({ title: "Invalid Phone Number", description: "Please enter a valid South African phone number.", variant: "destructive" });
      return;
    }
    setPhoneIsLoading(true);
    try {
      const phoneNumber = `+27${phone.slice(-9)}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhone(phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setIsOtpSent(true);
      toast({ title: "OTP Sent", description: `A verification code has been sent to ${phoneNumber}.` });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({ title: "Failed to send OTP", description: "Please try again. Ensure the phone number is correct and the page has been refreshed.", variant: "destructive" });
    } finally {
      setPhoneIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !confirmationResult) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }
    setPhoneIsLoading(true);
    try {
      const userCredential = await confirmationResult.confirm(otp);
      const user = userCredential.user;
      
      // Save additional user info to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: phoneName,
        phoneNumber: user.phoneNumber,
        role: phoneRole,
        createdAt: serverTimestamp()
      });

      toast({ title: "Account Created", description: "Welcome to NurseryNet! You are now logged in." });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({ title: "Signup Failed", description: "The verification code is incorrect. Please try again.", variant: "destructive" });
    } finally {
      setPhoneIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl glassmorphism">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-primary">Create Your Account</CardTitle>
        <CardDescription>Join NurseryNet to find or grow your preschool.</CardDescription>
      </CardHeader>
      <CardContent>
         <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email"><Mail className="mr-2 h-4 w-4"/> Email</TabsTrigger>
                <TabsTrigger value="phone"><Phone className="mr-2 h-4 w-4"/> Phone</TabsTrigger>
            </TabsList>
            <TabsContent value="email">
                <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="e.g., Jane Doe" {...register("name")} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" {...register("password")} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="role">I am a...</Label>
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="role">
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Parent">Parent</SelectItem>
                                    <SelectItem value="Preschool Owner">Preschool Owner</SelectItem>
                                    <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                  </Button>
                </form>
            </TabsContent>
            <TabsContent value="phone">
                 <div className="space-y-6 pt-4">
                    {!isOtpSent ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone-name">Full Name</Label>
                                <Input id="phone-name" placeholder="e.g., Jane Doe" value={phoneName} onChange={(e) => setPhoneName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone-role">I am a...</Label>
                                <Select onValueChange={(value: UserRole) => setPhoneRole(value)} value={phoneRole}>
                                    <SelectTrigger id="phone-role">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Parent">Parent</SelectItem>
                                        <SelectItem value="Preschool Owner">Preschool Owner</SelectItem>
                                        <SelectItem value="Job Seeker">Job Seeker</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="flex items-center">
                                    <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-background/50 text-sm text-muted-foreground">+27</span>
                                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="72 123 4567" className="rounded-l-none" />
                                </div>
                            </div>
                            <Button onClick={handleSendOtp} className="w-full" disabled={phoneIsLoading}>
                                {phoneIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Verification Code"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter Verification Code</Label>
                            <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} />
                            <Button onClick={handleVerifyOtp} className="w-full" disabled={phoneIsLoading}>
                                {phoneIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Create Account"}
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </p>
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
}
