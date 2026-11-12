// src/app/signup/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ArrowRight,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function SignupPage() {
  const { brand } = useBrand();
  const { signup } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Preschool Owner');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(email, password, name, role);
      router.push(role === 'Preschool Owner' ? '/dashboard' : '/directory');
    } catch (err: any) {
      console.warn("Firebase auth fallback during demo signup:", err);
      // For sandbox / demo purposes, store a simulated session if Firebase credentials aren't active in build
      if (typeof window !== 'undefined') {
        localStorage.setItem('nurserynet_demo_user', JSON.stringify({ name, email, role }));
      }
      router.push(role === 'Preschool Owner' ? '/dashboard' : '/directory');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (selectedRole: UserRole) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nurserynet_demo_user', JSON.stringify({
        name: selectedRole === 'Preschool Owner' ? 'Principal Nomvula Khumalo' : 'Lerato Moloi (Parent)',
        email: 'demo@nurserynet.app',
        role: selectedRole
      }));
    }
    router.push(selectedRole === 'Preschool Owner' ? '/dashboard' : '/directory');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
          <UserPlus className="h-3.5 w-3.5" />
          <span>Join the {brand} Network</span>
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
        <Card className="border border-border/80 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Select Account Type</CardTitle>
            <CardDescription className="text-xs">
              Choose how you will use the platform
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
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
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
                <Label htmlFor="email" className="text-xs">Email Address</Label>
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

              <Button type="submit" disabled={loading} className="w-full font-semibold py-5">
                {loading ? 'Creating Account...' : `Sign Up as ${role}`}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">Or One-Click Demo Mode</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin('Preschool Owner')}
                className="text-xs"
              >
                Demo as Owner
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleDemoLogin('Parent')}
                className="text-xs"
              >
                Demo as Parent
              </Button>
            </div>
          </CardContent>

          <CardFooter className="pt-0 text-[11px] text-center text-muted-foreground flex justify-center">
            By signing up, you agree to the{' '}
            <Link href="/terms" className="underline ml-1 mr-1 text-primary">Terms</Link>
            and{' '}
            <Link href="/privacy" className="underline ml-1 text-primary">Privacy Policy</Link>.
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
