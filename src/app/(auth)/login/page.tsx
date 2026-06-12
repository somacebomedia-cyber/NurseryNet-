
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { Loader2, Mail, Phone } from "lucide-react";
import { getAuth, RecaptchaVerifier, type ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const router = useRouter();
  const { login, signInWithPhone, resetPassword } = useAuth();
  const { toast } = useToast();
  const auth = getAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneIsLoading, setPhoneIsLoading] = useState(false);

  useEffect(() => {
    // This effect should run only once to initialize reCAPTCHA
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth]);

  const onEmailSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = error.message || "An unknown error occurred.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please try again.";
      }
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const email = document.getElementById('email') as HTMLInputElement;
    if (!email || !email.value) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsResetting(true);
    try {
      await resetPassword(email.value);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset Failed",
        description: error.message || "Could not send reset email.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  const handleSendOtp = async () => {
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
      await confirmationResult.confirm(otp);
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("OTP verification error:", error);
      toast({ title: "Login Failed", description: "The verification code is incorrect. Please try again.", variant: "destructive" });
    } finally {
      setPhoneIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl glassmorphism">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl text-primary">Welcome Back!</CardTitle>
        <CardDescription>Log in to access your NurseryNet dashboard.</CardDescription>
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
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="px-0 font-normal h-auto text-xs" 
                        onClick={handleResetPassword}
                        disabled={isResetting}
                      >
                        {isResetting ? "Sending..." : "Forgot password?"}
                      </Button>
                    </div>
                    <Input id="password" type="password" {...register("password")} />
                    {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Log In"}
                  </Button>
                </form>
            </TabsContent>
            <TabsContent value="phone">
                 <div className="space-y-6 pt-4">
                    {!isOtpSent ? (
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="flex items-center">
                                <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-background/50 text-sm text-muted-foreground">+27</span>
                                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="72 123 4567" className="rounded-l-none" />
                            </div>
                            <Button onClick={handleSendOtp} className="w-full" disabled={phoneIsLoading}>
                                {phoneIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Verification Code"}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter Verification Code</Label>
                            <Input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6}/>
                            <Button onClick={handleVerifyOtp} className="w-full" disabled={phoneIsLoading}>
                                {phoneIsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Log In"}
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </p>
        <div id="recaptcha-container"></div>
      </CardContent>
    </Card>
  );
}
