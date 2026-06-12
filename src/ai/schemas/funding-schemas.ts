// src/ai/schemas/funding-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI funding finder flow.
 */
import { z } from 'zod';

export const FindFundingInputSchema = z.object({
  preschoolName: z.string().describe("The name of the user's preschool."),
  query: z.string().describe("The user's specific funding request (e.g., 'grants for playground equipment')."),
  fundingNeeds: z.string().describe("A brief description of what the school needs funding for and why."),
  location: z.string().optional().describe("The city or province where the preschool is located."),
  registrationStatus: z.string().optional().describe("The school's legal or registration status (e.g., 'Registered NPO', 'Private Company')."),
});
export type FindFundingInput = z.infer<typeof FindFundingInputSchema>;

export type LucideIconName = 
  | "Building2" | "Globe" | "School" | "Landmark" | "Factory" // for provider types
  | "Users" | "Laptop" | "Presentation" | "FlaskConical" | "Utensils";

export const FundingOpportunitySchema = z.object({
    id: z.string().optional(),
    category: z.enum(['Government', 'Private', 'International']).optional(),
    deadlineInfo: z.string().optional(),
    title: z.string().optional(),
    providerName: z.string().optional(),
    providerTypeIcon: z.enum(["Building2", "Globe", "School", "Landmark", "Factory"]).optional(),
    fundingAmount: z.string().optional(),
    deadlineDate: z.string().optional(),
    location: z.string().optional(),
    metaIcon: z.enum(["Users", "Laptop", "Presentation", "FlaskConical", "Utensils"]).optional(),
    metaText: z.string().optional(),
    description: z.string().optional(),
    requirements: z.array(z.string()).optional(),
    detailsLink: z.string().url().optional(),
  }).refine(data => data.title && data.providerName && data.description, {
    message: "Opportunity must have at least a title, provider name, and description.",
  });

export const FindFundingOutputSchema = z.object({
  opportunities: z.array(FundingOpportunitySchema),
});
export type FindFundingOutput = z.infer<typeof FindFundingOutputSchema>;
