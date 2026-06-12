
// src/app/(main)/dashboard/profile/ProfileForm.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp, collection, addDoc, serverTimestamp, query, where, getDocs, QueryDocumentSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, UploadCloud, Image as ImageIcon, Video as VideoIcon, FileText } from 'lucide-react';
import { preschoolProfileSchema, type PreschoolProfileFormData, type PreschoolData } from '@/lib/schemas/preschool';
import Image from 'next/image';
import slugify from 'slugify';

// Helper function to upload a file and get its URL
const uploadFile = async (file: File, id: string, path: string): Promise<string> => {
    if (!file || !file.name) {
        throw new Error("Invalid file provided for upload.");
    }
    const storageRef = ref(storage, `preschools/${id}/${path}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};


export default function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [preschoolDoc, setPreschoolDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [imagePreviews, setImagePreviews] = useState({
      logoUrl: '',
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      principalSignatureUrl: '',
      teacherSignatureUrl: '',
  });

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm<PreschoolProfileFormData>({
    resolver: zodResolver(preschoolProfileSchema),
  });
  
  const mapFirestoreToForm = (data: PreschoolData): PreschoolProfileFormData => {
    return {
        name: data.name,
        location: data.location,
        description: data.description,
        philosophy: data.philosophy,
        contactPhone: data.contact?.phone,
        contactEmail: data.contact?.email,
        website: data.contact?.website,
        hours: data.hours,
        ageGroup: data.ageGroup,
        features: data.features?.join('\n'),
        logoUrl: data.logo,
        imageUrl1: data.images?.[0]?.url,
        imageUrl2: data.images?.[1]?.url,
        imageUrl3: data.images?.[2]?.url,
        videoUrl1: data.videos?.[0]?.url,
        principalSignatureUrl: data.principalSignatureUrl,
        teacherSignatureUrl: data.teacherSignatureUrl,
        npoCertificateUrl: data.npoCertificateUrl,
        cipcDocumentUrl: data.cipcDocumentUrl,
        taxClearanceUrl: data.taxClearanceUrl,
        bankStatementUrl: data.bankStatementUrl,
    };
  };

  const loadProfile = useCallback(async (uid: string) => {
    setIsLoading(true);
    try {
      // Query for the preschool document where ownerId matches the user's UID
      const q = query(collection(db, "preschools"), where("ownerId", "==", uid), limit(1));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        setPreschoolDoc(docSnap); // Save the document snapshot
        const data = docSnap.data() as PreschoolData;
        const formData = mapFirestoreToForm(data);
        reset(formData); // Set form values
        
        // Set image previews
        setImagePreviews({
            logoUrl: data.logo || '',
            imageUrl1: data.images?.[0]?.url || '',
            imageUrl2: data.images?.[1]?.url || '',
            imageUrl3: data.images?.[2]?.url || '',
            principalSignatureUrl: data.principalSignatureUrl || '',
            teacherSignatureUrl: data.teacherSignatureUrl || '',
        });
      } else {
        // No profile found for this owner. They might need to create one.
        console.log("No preschool profile found for this owner.");
        toast({ title: 'Profile Not Found', description: "You don't have a preschool profile yet. Fill out and save this form to create one.", variant: 'default' });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({ title: 'Error', description: 'Could not load your profile data.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [reset, toast]);


  useEffect(() => {
    if (user?.uid) {
      loadProfile(user.uid);
    } else {
      setIsLoading(false);
    }
  }, [user, loadProfile]);
  
  const onSubmit = async (formData: PreschoolProfileFormData) => {
      if (!user) {
          toast({ title: 'Not Authenticated', description: 'You must be logged in to save.', variant: 'destructive'});
          return;
      }
      setIsSaving(true);
      try {
        // Use the stored document ID if it exists, otherwise use the user's UID for a new profile
        const preschoolId = preschoolDoc ? preschoolDoc.id : user.uid;
        const docRef = doc(db, 'preschools', preschoolId);

        // Handle file uploads
        const uploadIfNeeded = async (fileField: any, path: string) => {
            if (fileField && typeof fileField !== 'string' && fileField[0]) {
                return await uploadFile(fileField[0], preschoolId, path);
            }
            return fileField || null; // Return existing URL or null
        };
        
        const [
            logoUrl, imageUrl1, imageUrl2, imageUrl3, videoUrl1,
            principalSignatureUrl, teacherSignatureUrl, npoCertificateUrl,
            cipcDocumentUrl, taxClearanceUrl, bankStatementUrl
        ] = await Promise.all([
            uploadIfNeeded(formData.logoUrl, 'logo'),
            uploadIfNeeded(formData.imageUrl1, 'gallery'),
            uploadIfNeeded(formData.imageUrl2, 'gallery'),
            uploadIfNeeded(formData.imageUrl3, 'gallery'),
            uploadIfNeeded(formData.videoUrl1, 'videos'),
            uploadIfNeeded(formData.principalSignatureUrl, 'signatures'),
            uploadIfNeeded(formData.teacherSignatureUrl, 'signatures'),
            uploadIfNeeded(formData.npoCertificateUrl, 'compliance'),
            uploadIfNeeded(formData.cipcDocumentUrl, 'compliance'),
            uploadIfNeeded(formData.taxClearanceUrl, 'compliance'),
            uploadIfNeeded(formData.bankStatementUrl, 'compliance'),
        ]);

        // Construct the Firestore document
        const preschoolData: Partial<PreschoolData> = {
            ownerId: user.uid, // Always ensure ownerId is set/updated
            name: formData.name,
            slug: slugify(formData.name, { lower: true, strict: true }),
            location: formData.location,
            description: formData.description,
            philosophy: formData.philosophy,
            contact: {
                phone: formData.contactPhone,
                email: formData.contactEmail,
                website: formData.website,
            },
            hours: formData.hours,
            ageGroup: formData.ageGroup,
            features: formData.features?.split('\n').filter(f => f.trim() !== ''),
            logo: logoUrl,
            images: [imageUrl1, imageUrl2, imageUrl3].filter(url => url).map(url => ({ url, alt: `${formData.name} gallery image`, dataAiHint: "preschool image" })),
            videos: [videoUrl1].filter(url => url).map(url => ({ url })),
            principalSignatureUrl,
            teacherSignatureUrl,
            npoCertificateUrl,
            cipcDocumentUrl,
            taxClearanceUrl,
            bankStatementUrl,
            updatedAt: serverTimestamp(),
        };

        const isNewDoc = !preschoolDoc;
        if (isNewDoc) {
            preschoolData.createdAt = serverTimestamp();
        }

        await setDoc(docRef, preschoolData, { merge: true });

        toast({ title: 'Profile Saved!', description: 'Your preschool profile has been successfully updated.' });
        loadProfile(user.uid); // Refresh data after saving

      } catch (error: any) {
          console.error("Error saving profile:", error);
          toast({ title: 'Save Failed', description: error.message || 'An unexpected error occurred. Please check the console.', variant: 'destructive'});
      } finally {
          setIsSaving(false);
      }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading Your Profile...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
      {/* Basic Info */}
      <section>
        <h3 className="text-2xl font-headline font-semibold text-primary mb-4 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label htmlFor="name">Preschool Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location (Full Address)</Label>
                <Input id="location" {...register('location')} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
             <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">School Description</Label>
                <Textarea id="description" {...register('description')} rows={4} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            <div className="md:col-span-2 space-y-2">
                <Label htmlFor="philosophy">Our Philosophy / Mission</Label>
                <Textarea id="philosophy" {...register('philosophy')} rows={3} />
                {errors.philosophy && <p className="text-sm text-destructive">{errors.philosophy.message}</p>}
            </div>
        </div>
      </section>

      {/* Details Section */}
      <section>
        <h3 className="text-2xl font-headline font-semibold text-primary mb-4 border-b pb-2">Contact & Details</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input id="contactPhone" {...register('contactPhone')} />
                {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" {...register('contactEmail')} />
                {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <Input id="website" {...register('website')} />
                {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="hours">Opening Hours</Label>
                <Input id="hours" {...register('hours')} placeholder="e.g., Mon - Fri: 07:30 - 17:30"/>
                {errors.hours && <p className="text-sm text-destructive">{errors.hours.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
                <Input id="ageGroup" {...register('ageGroup')} placeholder="e.g., 18 months - 5 years"/>
                {errors.ageGroup && <p className="text-sm text-destructive">{errors.ageGroup.message}</p>}
            </div>
         </div>
      </section>

      {/* Features */}
       <section>
            <h3 className="text-2xl font-headline font-semibold text-primary mb-4 border-b pb-2">Key Features</h3>
            <div className="space-y-2">
                <Label htmlFor="features">List your school's key features (one per line)</Label>
                <Textarea id="features" {...register('features')} rows={6} placeholder="e.g., Play-based learning&#10;Large outdoor play area&#10;Nutritious daily meals"/>
                <p className="text-xs text-muted-foreground">Each line will become a separate feature point on your profile.</p>
                {errors.features && <p className="text-sm text-destructive">{errors.features.message}</p>}
            </div>
       </section>

      {/* Media Uploads */}
      <section>
        <h3 className="text-2xl font-headline font-semibold text-primary mb-4 border-b pb-2">Media & Branding</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                 <Label htmlFor="logoUrl">School Logo</Label>
                 <Input id="logoUrl" type="file" accept="image/*" {...register('logoUrl')} />
                 {imagePreviews.logoUrl && <Image src={imagePreviews.logoUrl} alt="Logo preview" width={80} height={80} className="mt-2 rounded-md border p-1" />}
                 {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
            </div>
             <div className="space-y-2">
                 <Label htmlFor="imageUrl1">Cover Photo (Main Image)</Label>
                 <Input id="imageUrl1" type="file" accept="image/*" {...register('imageUrl1')} />
                 {imagePreviews.imageUrl1 && <Image src={imagePreviews.imageUrl1} alt="Cover photo preview" width={120} height={80} className="mt-2 rounded-md border p-1 object-cover" />}
                 {errors.imageUrl1 && <p className="text-sm text-destructive">{errors.imageUrl1.message}</p>}
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <div className="space-y-2">
                 <Label htmlFor="imageUrl2">Gallery Image 2</Label>
                 <Input id="imageUrl2" type="file" accept="image/*" {...register('imageUrl2')} />
                 {imagePreviews.imageUrl2 && <Image src={imagePreviews.imageUrl2} alt="Gallery image 2 preview" width={120} height={80} className="mt-2 rounded-md border p-1 object-cover" />}
            </div>
            <div className="space-y-2">
                 <Label htmlFor="imageUrl3">Gallery Image 3</Label>
                 <Input id="imageUrl3" type="file" accept="image/*" {...register('imageUrl3')} />
                 {imagePreviews.imageUrl3 && <Image src={imagePreviews.imageUrl3} alt="Gallery image 3 preview" width={120} height={80} className="mt-2 rounded-md border p-1 object-cover" />}
            </div>
            <div className="space-y-2">
                <Label htmlFor="videoUrl1">Video Tour (Optional)</Label>
                <Input id="videoUrl1" type="file" accept="video/*" {...register('videoUrl1')} />
                {errors.videoUrl1 && <p className="text-sm text-destructive">{errors.videoUrl1.message}</p>}
            </div>
        </div>
      </section>

      {/* Compliance & Report Card Section */}
      <section>
        <h3 className="text-2xl font-headline font-semibold text-primary mb-4 border-b pb-2">Compliance & Report Card Assets</h3>
        <p className="text-sm text-muted-foreground mb-4">Upload documents for funding applications and assets for AI-generated report cards. These are stored securely and are not public.</p>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                 <Label htmlFor="teacherSignatureUrl">Teacher's Signature (for Report Cards)</Label>
                 <Input id="teacherSignatureUrl" type="file" accept="image/png, image/jpeg" {...register('teacherSignatureUrl')} />
                 {imagePreviews.teacherSignatureUrl && <Image src={imagePreviews.teacherSignatureUrl} alt="Teacher signature preview" width={120} height={60} className="mt-2 rounded-md border p-1 object-contain bg-white" />}
            </div>
             <div className="space-y-2">
                 <Label htmlFor="principalSignatureUrl">Principal's Signature (for Report Cards)</Label>
                 <Input id="principalSignatureUrl" type="file" accept="image/png, image/jpeg" {...register('principalSignatureUrl')} />
                 {imagePreviews.principalSignatureUrl && <Image src={imagePreviews.principalSignatureUrl} alt="Principal signature preview" width={120} height={60} className="mt-2 rounded-md border p-1 object-contain bg-white" />}
            </div>
            <div className="space-y-2">
                 <Label htmlFor="npoCertificateUrl">NPO Certificate (PDF)</Label>
                 <Input id="npoCertificateUrl" type="file" accept="application/pdf" {...register('npoCertificateUrl')} />
                 {errors.npoCertificateUrl && <p className="text-sm text-destructive">{errors.npoCertificateUrl.message}</p>}
            </div>
            <div className="space-y-2">
                 <Label htmlFor="cipcDocumentUrl">CIPC Document (PDF)</Label>
                 <Input id="cipcDocumentUrl" type="file" accept="application/pdf" {...register('cipcDocumentUrl')} />
                 {errors.cipcDocumentUrl && <p className="text-sm text-destructive">{errors.cipcDocumentUrl.message}</p>}
            </div>
             <div className="space-y-2">
                 <Label htmlFor="taxClearanceUrl">Tax Clearance (PDF)</Label>
                 <Input id="taxClearanceUrl" type="file" accept="application/pdf" {...register('taxClearanceUrl')} />
                 {errors.taxClearanceUrl && <p className="text-sm text-destructive">{errors.taxClearanceUrl.message}</p>}
            </div>
             <div className="space-y-2">
                 <Label htmlFor="bankStatementUrl">Bank Statement (PDF)</Label>
                 <Input id="bankStatementUrl" type="file" accept="application/pdf" {...register('bankStatementUrl')} />
                 {errors.bankStatementUrl && <p className="text-sm text-destructive">{errors.bankStatementUrl.message}</p>}
            </div>
         </div>
      </section>

      {/* Submit Button */}
      <div className="pt-6 border-t">
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5"/>}
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
}
