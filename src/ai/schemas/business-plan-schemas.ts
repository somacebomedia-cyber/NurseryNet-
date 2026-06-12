// src/ai/schemas/business-plan-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI business plan generation flow.
 */
import { z } from 'zod';

export const GenerateBusinessPlanInputSchema = z.object({
  preschoolName: z.string().describe("The name of the preschool."),
  description: z.string().describe("A brief description of the preschool's services, target market, and what makes it unique."),
  philosophy: z.string().describe("The educational philosophy and mission of the preschool."),
  keyFeatures: z.array(z.string()).describe("A list of key features or unique selling points (e.g., 'Large outdoor play area', 'Small class sizes')."),
  numberOfStaff: z.number().optional().describe("The current or projected number of staff members."),
  monthlyFee: z.number().describe("The average monthly fee per student."),
  studentCapacity: z.number().describe("The total student capacity of the preschool."),
});
export type GenerateBusinessPlanInput = z.infer<typeof GenerateBusinessPlanInputSchema>;


export const GenerateBusinessPlanOutputSchema = z.object({
  title: z.string().describe("The title of the business plan, typically 'Business Plan for [Preschool Name]'."),
  executiveSummary: z.string().describe("A concise overview of the entire business plan, highlighting the mission, services, and key objectives."),
  missionStatement: z.string().describe("A clear and inspiring mission statement for the preschool."),
  companyDescription: z.string().describe("A detailed description of the preschool, its legal structure (if known), and its history or goals."),
  servicesOffered: z.string().describe("A description of the educational programs, age groups served, and any additional services like aftercare or meals."),
  marketAnalysis: z.string().describe("A brief analysis of the target market (parents and children in the local area) and the need for quality early childhood education."),
  marketingStrategy: z.string().describe("An outline of how the preschool will attract and retain students, mentioning key features and community engagement."),
  financialProjection: z.string().describe("A simple, high-level monthly and annual revenue projection based on full capacity and the provided monthly fee."),
});
export type GenerateBusinessPlanOutput = z.infer<typeof GenerateBusinessPlanOutputSchema>;
