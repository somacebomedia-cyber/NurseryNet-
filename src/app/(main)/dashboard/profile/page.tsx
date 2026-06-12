// src/app/(main)/dashboard/profile/page.tsx
import ProfileForm from './ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PreschoolProfilePage() {
    return (
        <Card className="shadow-lg glassmorphism">
            <CardHeader>
                <CardTitle className="text-3xl font-headline text-primary">Manage Your Preschool Profile</CardTitle>
                <CardDescription>This information will be displayed on your public profile. Fill out the form to create or update your school's details.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm />
            </CardContent>
        </Card>
    );
}
