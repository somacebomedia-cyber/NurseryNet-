'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { LogIn, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { brand } = useBrand();
  const { login, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle('Preschool Owner');
      toast({
        title: 'Signed in with Google',
        description: 'Your verified account is ready for preschool claiming and management.',
      });
      router.push('/directory');
    } catch (err: any) {
      const code = err?.code || '';
      if (code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-in could not be completed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError('Email/password login is not enabled on this project. Please use Continue with Google above.');
      } else {
        setError('Invalid email or password. Use Continue with Google for instant verified access.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Enter your email address first to receive a password reset link.');
      return;
    }
    try {
      await resetPassword(email.trim());
      toast({
        title: 'Password reset sent',
        description: `If an account exists for ${email.trim()}, a reset link has been emailed.`,
      });
    } catch {
      setError('Password reset is unavailable. Please sign in with Google.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified Account Access</span>
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground">
          Sign in to {brand}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          New to {brand}?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Verified Sign In</CardTitle>
            <CardDescription className="text-xs">
              Use Google Sign-In to claim preschool listings, manage your owner portal, or access the admin review queue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              <span>{googleLoading ? 'Connecting Google Account...' : 'Continue with Google'}</span>
            </Button>

            <p className="text-[11px] text-muted-foreground text-center">
              Tip: Sign in with your official school Google Workspace email (e.g. principal@yourschool.co.za) for instant domain ownership verification.
            </p>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or sign in with email</span>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="principal@school.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="outline" disabled={loading} className="w-full h-10 font-semibold">
                {loading ? 'Signing in...' : 'Sign In with Email'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 text-[11px] text-center text-muted-foreground flex justify-center">
            Disputing a claimed school?{' '}
            <Link href="/directory" className="underline ml-1 text-primary">
              Find your listing in Directory
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
