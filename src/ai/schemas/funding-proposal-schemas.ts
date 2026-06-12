// src/ai/schemas/funding-proposal-schemas.ts
/**
 * @fileOverview Shared Zod schemas for the AI funding proposal generation flow.
 */
import { z } from 'zod';
import { FindFundingInputSchema } from './funding-schemas';

// We reuse parts of the existing funding schemas
const PreschoolInfoForProposalSchema = FindFundingInputSchema.pick({
    preschoolName: true,
    location: true,
    registrationStatus: true,
    fundingNeeds: true,
}).transform(data => ({
    name: data.preschoolName,
    location: data.location,
    registrationStatus: data.registrationStatus,
    fundingNeeds: data.fundingNeeds,
}));

const FundingOpportunityForProposalSchema = z.object({
  fundingName: z.string(),
  organization: z.string(),
  description: z.string(),
});

export const GenerateFundingProposalInputSchema = z.object({
  preschool: PreschoolInfoForProposalSchema.describe("The details of the preschool applying for funding."),
  fundingOpportunity: FundingOpportunityForProposalSchema.describe("The details of the funding opportunity being targeted."),
});
export type GenerateFundingProposalInput = z.infer<typeof GenerateFundingProposalInputSchema>;


export const GenerateFundingProposalOutputSchema = z.object({
  title: z.string().describe("A clear and descriptive title for the proposal."),
  introduction: z.string().describe("A brief introductory paragraph introducing the preschool and the purpose of the proposal."),
  problemStatement: z.string().describe("A section detailing the challenge or need the funding will address."),
  proposedSolution: z.string().describe("A section describing how the funds will be used to solve the problem."),
  alignmentWithFunder: z.string().describe("A crucial section explaining how the project aligns with the funder's goals and mission."),
  budgetOverview: z.string().describe("A high-level summary of how the requested funds will be allocated."),
  conclusion: z.string().describe("A strong concluding paragraph summarizing the project's potential impact."),
});
export type GenerateFundingProposalOutput = z.infer<typeof GenerateFundingProposalOutputSchema>;
