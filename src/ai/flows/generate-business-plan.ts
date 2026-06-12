// src/ai/flows/generate-business-plan.ts
'use server';
/**
 * @fileOverview An AI agent that generates a business plan for a preschool.
 *
 * - generateBusinessPlan - A function that creates a structured business plan.
 * - GenerateBusinessPlanInput - The input type for the function.
 * - GenerateBusinessPlanOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { GenerateBusinessPlanInputSchema, GenerateBusinessPlanOutputSchema, type GenerateBusinessPlanInput, type GenerateBusinessPlanOutput } from '@/ai/schemas/business-plan-schemas';

export type { GenerateBusinessPlanInput, GenerateBusinessPlanOutput };

const businessPlanPrompt = ai.definePrompt({
    name: 'generateBusinessPlanPrompt',
    input: { schema: GenerateBusinessPlanInputSchema },
    output: { schema: GenerateBusinessPlanOutputSchema },
    system: `You are an expert business consultant specializing in the early childhood education sector. Your task is to generate a simple, clear, and professional business plan for a preschool based on the provided details. The tone should be confident and well-structured, suitable for a funding application.

Preschool Details:
- Name: {{{preschoolName}}}
- Description: {{{description}}}
- Philosophy: {{{philosophy}}}
- Key Features:
{{#each keyFeatures}}
- {{{this}}}
{{/each}}
{{#if numberOfStaff}}
- Staff Count: {{{numberOfStaff}}}
{{/if}}
- Monthly Fee: {{{monthlyFee}}}
- Student Capacity: {{{studentCapacity}}}

Based on these details, generate the following sections for the business plan and adhere strictly to the JSON output format:

1.  **title**: Create a title like "Business Plan for {{{preschoolName}}}".
2.  **executiveSummary**: Write a compelling one-paragraph summary. It should cover the preschool's mission, the services it offers, its target market, and its potential for success.
3.  **missionStatement**: Use the provided philosophy to craft an inspiring mission statement.
4.  **companyDescription**: Expand on the provided description to detail what the preschool is, its goals, and its unique position in the community.
5.  **servicesOffered**: Detail the educational programs for different age groups and mention any special features or extra services.
6.  **marketAnalysis**: Briefly describe the target market (e.g., working parents in the area) and the importance of quality ECD services.
7.  **marketingStrategy**: Suggest how the school will attract students, referencing its key features.
8.  **financialProjection**: Calculate a simple financial projection.
    -   Calculate Monthly Revenue at full capacity (studentCapacity * monthlyFee).
    -   Calculate Annual Revenue (Monthly Revenue * 12).
    -   Present this in a clear sentence, e.g., "At full capacity of {{studentCapacity}} students, the projected monthly revenue is [Calculated Amount], leading to a projected annual revenue of [Calculated Amount]."
`,
});

export async function generateBusinessPlan(input: GenerateBusinessPlanInput): Promise<GenerateBusinessPlanOutput> {
    const { output } = await businessPlanPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate the business plan. Please check your inputs and try again.");
    }
    return output;
}
