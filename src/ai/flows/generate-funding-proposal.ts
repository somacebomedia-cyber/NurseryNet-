// src/ai/flows/generate-funding-proposal.ts
'use server';
/**
 * @fileOverview An AI agent that generates a funding proposal.
 *
 * - generateFundingProposal - A function that creates a structured proposal.
 * - GenerateFundingProposalInput - The input type for the function.
 * - GenerateFundingProposalOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import { GenerateFundingProposalInputSchema, GenerateFundingProposalOutputSchema, type GenerateFundingProposalInput, type GenerateFundingProposalOutput } from '@/ai/schemas/funding-proposal-schemas';

export type { GenerateFundingProposalInput, GenerateFundingProposalOutput };

const fundingProposalPrompt = ai.definePrompt({
    name: 'generateFundingProposalPrompt',
    input: { schema: GenerateFundingProposalInputSchema },
    output: { schema: GenerateFundingProposalOutputSchema },
    system: `You are a professional grant writer with expertise in the education sector. Your task is to generate a compelling and well-structured funding proposal.

You will be given details about the preschool seeking funding and the specific funding opportunity they are targeting.

Your proposal must be structured with the following sections:
1.  **title**: Create a clear title, e.g., "Funding Proposal for [Preschool Name]'s Playground Upgrade".
2.  **introduction**: Briefly introduce the preschool and state the purpose of the proposal.
3.  **problemStatement**: Clearly articulate the challenge the preschool faces that this funding will solve. Use the 'fundingNeeds' from the input.
4.  **proposedSolution**: Describe exactly how the funds will be used to address the problem. Connect this directly to the 'fundingNeeds' and the preschool's mission.
5.  **alignmentWithFunder**: This is a critical section. Explain how the preschool's project aligns with the funding provider's mission and goals (using 'funderDescription' and 'funderName'). Show you understand them.
6.  **budgetOverview**: Provide a simple, high-level overview of how the funds will be allocated.
7.  **conclusion**: End with a strong, concise summary that reiterates the impact of the potential grant.

The tone should be professional, persuasive, and passionate.

Preschool Details:
- Name: {{{preschool.name}}}
- Location: {{{preschool.location}}}
- Description & Mission: {{{preschool.fundingNeeds}}}
- Registration Status: {{{preschool.registrationStatus}}}

Funding Opportunity Details:
- Funder Name: {{{fundingOpportunity.organization}}}
- Funder Description: {{{fundingOpportunity.description}}}
- Funding Name: {{{fundingOpportunity.fundingName}}}
`,
});

export async function generateFundingProposal(input: GenerateFundingProposalInput): Promise<GenerateFundingProposalOutput> {
    const { output } = await fundingProposalPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate the funding proposal. Please check your inputs and try again.");
    }
    return output;
}
