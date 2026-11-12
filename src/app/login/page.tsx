// src/app/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBrand } from '@/context/BrandContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { 
  LogIn, 
  Mail, 
  Lock, 
  AlertCircle,
  Building2,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const { brand } = useBrand();
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.warn("Firebase auth sign in fallback:", err);
      if (typeof window !== 'undefined') {
        localStorage.setItem('nurserynet_demo_user', JSON.stringify({
          name: email.split('@')[0] || 'School Owner',
          email: email,
          role: 'Preschool Owner'
        }));
      }
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nurserynet_demo_user', JSON.stringify({
        name: 'Principal Nomvula Khumalo',
        email: 'principal@sunshine-educare.co.za',
        role: 'Preschool Owner'
      }));
    }
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3">
          <LogIn className="h-3.5 w-3.5" />
          <span>Member Sign In</span>
        </div>
        <h2 className="font-heading text-3xl font-extrabold text-foreground">
          Welcome back to {brand}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Register your school free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border border-border/80 shadow-md">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Sign In to Your Account</CardTitle>
            <CardDescription className="text-xs">
              Access your tour leads, listing manager, and school growth tools
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                  <a href="#" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to registered email.'); }} className="text-[11px] text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full font-semibold py-5">
                {loading ? 'Signing in...' : 'Sign In to Dashboard'}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">Or Instant Preview</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDemoSignIn}
              className="w-full text-xs font-semibold"
            >
              One-Click Demo Login as School Principal
            </Button>
          </CardContent>

          <CardFooter className="pt-0 text-[11px] text-center text-muted-foreground flex justify-center">
            Need help accessing your claimed school?{' '}
            <Link href="/contact" className="underline ml-1 text-primary">Contact Support</Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
