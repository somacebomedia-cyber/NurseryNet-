'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { UserPlus, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const { brand } = useBrand();
  const { signup, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Preschool Owner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle(role);
      toast({
        title: 'Account Verified & Ready',
        description: `Signed in as ${role}. You can now claim and verify your preschool listing.`,
      });
      router.push(role === 'Preschool Owner' ? '/directory' : '/directory');
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(err?.message || 'Google sign-up could not be completed. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(email, password, name, role);
      router.push(role === 'Preschool Owner' ? '/dashboard' : '/directory');
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/operation-not-allowed') {
        setError('Email/password signup is disabled on this project. Please use Continue with Google above.');
      } else {
        setError(err?.message || 'Could not create account. Please use Continue with Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified {brand} Registration</span>
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground">
          Create your free account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Select Account Role</CardTitle>
            <CardDescription className="text-xs">
              Ownership claims require a verified account to protect preschool listings from unauthorized edits.
            </CardDescription>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {(['Preschool Owner', 'Parent', 'Job Seeker'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-1 text-[11px] font-semibold rounded-lg border text-center transition-colors ${
                    role === r
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {r === 'Preschool Owner' ? 'School Owner' : r}
                </button>
              ))}
            </div>
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
              onClick={handleGoogleSignup}
              className="w-full h-11 font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              <span>
                {googleLoading
                  ? 'Connecting Google...'
                  : `Continue with Google as ${role === 'Preschool Owner' ? 'School Owner' : role}`}
              </span>
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px]">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or register with email</span>
              </div>
            </div>

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Your Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Nomvula Khumalo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Official Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nomvula@school.co.za"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" variant="outline" disabled={loading} className="w-full h-10 font-semibold">
                {loading ? 'Creating Account...' : `Sign Up with Email`}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 text-[11px] text-center text-muted-foreground flex justify-center">
            By continuing, you agree to the{' '}
            <Link href="/terms" className="underline ml-1 mr-1 text-primary">Terms</Link>
            and{' '}
            <Link href="/privacy" className="underline ml-1 text-primary">Privacy Policy</Link>.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
