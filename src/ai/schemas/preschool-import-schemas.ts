// src/ai/schemas/preschool-import-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI preschool bulk import flow.
 */
import { z } from 'zod';

// Defines the structure of a single preschool record for import.
// This is flexible to allow for various columns from a CSV.
export const PreschoolRecordSchema = z.record(z.any()).and(
  z.object({
    name: z.string().min(1, 'Preschool name is required.'),
    location: z.string().min(1, 'Location is required.'),
    slug: z.string().optional(), // The slug will be generated
    ownerId: z.string().optional(), // The ownerId will be added
  })
);

// Defines the input for the bulk import flow.
export const PreschoolImportInputSchema = z.object({
  userId: z.string().describe('The ID of the user performing the import.'),
  preschools: z.array(PreschoolRecordSchema).describe('An array of preschool data records to import.'),
});
export type PreschoolImportInput = z.infer<typeof PreschoolImportInputSchema>;

// Defines the output of the bulk import flow.
export const PreschoolImportOutputSchema = z.object({
  successCount: z.number().describe('The number of records successfully imported.'),
  failedCount: z.number().describe('The number of records that failed to import.'),
  errors: z.array(z.string()).optional().describe('A list of any errors that occurred during the import process.'),
});
export type PreschoolImportOutput = z.infer<typeof PreschoolImportOutputSchema>;
