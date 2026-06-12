// src/ai/flows/find-funding-opportunities.ts
'use server';
/**
 * @fileOverview An AI agent that finds funding opportunities for educational institutions.
 *
 * - findFundingOpportunities - A function that searches for funding opportunities.
 * - FindFundingInput - The input type for the function.
 * - FindFundingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';
import { format } from 'date-fns';
import { FindFundingInputSchema, FindFundingOutputSchema, type FindFundingInput, type FindFundingOutput } from '@/ai/schemas/funding-schemas';

export type { FindFundingInput, FindFundingOutput };

export async function findFundingOpportunities(
  input: FindFundingInput
): Promise<any> { // Return type is now 'any' to pass raw JSON
  return findFundingFlow(input);
}

const findFundingFlow = ai.defineFlow(
  {
    name: 'findFundingFlow',
    inputSchema: FindFundingInputSchema,
    outputSchema: z.any(), // The flow now outputs any data, not validated against a strict schema.
  },
  async (input) => {
    // Get the current date dynamically.
    const todaysDate = format(new Date(), 'MMMM d, yyyy');

    const llmResponse = await ai.generate({
      model: googleAI.model('gemini-1.5-flash'),
      prompt: `You are an expert funding research agent for the South African education sector. A user is looking for funding. Based on their query, your task is to generate a list of 5 to 7 relevant and realistic-sounding funding opportunities.

      It is CRITICAL that the deadlines are in the future from today's date, which is ${todaysDate}. The opportunities must sound current and plausible.
      
      User Query: "${input.query}"
      
      Your response MUST be a raw JSON object string enclosed in markdown backticks (\`\`\`json ... \`\`\`). Do not include any other text or explanation. The JSON object must conform to a structure with a single key "opportunities", which is an array of funding opportunity objects.
      
      Each opportunity object must contain the following fields: 'id' (string, unique), 'category' (enum: 'Government', 'Private', 'International'), 'deadlineInfo' (string, optional), 'title' (string), 'providerName' (string), 'providerTypeIcon' (enum: 'Landmark', 'Building2', 'Globe'), 'fundingAmount' (string), 'deadlineDate' (string), 'location' (string), 'metaIcon' (enum, optional: 'Users', 'Laptop', 'Presentation'), 'metaText' (string, optional), 'description' (string), 'requirements' (array of 3 strings), and 'detailsLink' (string, URL, optional).`,
    });

    const rawText = llmResponse.text;
    if (!rawText) {
      throw new Error("The AI returned an empty response.");
    }
    
    // Find the JSON block within the markdown
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : rawText;

    // We no longer parse or validate here. We return the raw string.
    try {
        const parsed = JSON.parse(jsonString);
        return parsed;
    } catch (e) {
      console.error("JSON parsing error in flow, but returning raw string:", e);
      // Even if parsing fails, we might still send the raw string to the client to handle.
      return jsonString; 
    }
  }
);
