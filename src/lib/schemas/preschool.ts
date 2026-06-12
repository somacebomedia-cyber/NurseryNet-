// src/lib/schemas/preschool.ts
import { z } from 'zod';

// Helper function for optional file schemas
const fileSchema = (maxSize: number, types: string[]) => z.any()
  .optional()
  .refine(files => !files || files.length === 0 || files?.[0]?.size <= maxSize, `Max file size is ${maxSize / 1000000}MB.`)
  .refine(
    files => !files || files.length === 0 || types.includes(files?.[0]?.type),
    `Only ${types.join(', ')} formats are supported.`
  );

const imageFileSchema = fileSchema(5000000, ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const videoFileSchema = fileSchema(50000000, ['video/mp4', 'video/webm', 'video/quicktime']);
const documentFileSchema = fileSchema(10000000, ['application/pdf']);


export const preschoolProfileSchema = z.object({
  // Basic Info - Only name is strictly required
  name: z.string().min(3, { message: "Preschool name must be at least 3 characters." }),
  location: z.string().optional(),
  
  // Details
  description: z.string().optional(),
  philosophy: z.string().optional(),
  
  // Contact Info - all optional
  contactPhone: z.string().optional(),
  contactEmail: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid website URL (e.g., https://example.com)" }).optional().or(z.literal('')),

  // Practical Info
  hours: z.string().optional(),
  ageGroup: z.string().optional(),
  
  // Features (as a single string, to be split later)
  features: z.string().optional(),
  
  // Media - all optional
  logoUrl: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  imageUrl1: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  imageUrl2: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  imageUrl3: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  videoUrl1: z.union([z.string().url().optional().or(z.literal('')), videoFileSchema]).optional(),
  videoUrl2: z.union([z.string().url().optional().or(z.literal('')), videoFileSchema]).optional(),

  // Signatures
  principalSignatureUrl: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  teacherSignatureUrl: z.union([z.string().url().optional().or(z.literal('')), imageFileSchema]).optional(),
  
  // Compliance Documents
  npoCertificateUrl: z.union([z.string().url().optional().or(z.literal('')), documentFileSchema]).optional(),
  cipcDocumentUrl: z.union([z.string().url().optional().or(z.literal('')), documentFileSchema]).optional(),
  taxClearanceUrl: z.union([z.string().url().optional().or(z.literal('')), documentFileSchema]).optional(),
  bankStatementUrl: z.union([z.string().url().optional().or(z.literal('')), documentFileSchema]).optional(),
});

export type PreschoolProfileFormData = z.infer<typeof preschoolProfileSchema>;

// This represents the nested structure we'll actually use in Firestore
export interface PreschoolData {
    ownerId: string;
    slug?: string;
    name: string;
    location?: string;
    description?: string;
    philosophy?: string;
    contact: {
        phone?: string;
        email?: string;
        website?: string;
    };
    hours?: string;
    ageGroup?: string;
    features?: string[];
    logo?: string;
    images?: { url: string; alt: string; dataAiHint: string; }[];
    videos?: { url: string; }[];
    principalSignatureUrl?: string;
    teacherSignatureUrl?: string;
    // Compliance Document URLs
    npoCertificateUrl?: string;
    cipcDocumentUrl?: string;
    taxClearanceUrl?: string;
    bankStatementUrl?: string;
    // Timestamps
    createdAt: any;
    updatedAt: any;
}
