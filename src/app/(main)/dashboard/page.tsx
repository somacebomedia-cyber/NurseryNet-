
'use client';
import { useState } from 'react';
import ProfileForm from './profile/ProfileForm';
import GalleryForm from './gallery/GalleryForm';
import DocumentsForm from './documents/DocumentsForm';
import SettingsForm from './settings/SettingsForm';
import { RequireRole } from '@/lib/authGuard';
import { Info, Shield } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InstitutionDashboard from './InstitutionDashboard';
import { useAuth } from '@/context/AuthContext';
import UserDashboard from './UserDashboard';
import JobSeekerDashboard from '@/components/dashboard/JobSeekerDashboard';

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
      return <div>Loading...</div>
  }

  // Admin section for bulk import
  const AdminSection = () => (
    <Card className="mb-10 shadow-lg glassmorphism bg-amber-500/10 border-amber-600/30">
        <CardHeader>
            <CardTitle className="text-xl text-amber-700 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Admin Tools
            </CardTitle>
            <CardDescription>
            Administrative tools have been temporarily disabled to ensure a successful deployment.
            </CardDescription>
        </CardHeader>
        <CardContent>
           <p className="text-sm text-muted-foreground">The bulk import tool will be restored shortly.</p>
        </CardContent>
    </Card>
  );

  // This handles the case where the user is not logged in.
  // It shows the InstitutionDashboard as a generic fallback.
  if (!user) {
    return <InstitutionDashboard />;
  }
  
  // Render specific dashboards based on the logged-in user's role.
  switch (user.role) {
    case 'admin':
    case 'Preschool Owner':
      return (
        <div>
          {user.role === 'admin' && <AdminSection />}
          <InstitutionDashboard />
        </div>
      );
    case 'Parent':
      return <UserDashboard />;
    case 'Job Seeker':
      return <JobSeekerDashboard />;
    default:
      // Fallback for any unknown roles, though this shouldn't be reached
      // with a properly configured system.
      return (
        <div>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your user role is not recognized. Please contact support.</AlertDescription>
          </Alert>
        </div>
      );
  }
}
